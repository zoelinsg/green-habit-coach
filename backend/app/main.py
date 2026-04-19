from dotenv import load_dotenv
load_dotenv()

import json

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.auth import require_auth
from app.schemas.habit import HabitInput, HabitAnalysisResponse
from app.schemas.history import HistoryItem
from app.schemas.coach import CoachMessageRequest, CoachMessageResponse
from app.services.analysis_service import analyze_habits
from app.services.backboard_service import create_thread_sync, send_message_sync
from app.db import Base, engine, get_db
from app.models import AnalysisRecord

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/me")
def me(payload=Depends(require_auth)):
    return {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "name": payload.get("name"),
    }


@app.post("/api/analyze", response_model=HabitAnalysisResponse)
def analyze(
    payload: HabitInput,
    user=Depends(require_auth),
    db: Session = Depends(get_db),
):
    result = analyze_habits(payload.model_dump(), use_gemini=False)

    record = AnalysisRecord(
        user_sub=user.get("sub"),
        user_email=user.get("email"),
        transport_mode=payload.transport_mode,
        transport_days_per_week=payload.transport_days_per_week,
        red_meat_meals_per_week=payload.red_meat_meals_per_week,
        ac_hours_per_day=payload.ac_hours_per_day,
        disposable_items_per_week=payload.disposable_items_per_week,
        recycle_habit=payload.recycle_habit,
        bring_own_bottle=str(payload.bring_own_bottle),
        bring_own_bag=str(payload.bring_own_bag),
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


@app.get("/api/history", response_model=list[HistoryItem])
def get_history(
    user=Depends(require_auth),
    db: Session = Depends(get_db),
):
    records = (
        db.query(AnalysisRecord)
        .filter(AnalysisRecord.user_sub == user.get("sub"))
        .order_by(AnalysisRecord.id.desc())
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
            "created_at": record.created_at,
        }
        for record in records
    ]


@app.post("/api/coach/thread")
def create_coach_thread(user=Depends(require_auth)):
    thread_id = create_thread_sync()
    return {"thread_id": thread_id}


@app.post("/api/coach/message", response_model=CoachMessageResponse)
def send_coach_message(
    payload: CoachMessageRequest,
    thread_id: str,
    user=Depends(require_auth),
    db: Session = Depends(get_db),
):
    latest_record = (
        db.query(AnalysisRecord)
        .filter(AnalysisRecord.user_sub == user.get("sub"))
        .order_by(AnalysisRecord.id.desc())
        .first()
    )

    if not latest_record:
        raise HTTPException(
            status_code=400,
            detail="No analysis history found. Please analyze your habits first.",
        )

    context_text = f"""
User latest eco habit analysis:
- Score: {latest_record.score}
- Summary: {latest_record.summary}
- Top issues: {", ".join(json.loads(latest_record.top_issues))}
- Suggestions: {", ".join(json.loads(latest_record.suggestions))}
- 7-day challenge: {", ".join(json.loads(latest_record.challenge_plan))}

User follow-up question:
{payload.message}
""".strip()

    reply = send_message_sync(thread_id=thread_id, content=context_text)

    return {
        "reply": reply,
        "thread_id": thread_id,
    }