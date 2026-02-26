from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
import logging

logger = logging.getLogger(__name__)
tracer: trace.Tracer = None


def setup_telemetry(app):
    global tracer
    provider = TracerProvider()
    provider.add_span_processor(BatchSpanProcessor(ConsoleSpanExporter()))
    trace.set_tracer_provider(provider)
    tracer = trace.get_tracer("ai-agent-platform")
    FastAPIInstrumentor.instrument_app(app)
    logger.info("OpenTelemetry configured")


def get_tracer() -> trace.Tracer:
    return tracer
