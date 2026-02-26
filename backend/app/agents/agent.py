from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, BaseMessage
from typing import TypedDict, Annotated, Sequence
from operator import add
from app.tools.tools import ALL_TOOLS
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a powerful AI agent with access to several tools. You can:
- Perform mathematical calculations
- Execute Python code snippets safely
- Look up the current date and time
- Search a knowledge base about tech topics
- Generate JSON schemas from descriptions

Always reason step by step. Use tools when they help you give a more accurate or useful answer.
Be concise but thorough. After using tools, synthesize the results into a clear, helpful response."""


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add]


def build_agent():
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0.1,
        max_tokens=4096,
    )
    llm_with_tools = llm.bind_tools(ALL_TOOLS)

    def call_model(state: AgentState):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(state["messages"])
        try:
            response = llm_with_tools.invoke(messages)
            return {"messages": [response]}
        except Exception as e:
            error_str = str(e)
            # Groq tool_use_failed: model generated malformed tool call syntax
            # Retry without tools so the user still gets an answer
            if "tool_use_failed" in error_str or "Failed to call a function" in error_str:
                logger.warning("tool_use_failed detected, retrying without tools")
                response = llm.invoke(messages)
                return {"messages": [response]}
            raise

    def should_continue(state: AgentState):
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    tool_node = ToolNode(ALL_TOOLS)

    graph = StateGraph(AgentState)
    graph.add_node("agent", call_model)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue)
    graph.add_edge("tools", "agent")

    return graph.compile()


agent = build_agent()


async def run_agent(user_message: str, history: list[dict]) -> dict:
    messages = []
    for msg in history[-10:]:
        role = msg.get("role", "")
        content = msg.get("content", "") or ""
        if not content.strip():
            continue
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=user_message))

    result = await agent.ainvoke({"messages": messages})

    all_messages = result["messages"]
    tool_calls = []
    final_content = ""

    for msg in all_messages:
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            for tc in msg.tool_calls:
                tool_calls.append({
                    "tool": tc["name"],
                    "input": tc["args"],
                    "id": tc["id"],
                })
        elif hasattr(msg, "type") and msg.type == "tool":
            for tc in tool_calls:
                if tc.get("id") == getattr(msg, "tool_call_id", None):
                    tc["output"] = msg.content
                    break
            else:
                if tool_calls:
                    tool_calls[-1]["output"] = msg.content

    for msg in reversed(all_messages):
        if (
            hasattr(msg, "content")
            and msg.content
            and not (hasattr(msg, "tool_calls") and msg.tool_calls)
            and getattr(msg, "type", "") != "tool"
        ):
            final_content = msg.content
            break

    return {"content": final_content, "tool_calls": tool_calls}