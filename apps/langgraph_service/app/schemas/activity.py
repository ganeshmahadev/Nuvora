from pydantic import BaseModel, Field
from typing import Literal


class ActivityRecommendation(BaseModel):
    workout_type: str = Field(description="Recommended workout type")
    intensity: Literal["recover", "maintain", "push"] = Field(description="Recommended intensity bucket")
    duration_minutes: int = Field(description="Recommended duration in minutes")
    rationale: str = Field(description="Why this workout is recommended, referencing sleep and load data")