from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json

from app.core.auth import require_auth
from app.db import get_db, init_db
from app.models import HabitRecord
from app.schemas.habit import HabitAnalysisResponse, HabitInput
from app.services.analysis_service import analyze_habits
from app.services.backboard_service import create_thread, send_message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://gen-lang-client-0378020510.web.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/me")
def me(user=Depends(require_auth)):
    return {
        "sub": user.get("sub"),
        "email": user.get("email"),
        "name": user.get("name"),
    }


@app.post("/api/analyze", response_model=HabitAnalysisResponse)
def analyze(
    payload: HabitInput,
    user=Depends(require_auth),
    db: Session = Depends(get_db),
):
    result = analyze_habits(payload.model_dump(), use_gemini=False)

    record = HabitRecord(
        user_sub=user.get("sub"),
        transport_mode=payload.transport_mode,
        transport_days_per_week=payload.transport_days_per_week,
        red_meat_meals_per_week=payload.red_meat_meals_per_week,
        ac_hours_per_day=payload.ac_hours_per_day,
        disposable_items_per_week=payload.disposable_items_per_week,
        recycle_habit=payload.recycle_habit,
        bring_own_bottle=payload.bring_own_bottle,
        bring_own_bag=payload.bring_own_bag,
        shopping_frequency_per_week=payload.shopping_frequency_per_week,
        electricity_saving_awareness=payload.electricity_saving_awareness,
        notes=payload.notes,
        score=result["score"],
        summary=result["summary"],
        top_issues=json.dumps(result["top_issues"], ensure_ascii=False),
        suggestions=json.dumps(result["suggestions"], ensure_ascii=False),
        challenge_plan=json.dumps(result["challenge_plan"], ensure_ascii=False),
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return result


@app.get("/api/history")
def get_history(
    user=Depends(require_auth),
    db: Session = Depends(get_db),
):
    records = (
        db.query(HabitRecord)
        .filter(HabitRecord.user_sub == user.get("sub"))
        .order_by(HabitRecord.created_at.desc())
        .all()
    )

    return [
        {
            "id": record.id,
            "score": record.score,
            "summary": record.summary,
            "top_issues": json.loads(record.top_issues),
            "suggestions": json.loads(record.suggestions),
            "challenge_plan": json.loads(record.challenge_plan),
            "created_at": record.created_at.isoformat(),
        }
        for record in records
    ]


class CoachMessageInput(BaseModel):
    message: str


@app.post("/api/coach/thread")
def create_coach_thread(user=Depends(require_auth)):
    try:
        thread_id = create_thread()
        return {"thread_id": thread_id}
    except Exception as e:
        print("create_coach_thread error:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create coach thread: {str(e)}",
        )


@app.post("/api/coach/message")
def coach_message(
    thread_id: str,
    payload: CoachMessageInput,
    user=Depends(require_auth),
):
    try:
        reply = send_message(
            thread_id=thread_id,
            user_message=payload.message,
        )
        return {"reply": reply}
    except Exception as e:
        print("coach_message error:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get coach reply: {str(e)}",
        )