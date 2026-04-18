from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.habit import HabitInput, HabitAnalysisResponse
from app.services.analysis_service import analyze_habits
from dotenv import load_dotenv
load_dotenv()

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


@app.post("/api/analyze", response_model=HabitAnalysisResponse)
def analyze(payload: HabitInput):
    result = analyze_habits(payload.model_dump(), use_gemini=True)
    return result