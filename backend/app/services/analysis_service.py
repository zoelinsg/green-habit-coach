from app.services.gemini_service import analyze_with_gemini


def analyze_with_mock(payload: dict) -> dict:
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


def analyze_habits(payload: dict, use_gemini: bool = True) -> dict:
    if not use_gemini:
        print("using mock analysis")
        return analyze_with_mock(payload)

    try:
        print("calling Gemini...")
        result = analyze_with_gemini(payload)
        print("Gemini success")
        return result
    except Exception as e:
        print(f"Gemini failed, fallback to mock: {e}")
        return analyze_with_mock(payload)