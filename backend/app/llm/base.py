from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator


class BaseLLMProvider(ABC):
    """Abstract base class for all LLM providers."""

    @abstractmethod
    async def invoke(self, messages: list[dict], model: str, **kwargs) -> str:
        """Single completion."""
        ...

    @abstractmethod
    async def stream(
        self, messages: list[dict], model: str, **kwargs
    ) -> AsyncGenerator[str, None]:
        """Streaming completion."""
        ...

    @abstractmethod
    def get_pricing(self, model: str) -> dict:
        """Return {'input_per_1m': float, 'output_per_1m': float}"""
        ...
