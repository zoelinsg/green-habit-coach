from pydantic import BaseModel
from typing import List


class HabitInput(BaseModel):
    transport_mode: str
    transport_days_per_week: int
    red_meat_meals_per_week: int
    ac_hours_per_day: int
    disposable_items_per_week: int
    recycle_habit: str
    bring_own_bottle: bool
    bring_own_bag: bool
    shopping_frequency_per_week: int
    electricity_saving_awareness: str
    notes: str = ""


class HabitAnalysisResponse(BaseModel):
    score: int
    summary: str
    top_issues: List[str]
    suggestions: List[str]
    challenge_plan: List[str]