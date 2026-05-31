from pydantic import BaseModel, Field


class GoalProposal(BaseModel):
    proposed_calorie_target: int | None = Field(default=None, description="Proposed daily calorie target")
    proposed_water_target_ml: int | None = Field(default=None, description="Proposed daily water target in ml")
    proposed_protein_target_g: float | None = Field(default=None, description="Proposed daily protein target in grams")
    delta_rationale: str = Field(description="What changed and why")