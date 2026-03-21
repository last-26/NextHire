"""Placeholder: OpenAI provider."""

from collections.abc import AsyncGenerator

from app.llm.base import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):
    """OpenAI API provider (future implementation)."""

    async def invoke(self, messages: list[dict], model: str, **kwargs) -> str:
        raise NotImplementedError("OpenAI provider not yet implemented")

    async def stream(
        self, messages: list[dict], model: str, **kwargs
    ) -> AsyncGenerator[str, None]:
        raise NotImplementedError("OpenAI provider not yet implemented")
        yield  # pragma: no cover

    def get_pricing(self, model: str) -> dict:
        return {"input_per_1m": 0.0, "output_per_1m": 0.0}
