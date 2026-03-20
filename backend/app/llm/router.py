from app.config import settings
from app.llm.base import BaseLLMProvider
from app.llm.config import TASK_MODEL_MAP


class ModelRouter:
    """Routes task types to the appropriate model and provider."""

    def __init__(self):
        self._provider: BaseLLMProvider | None = None

    @property
    def provider(self) -> BaseLLMProvider:
        if self._provider is None:
            self._provider = self._create_provider()
        return self._provider

    def _create_provider(self) -> BaseLLMProvider:
        """Factory method to create the configured LLM provider."""
        provider_name = settings.LLM_PROVIDER.lower()

        if provider_name == "bedrock":
            from app.llm.providers.bedrock import BedrockProvider
            return BedrockProvider()
        elif provider_name == "anthropic":
            from app.llm.providers.anthropic import AnthropicProvider
            return AnthropicProvider()
        elif provider_name == "openai":
            from app.llm.providers.openai import OpenAIProvider
            return OpenAIProvider()
        elif provider_name == "gemini":
            from app.llm.providers.gemini import GeminiProvider
            return GeminiProvider()
        elif provider_name == "ollama":
            from app.llm.providers.ollama import OllamaProvider
            return OllamaProvider()
        else:
            raise ValueError(f"Unknown LLM provider: {provider_name}")

    def get_model_for_task(self, task_type: str) -> str:
        """Resolve task type to a specific model ID."""
        tier = TASK_MODEL_MAP.get(task_type, "fast")
        if tier == "power":
            return settings.LLM_POWER_MODEL
        return settings.LLM_FAST_MODEL

    async def invoke(self, task_type: str, messages: list[dict], **kwargs) -> str:
        """Route a task to the appropriate model and invoke."""
        model = self.get_model_for_task(task_type)
        return await self.provider.invoke(messages, model, **kwargs)

    async def stream(self, task_type: str, messages: list[dict], **kwargs):
        """Route a task to the appropriate model and stream."""
        model = self.get_model_for_task(task_type)
        async for chunk in self.provider.stream(messages, model, **kwargs):
            yield chunk
