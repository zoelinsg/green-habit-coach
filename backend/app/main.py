from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.auth import require_auth
from app.schemas.habit import HabitInput, HabitAnalysisResponse
from app.services.analysis_service import analyze_habits

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
def analyze(payload: HabitInput, user=Depends(require_auth)):
    print("analyze route entered")
    print("user:", user.get("sub"))
    print("payload:", payload.model_dump())

    return analyze_habits(payload.model_dump(), use_gemini=False)