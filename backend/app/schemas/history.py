from pydantic import BaseModel
from typing import List
from datetime import datetime


class HistoryItem(BaseModel):
    id: int
    score: int
    summary: str
    top_issues: List[str]
    suggestions: List[str]
    challenge_plan: List[str]
    created_at: datetime

    class Config:
        from_attributes = True