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
    logger.info("Starting Tofi AI Agent Platform...")
    await init_db()
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Tofi AI Agent Platform",
    description="LangGraph-powered AI Agent with tool execution and observability",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS must be added BEFORE telemetry and routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://tofi-kp32.onrender.com",
        "https://tofi-aiagent.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

setup_telemetry(app)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(traces.router, prefix="/api/traces", tags=["traces"])