"""LangGraph agent graph definition - the core agent pipeline."""

from langgraph.graph import END, StateGraph

from app.agent.nodes.analyze_match import analyze_match
from app.agent.nodes.compile_report import compile_report
from app.agent.nodes.generate_cover_letter import generate_cover_letter
from app.agent.nodes.identify_gaps import identify_gaps
from app.agent.nodes.parse_cv import parse_cv
from app.agent.nodes.parse_job import parse_job
from app.agent.nodes.reflect import reflect, should_retry
from app.agent.state import AgentState


def build_agent_graph() -> StateGraph:
    """Build and compile the agent graph.

    Graph flow:
        START -> parse_job -> parse_cv -> analyze_match -> identify_gaps
        -> generate_cover_letter -> reflect -> [compile | retry]
        compile -> END
        retry -> generate_cover_letter (loop, max 2 retries)
    """
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("parse_job", parse_job)
    graph.add_node("parse_cv", parse_cv)
    graph.add_node("analyze_match", analyze_match)
    graph.add_node("identify_gaps", identify_gaps)
    graph.add_node("generate_cover_letter", generate_cover_letter)
    graph.add_node("reflect", reflect)
    graph.add_node("compile_report", compile_report)

    # Define edges (linear flow)
    graph.set_entry_point("parse_job")
    graph.add_edge("parse_job", "parse_cv")
    graph.add_edge("parse_cv", "analyze_match")
    graph.add_edge("analyze_match", "identify_gaps")
    graph.add_edge("identify_gaps", "generate_cover_letter")
    graph.add_edge("generate_cover_letter", "reflect")

    # Conditional edge: reflect -> compile or retry
    graph.add_conditional_edges(
        "reflect",
        should_retry,
        {
            "compile": "compile_report",
            "retry": "generate_cover_letter",
        },
    )

    graph.add_edge("compile_report", END)

    return graph.compile()


# Singleton compiled graph
agent_graph = build_agent_graph()
