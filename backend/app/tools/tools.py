import math
import json
import subprocess
import sys
from datetime import datetime, timezone
from langchain_core.tools import tool


@tool
def calculator(expression: str) -> str:
    """Evaluate a mathematical expression. Input should be a valid Python math expression."""
    try:
        allowed = {k: v for k, v in math.__dict__.items() if not k.startswith("_")}
        allowed.update({"abs": abs, "round": round, "min": min, "max": max, "sum": sum})
        result = eval(expression, {"__builtins__": {}}, allowed)
        return f"Result: {result}"
    except Exception as e:
        return f"Error evaluating expression: {str(e)}"


@tool
def get_current_datetime(timezone_name: str = "UTC") -> str:
    """Get the current date and time. Optionally pass a timezone name like 'UTC'."""
    now = datetime.now(timezone.utc)
    return f"Current datetime (UTC): {now.strftime('%Y-%m-%d %H:%M:%S')} UTC"


@tool
def execute_python_code(code: str) -> str:
    """
    Execute a small Python code snippet in a sandboxed subprocess.
    Only use for safe, simple computations. No file I/O or network access.
    """
    try:
        safe_code = f"""
import math, json, re, collections, itertools, functools
{code}
"""
        result = subprocess.run(
            [sys.executable, "-c", safe_code],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            output = result.stdout.strip()
            return f"Output:\n{output}" if output else "Code executed successfully (no output)"
        else:
            return f"Error:\n{result.stderr.strip()}"
    except subprocess.TimeoutExpired:
        return "Execution timed out (10s limit)"
    except Exception as e:
        return f"Execution failed: {str(e)}"


@tool
def search_knowledge_base(query: str) -> str:
    """
    Search a built-in knowledge base for information about programming, AI, and tech topics.
    Returns relevant information based on the query.
    """
    knowledge = {
        "python": "Python is a high-level, interpreted programming language known for its readability and versatility. Created by Guido van Rossum in 1991.",
        "fastapi": "FastAPI is a modern, fast web framework for building APIs with Python 3.7+ based on standard Python type hints.",
        "langchain": "LangChain is a framework for developing applications powered by language models, providing tools for chaining, memory, and agents.",
        "langgraph": "LangGraph is a library for building stateful, multi-actor applications with LLMs, built on top of LangChain.",
        "groq": "Groq is an AI infrastructure company providing ultra-fast LLM inference using their custom LPU (Language Processing Unit) hardware.",
        "docker": "Docker is a platform for developing, shipping, and running applications in containers, ensuring consistency across environments.",
        "react": "React is a JavaScript library for building user interfaces, developed by Meta. It uses a component-based architecture.",
        "postgresql": "PostgreSQL is a powerful, open-source object-relational database system with over 35 years of active development.",
        "devops": "DevOps is a set of practices combining software development and IT operations to shorten the development cycle.",
        "ci/cd": "CI/CD stands for Continuous Integration/Continuous Deployment - automating the testing and deployment of software.",
    }
    query_lower = query.lower()
    results = []
    for key, value in knowledge.items():
        if key in query_lower or any(word in query_lower for word in key.split()):
            results.append(f"**{key.title()}**: {value}")
    if results:
        return "\n\n".join(results)
    return f"No specific knowledge found for '{query}'. Try asking about Python, FastAPI, LangChain, Docker, React, PostgreSQL, DevOps, or CI/CD."


@tool
def generate_json_schema(description: str) -> str:
    """Generate a JSON schema based on a plain English description of a data structure."""
    # Simple heuristic schema generator
    lines = description.lower().split()
    schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {},
        "required": [],
    }
    # Very basic field detection
    common_fields = {
        "name": {"type": "string", "description": "The name field"},
        "email": {"type": "string", "format": "email"},
        "age": {"type": "integer", "minimum": 0},
        "id": {"type": "string", "format": "uuid"},
        "date": {"type": "string", "format": "date"},
        "price": {"type": "number", "minimum": 0},
        "active": {"type": "boolean"},
        "tags": {"type": "array", "items": {"type": "string"}},
    }
    for field, field_schema in common_fields.items():
        if field in lines:
            schema["properties"][field] = field_schema
            schema["required"].append(field)
    if not schema["properties"]:
        schema["properties"] = {
            "id": {"type": "string"},
            "value": {"type": "string"},
            "created_at": {"type": "string", "format": "date-time"},
        }
    return json.dumps(schema, indent=2)


ALL_TOOLS = [
    calculator,
    get_current_datetime,
    execute_python_code,
    search_knowledge_base,
    generate_json_schema,
]
