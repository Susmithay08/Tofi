from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid
import time
import logging

from app.core.database import get_db, Conversation, Message, TraceRecord
from app.agents.agent import run_agent

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    content: str
    tool_calls: list
    duration_ms: float


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    try:
        conv_id = request.conversation_id or str(uuid.uuid4())
        conv = await db.get(Conversation, conv_id)
        if not conv:
            conv = Conversation(id=conv_id, title=request.message[:60])
            db.add(conv)
            await db.flush()

        # Load PREVIOUS messages (before adding the new user message)
        result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv_id)
            .order_by(Message.created_at)
            .limit(20)
        )
        previous_messages = result.scalars().all()

        # Build clean history for the agent (only user/assistant, no empty content)
        history = []
        for m in previous_messages:
            if m.role in ("user", "assistant") and m.content and m.content.strip():
                history.append({"role": m.role, "content": m.content})

        # Now save the new user message
        user_msg = Message(
            conversation_id=conv_id,
            role="user",
            content=request.message,
        )
        db.add(user_msg)
        await db.flush()

        logger.warning(f">>> AGENT CALL: msg='{request.message[:40]}' history_len={len(history)} roles={[h['role'] for h in history]}")
        # Run agent with history (does NOT include the current message — agent adds it internally)
        start = time.time()
        agent_result = await run_agent(request.message, history)
        duration_ms = (time.time() - start) * 1000

        assistant_msg = Message(
            conversation_id=conv_id,
            role="assistant",
            content=agent_result["content"],
            tool_calls=agent_result["tool_calls"],
        )
        db.add(assistant_msg)

        trace_record = TraceRecord(
            conversation_id=conv_id,
            message_id=assistant_msg.id,
            span_name="agent_run",
            duration_ms=f"{duration_ms:.2f}",
            trace_metadata={
                "tool_calls_count": len(agent_result["tool_calls"]),
                "tools_used": [tc["tool"] for tc in agent_result["tool_calls"]],
                "input_length": len(request.message),
                "output_length": len(agent_result["content"]),
            },
        )
        db.add(trace_record)
        await db.commit()

        return ChatResponse(
            conversation_id=conv_id,
            message_id=assistant_msg.id,
            content=agent_result["content"],
            tool_calls=agent_result["tool_calls"],
            duration_ms=round(duration_ms, 2),
        )

    except Exception as e:
        import traceback
        logger.error(f"CHAT ERROR: {type(e).__name__}: {e}\n{traceback.format_exc()}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


@router.get("/conversations")
async def list_conversations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Conversation).order_by(Conversation.created_at.desc()).limit(50)
    )
    convs = result.scalars().all()
    return [{"id": c.id, "title": c.title, "created_at": c.created_at} for c in convs]


@router.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
    )
    msgs = result.scalars().all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "tool_calls": m.tool_calls,
            "created_at": m.created_at,
        }
        for m in msgs
    ]