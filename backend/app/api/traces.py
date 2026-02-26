from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db, TraceRecord

router = APIRouter()


@router.get("/")
async def get_traces(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TraceRecord).order_by(TraceRecord.created_at.desc()).limit(limit)
    )
    traces = result.scalars().all()
    return [
        {
            "id": t.id,
            "conversation_id": t.conversation_id,
            "span_name": t.span_name,
            "duration_ms": t.duration_ms,
            "metadata": t.trace_metadata,  # fixed: was t.metadata
            "created_at": t.created_at,
        }
        for t in traces
    ]


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    total = await db.execute(select(func.count(TraceRecord.id)))
    total_count = total.scalar()

    result = await db.execute(select(TraceRecord).order_by(TraceRecord.created_at.desc()).limit(100))
    traces = result.scalars().all()

    tool_usage = {}
    durations = []
    for t in traces:
        if t.trace_metadata and "tools_used" in t.trace_metadata:  # fixed: was t.metadata
            for tool in t.trace_metadata["tools_used"]:
                tool_usage[tool] = tool_usage.get(tool, 0) + 1
        if t.duration_ms:
            try:
                durations.append(float(t.duration_ms))
            except:
                pass

    avg_duration = sum(durations) / len(durations) if durations else 0

    return {
        "total_traces": total_count,
        "avg_duration_ms": round(avg_duration, 2),
        "tool_usage": tool_usage,
        "recent_count": len(traces),
    }