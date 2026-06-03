from typing import TypedDict, Any
from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    key_metrics: dict[str, Any] = Field(default_factory=dict)
    patterns: list[str] = Field(default_factory=list)
    anomalies: list[str] = Field(default_factory=list)


class InsightState(TypedDict):
    user_id: str
    category: str
    reference_date: str
    logs: list[dict]
    profile: dict | None
    context: dict
    analysis: dict | None
    insight: dict | None
    error: str | None
    insufficient_data: bool
