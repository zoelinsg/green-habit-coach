import os
import json
from google import genai


def analyze_with_gemini(payload: dict) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    client = genai.Client(api_key=api_key)

    prompt = f"""
You are an eco habit coach.
Analyze the user's lifestyle habits and return ONLY valid JSON.

Required JSON format:
{{
  "score": 1,
  "summary": "string",
  "top_issues": ["string", "string", "string"],
  "suggestions": ["string", "string", "string"],
  "challenge_plan": ["string", "string", "string", "string", "string", "string", "string"]
}}

Rules:
- score must be an integer from 1 to 100
- top_issues must contain exactly 3 items
- suggestions must contain 3 to 5 items
- challenge_plan must contain exactly 7 items
- tone should be encouraging, practical, and clear
- do not shame the user
- return JSON only, no markdown

User data:
{json.dumps(payload, ensure_ascii=False, indent=2)}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    text = response.text.strip()

    if text.startswith("```"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)