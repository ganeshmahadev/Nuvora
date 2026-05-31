from pydantic import BaseModel, Field


class SleepProtocol(BaseModel):
    title: str = Field(description="Protocol title, e.g. 'Dim Blue Light 90 min Before Bed'")
    action: str = Field(description="Specific action to take")
    rationale: str = Field(description="Why this protocol helps, based on the user's data")