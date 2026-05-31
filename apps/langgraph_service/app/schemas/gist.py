from pydantic import BaseModel, Field


class DailyGistOutput(BaseModel):
    gist: str = Field(description="2-3 sentence daily health summary")
    readiness_score: int = Field(ge=0, le=100, description="0-100 readiness score")