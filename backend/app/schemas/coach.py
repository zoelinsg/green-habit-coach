from pydantic import BaseModel


class CoachMessageRequest(BaseModel):
    message: str


class CoachMessageResponse(BaseModel):
    reply: str
    thread_id: str