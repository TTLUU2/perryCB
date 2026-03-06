from __future__ import annotations

import asyncio
import logging
from typing import Any, AsyncGenerator

import anthropic

from app.config import get_settings

logger = logging.getLogger(__name__)

_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        settings = get_settings()
        _client = anthropic.AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=settings.llm_timeout,
        )
    return _client


async def create_message(
    system: str,
    messages: list[dict[str, Any]],
    tools: list[dict[str, Any]] | None = None,
    max_tokens: int = 1024,
) -> anthropic.types.Message:
    """Non-streaming message with retry logic."""
    settings = get_settings()
    client = get_client()
    last_error: Exception | None = None

    for attempt in range(settings.llm_max_retries):
        try:
            kwargs: dict[str, Any] = {
                "model": settings.llm_model,
                "max_tokens": max_tokens,
                "system": system,
                "messages": messages,
            }
            if tools:
                kwargs["tools"] = tools
            return await client.messages.create(**kwargs)
        except (anthropic.APITimeoutError, anthropic.RateLimitError, anthropic.InternalServerError) as e:
            last_error = e
            wait = (2**attempt) * 1.0
            logger.warning("LLM attempt %d failed (%s), retrying in %.1fs", attempt + 1, type(e).__name__, wait)
            await asyncio.sleep(wait)
        except Exception as e:
            logger.error("LLM non-retryable error: %s", e)
            raise

    raise last_error  # type: ignore[misc]


async def stream_message(
    system: str,
    messages: list[dict[str, Any]],
    tools: list[dict[str, Any]] | None = None,
    max_tokens: int = 1024,
) -> AsyncGenerator[anthropic.types.RawMessageStreamEvent, None]:
    """Streaming message — yields raw SSE events from Claude."""
    settings = get_settings()
    client = get_client()
    last_error: Exception | None = None

    for attempt in range(settings.llm_max_retries):
        try:
            kwargs: dict[str, Any] = {
                "model": settings.llm_model,
                "max_tokens": max_tokens,
                "system": system,
                "messages": messages,
            }
            if tools:
                kwargs["tools"] = tools
            async with client.messages.stream(**kwargs) as stream:
                async for event in stream:
                    yield event
            return
        except (anthropic.APITimeoutError, anthropic.RateLimitError, anthropic.InternalServerError) as e:
            last_error = e
            wait = (2**attempt) * 1.0
            logger.warning("Stream attempt %d failed (%s), retrying in %.1fs", attempt + 1, type(e).__name__, wait)
            await asyncio.sleep(wait)
        except Exception as e:
            logger.error("Stream non-retryable error: %s", e)
            raise

    raise last_error  # type: ignore[misc]
