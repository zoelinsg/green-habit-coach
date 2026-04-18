import os
import asyncio
from typing import Optional

from dotenv import load_dotenv
from backboard import BackboardClient

load_dotenv()

BACKBOARD_API_KEY = os.getenv("BACKBOARD_API_KEY")
BACKBOARD_ASSISTANT_ID = os.getenv("BACKBOARD_ASSISTANT_ID")

_ASSISTANT_ID_CACHE: Optional[str] = BACKBOARD_ASSISTANT_ID


async def get_client() -> BackboardClient:
    if not BACKBOARD_API_KEY:
        raise ValueError("BACKBOARD_API_KEY is not set")
    return BackboardClient(api_key=BACKBOARD_API_KEY)


async def get_or_create_assistant() -> str:
    global _ASSISTANT_ID_CACHE

    if _ASSISTANT_ID_CACHE:
        return _ASSISTANT_ID_CACHE

    client = await get_client()

    assistant = await client.create_assistant(
        name="Green Habit Coach Assistant",
        system_prompt=(
            "You are Green Habit Coach, an encouraging eco habit coach. "
            "Use the user's latest analysis context to answer follow-up questions clearly and practically. "
            "Reply in the same language as the user's question. "
            "Keep answers concise and action-oriented. "
            "Limit each reply to at most 3 short actionable points. "
            "Each point should be 1 to 2 short sentences only. "
            "Prefer practical next steps over long explanations. "
            "Do not shame the user. "
            "Do not return bilingual answers unless explicitly requested. "
            "Do not use markdown formatting. "
            "Return plain text only."
        ),
    )

    _ASSISTANT_ID_CACHE = assistant.assistant_id
    print("Created Backboard assistant:", _ASSISTANT_ID_CACHE)
    print("Please save this to BACKBOARD_ASSISTANT_ID in backend/.env")

    return _ASSISTANT_ID_CACHE


async def create_thread() -> str:
    client = await get_client()
    assistant_id = await get_or_create_assistant()
    thread = await client.create_thread(assistant_id)
    return thread.thread_id


async def send_message(thread_id: str, content: str) -> str:
    client = await get_client()

    response = await client.add_message(
        thread_id=thread_id,
        content=content,
        stream=False,
        memory="off",
    )

    if hasattr(response, "content") and response.content:
        return response.content.strip()

    return str(response).strip()


def create_thread_sync() -> str:
    return asyncio.run(create_thread())


def send_message_sync(thread_id: str, content: str) -> str:
    return asyncio.run(send_message(thread_id, content))