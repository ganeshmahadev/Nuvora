from pydantic import BaseModel, Field


class SubstituteRecommendation(BaseModel):
    source_food: str = Field(description="Original food name")
    substitute_food: str = Field(description="Healthier alternative name")
    reason: str = Field(description="Why this substitute is better")
    metric_label: str = Field(description="The metric being improved, e.g. 'Sodium'")
    source_metric_value: float = Field(description="Original metric value")
    substitute_metric_value: float = Field(description="Substitute metric value")
    pct_reduction: float = Field(description="Percentage reduction")
    natural_language_explanation: str = Field(description="Plain English explanation of the swap")