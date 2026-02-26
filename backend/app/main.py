from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.api import chat, traces, health
from app.telemetry.setup import setup_telemetry
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Agent Platform...")
    await init_db()
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="AI Agent Platform",
    description="LangGraph-powered AI Agent with tool execution and observability",
    version="1.0.0",
    lifespan=lifespan,
)

setup_telemetry(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://tofi-kp32.onrender.com",
        "https://*.vercel.app",  # covers all Vercel previews
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(traces.router, prefix="/api/traces", tags=["traces"])
