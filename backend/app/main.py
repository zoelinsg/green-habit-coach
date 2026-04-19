from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.auth import require_auth
from app.db import init_db
from app.schemas.habit import HabitInput, HabitAnalysisResponse
from app.services.analysis_service import analyze_habits
from app.services.backboard_service import create_thread, send_message
from pydantic import BaseModel


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
def me(payload=Depends(require_auth)):
    return {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "name": payload.get("name"),
    }


@app.post("/api/analyze", response_model=HabitAnalysisResponse)
def analyze(payload: HabitInput, user=Depends(require_auth)):
    return analyze_habits(payload.model_dump(), use_gemini=False)


class CoachMessageInput(BaseModel):
    message: str


@app.post("/api/coach/thread")
def create_coach_thread(user=Depends(require_auth)):
    thread_id = create_thread(user_id=user.get("sub"))
    return {"thread_id": thread_id}


@app.post("/api/coach/message")
def coach_message(
    thread_id: str,
    payload: CoachMessageInput,
    user=Depends(require_auth),
):
    reply = send_message(
        thread_id=thread_id,
        user_message=payload.message,
        user_id=user.get("sub"),
    )
    return {"reply": reply}