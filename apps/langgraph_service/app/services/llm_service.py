from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from pydantic import BaseModel
from pathlib import Path
import structlog

from app.config import settings

log = structlog.get_logger()

_openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
_anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


class LLMCallError(Exception):
    pass


class AllProvidersFailedError(LLMCallError):
    pass


def _parse_model_string(model_str: str) -> tuple[str, str]:
    provider, model = model_str.split(":", 1)
    return provider, model


async def load_prompt(name: str) -> str:
    prompt_path = PROMPTS_DIR / f"{name}.md"
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt not found: {prompt_path}")
    return prompt_path.read_text(encoding="utf-8")


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((Exception,)),
    reraise=True,
)
async def _call_openai(prompt: str, model: str, schema: type[BaseModel] | None = None, inputs: dict | None = None) -> dict:
    messages = [{"role": "user", "content": prompt}]
    if inputs:
        messages[0]["content"] = prompt.replace("{{inputs}}", str(inputs))

    kwargs = {"model": model, "messages": messages}
    if schema:
        kwargs["response_format"] = {"type": "json_object"}

    response = await _openai_client.chat.completions.create(**kwargs)
    return response.choices[0].message.content


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((Exception,)),
    reraise=True,
)
async def _call_anthropic(prompt: str, model: str, inputs: dict | None = None) -> str:
    content = prompt
    if inputs:
        content = prompt.replace("{{inputs}}", str(inputs))

    response = await _anthropic_client.messages.create(
        model=model,
        max_tokens=2048,
        messages=[{"role": "user", "content": content}],
    )
    return response.content[0].text


async def structured_call(
    prompt: str,
    schema: type[BaseModel],
    inputs: dict | None = None,
) -> BaseModel:
    primary_provider, primary_model = _parse_model_string(settings.PRIMARY_LLM)
    fallback_provider, fallback_model = _parse_model_string(settings.FALLBACK_LLM)

    try:
        if primary_provider == "openai":
            raw = await _call_openai(prompt, primary_model, schema=schema, inputs=inputs)
            return schema.model_validate_json(raw) if isinstance(raw, str) else schema.model_validate(raw)
        else:
            raw = await _call_anthropic(prompt, primary_model, inputs=inputs)
            return schema.model_validate_json(raw)
    except Exception as e:
        log.warning("llm.primary_failed", provider=primary_provider, error=str(e))

    try:
        if fallback_provider == "openai":
            raw = await _call_openai(prompt, fallback_model, schema=schema, inputs=inputs)
            return schema.model_validate_json(raw) if isinstance(raw, str) else schema.model_validate(raw)
        else:
            raw = await _call_anthropic(prompt, fallback_model, inputs=inputs)
            return schema.model_validate_json(raw)
    except Exception as e:
        log.error("llm.all_providers_failed", error=str(e))
        raise AllProvidersFailedError(f"All LLM providers failed: {e}")