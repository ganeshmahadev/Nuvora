from pydantic import BaseModel, Field
from typing import Literal


INSIGHT_CATEGORIES = [
    "daily_gist",
    "smart_substitute",
    "protein_nudge",
    "sleep_hygiene",
    "activity_recommendation",
    "goal_calibration",
    "pattern_detection",
    "water_hydration",
    "weight_trend",
    "meal_nutrition",
]


class InsightGenerateRequest(BaseModel):
    category: Literal[
        "daily_gist",
        "smart_substitute",
        "protein_nudge",
        "sleep_hygiene",
        "activity_recommendation",
        "goal_calibration",
        "pattern_detection",
        "water_hydration",
        "weight_trend",
        "meal_nutrition",
    ]
    reference_date: str | None = None
    force_regenerate: bool = False


class InsightData(BaseModel):
    title: str = Field(description="Short, memorable insight title")
    body: str = Field(description="2-3 sentence insight body, referencing user data")
    recommendation: str | None = Field(default=None, description="Specific actionable recommendation")
    structured_data: dict | None = Field(default=None, description="Any structured data like scores, progress bars, etc.")


class InsightResponse(BaseModel):
    id: str
    category: str
    title: str
    body: str
    recommendation: str | None = None
    structured_data: dict | None = None
    generation_status: str
    reference_date: str | None = None
    created_at: str


class InsufficientDataResponse(BaseModel):
    status: Literal["insufficient_data"]
    category: str
    hint: str
    log_count: int
    min_required: int