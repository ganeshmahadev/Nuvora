import json


def format_sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def format_sse_event(event_type: str, data: dict) -> str:
    payload = {"type": event_type, **data}
    return f"data: {json.dumps(payload)}\n\n"