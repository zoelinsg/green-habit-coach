from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.db import Base


class HabitRecord(Base):
    __tablename__ = "habit_records"

    id = Column(Integer, primary_key=True, index=True)

    user_sub = Column(String, index=True, nullable=False)

    transport_mode = Column(String, nullable=False)
    transport_days_per_week = Column(Integer, nullable=False)
    red_meat_meals_per_week = Column(Integer, nullable=False)
    ac_hours_per_day = Column(Integer, nullable=False)
    disposable_items_per_week = Column(Integer, nullable=False)
    recycle_habit = Column(String, nullable=False)
    bring_own_bottle = Column(Boolean, nullable=False, default=False)
    bring_own_bag = Column(Boolean, nullable=False, default=False)
    shopping_frequency_per_week = Column(Integer, nullable=False)
    electricity_saving_awareness = Column(String, nullable=False)
    notes = Column(Text, nullable=True)

    score = Column(Integer, nullable=False)
    summary = Column(Text, nullable=False)
    top_issues = Column(Text, nullable=False)
    suggestions = Column(Text, nullable=False)
    challenge_plan = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)