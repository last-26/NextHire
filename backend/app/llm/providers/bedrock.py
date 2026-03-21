from collections.abc import AsyncGenerator

import boto3

from app.config import settings
from app.llm.base import BaseLLMProvider
from app.llm.config import PRICING


class BedrockProvider(BaseLLMProvider):
    """AWS Bedrock LLM provider for Claude models."""

    def __init__(self):
        self.client = boto3.client(
            "bedrock-runtime",
            region_name=settings.AWS_DEFAULT_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

    async def invoke(self, messages: list[dict], model: str, **kwargs) -> str:
        """Single completion via Bedrock Converse API."""
        bedrock_messages = self._format_messages(messages)
        system_prompt = self._get_system_prompt(messages)

        call_params = {
            "modelId": model,
            "messages": bedrock_messages,
            "inferenceConfig": {
                "maxTokens": kwargs.get("max_tokens", 4096),
                "temperature": kwargs.get("temperature", 0.7),
            },
        }

        if system_prompt:
            call_params["system"] = [{"text": system_prompt}]

        response = self.client.converse(**call_params)

        return response["output"]["message"]["content"][0]["text"]

    async def stream(
        self, messages: list[dict], model: str, **kwargs
    ) -> AsyncGenerator[str, None]:
        """Streaming completion via Bedrock ConverseStream API."""
        bedrock_messages = self._format_messages(messages)
        system_prompt = self._get_system_prompt(messages)

        call_params = {
            "modelId": model,
            "messages": bedrock_messages,
            "inferenceConfig": {
                "maxTokens": kwargs.get("max_tokens", 4096),
                "temperature": kwargs.get("temperature", 0.7),
            },
        }

        if system_prompt:
            call_params["system"] = [{"text": system_prompt}]

        response = self.client.converse_stream(**call_params)

        for event in response["stream"]:
            if "contentBlockDelta" in event:
                delta = event["contentBlockDelta"]["delta"]
                if "text" in delta:
                    yield delta["text"]

    def get_pricing(self, model: str) -> dict:
        """Return pricing info for the given model."""
        return PRICING.get(model, {"input_per_1m": 0.0, "output_per_1m": 0.0})

    def _format_messages(self, messages: list[dict]) -> list[dict]:
        """Convert standard message format to Bedrock format."""
        bedrock_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            if role == "system":
                continue  # System messages handled separately in Bedrock
            bedrock_messages.append({
                "role": role,
                "content": [{"text": msg["content"]}],
            })
        return bedrock_messages

    def _get_system_prompt(self, messages: list[dict]) -> str | None:
        """Extract system prompt from messages."""
        for msg in messages:
            if msg.get("role") == "system":
                return msg["content"]
        return None
