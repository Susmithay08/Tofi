import asyncio
import sys
sys.path.insert(0, '.')

from app.core.config import settings
from app.agents.agent import run_agent

async def test():
    try:
        result = await run_agent("What is 2 + 2?", [])
        print("SUCCESS:", result)
    except Exception as e:
        print("ERROR:", type(e).__name__, str(e))
        import traceback
        traceback.print_exc()

asyncio.run(test())