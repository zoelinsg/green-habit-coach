from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/analyze", response_model=HabitAnalysisResponse)
def analyze_habits(payload: HabitInput):
    return {
        "score": 72,
        "summary": "Your current lifestyle shows moderate environmental impact, with the biggest opportunities in transportation, cooling, and disposable item reduction.",
        "top_issues": [
            "Transportation habits create consistent carbon emissions.",
            "Air conditioning usage may be higher than necessary.",
            "Disposable item usage can be reduced with reusable alternatives."
        ],
        "suggestions": [
            "Try replacing one commute each week with public transport or walking.",
            "Reduce air conditioning by one hour per day where possible.",
            "Carry a reusable bottle or utensils to reduce single-use waste."
        ],
        "challenge_plan": [
            "Day 1: Bring your own bottle.",
            "Day 2: Skip one disposable item.",
            "Day 3: Reduce AC use by one hour.",
            "Day 4: Recycle all household waste today.",
            "Day 5: Eat one lower-impact meal.",
            "Day 6: Walk for one short trip.",
            "Day 7: Reflect on the easiest habit to continue."
        ]
    }