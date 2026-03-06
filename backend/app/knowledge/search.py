from __future__ import annotations

import re
from pathlib import Path
from typing import Any

_KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "data" / "knowledge"

# Cache loaded knowledge files
_knowledge_cache: list[dict[str, Any]] | None = None


def _parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    """Parse YAML-like frontmatter from a markdown file."""
    meta: dict[str, Any] = {}
    content = text

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            frontmatter = parts[1].strip()
            content = parts[2].strip()
            for line in frontmatter.split("\n"):
                line = line.strip()
                if ":" in line:
                    key, _, value = line.partition(":")
                    key = key.strip().strip('"')
                    value = value.strip().strip('"')
                    # Handle arrays
                    if value.startswith("["):
                        # Support both quoted ["a", "b"] and unquoted [a, b]
                        items = re.findall(r'"([^"]+)"', value)
                        if not items:
                            inner = value.strip("[] ")
                            items = [s.strip() for s in inner.split(",") if s.strip()]
                        meta[key] = items
                    else:
                        meta[key] = value
    return meta, content


def _load_knowledge() -> list[dict[str, Any]]:
    """Load all knowledge markdown files."""
    global _knowledge_cache
    if _knowledge_cache is not None:
        return _knowledge_cache

    entries: list[dict[str, Any]] = []

    if not _KNOWLEDGE_DIR.exists():
        _knowledge_cache = entries
        return entries

    for md_file in _KNOWLEDGE_DIR.rglob("*.md"):
        raw = md_file.read_text(encoding="utf-8")
        meta, content = _parse_frontmatter(raw)
        entries.append({
            "id": meta.get("id", md_file.stem),
            "title": meta.get("title", md_file.stem),
            "category": meta.get("category", ""),
            "programs": meta.get("programs", []),
            "personas": meta.get("personas", []),
            "intents": meta.get("intents", []),
            "content": content,
            "path": str(md_file),
        })

    _knowledge_cache = entries
    return entries


def knowledge_search(
    query: str,
    category: str | None = None,
    program: str | None = None,
    max_results: int = 3,
) -> list[dict[str, Any]]:
    """Search knowledge base by metadata + keyword matching."""
    entries = _load_knowledge()
    scored: list[tuple[float, dict[str, Any]]] = []

    query_lower = query.lower()
    query_words = set(query_lower.split())

    for entry in entries:
        score = 0.0

        # Category match
        if category and entry.get("category") == category:
            score += 3.0
        elif category and entry.get("category") != category:
            score -= 1.0

        # Program match
        if program and program in entry.get("programs", []):
            score += 2.0

        # Title keyword match
        title_lower = entry.get("title", "").lower()
        for word in query_words:
            if len(word) > 2 and word in title_lower:
                score += 2.0

        # Content keyword match
        content_lower = entry.get("content", "").lower()
        for word in query_words:
            if len(word) > 2 and word in content_lower:
                score += 1.0

        # ID match
        if query_lower.replace(" ", "-") in entry.get("id", ""):
            score += 3.0

        if score > 0:
            scored.append((score, entry))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    results = []
    for _score, entry in scored[:max_results]:
        results.append({
            "id": entry["id"],
            "title": entry["title"],
            "category": entry["category"],
            "content": entry["content"][:1500],  # Truncate to ~350 tokens
        })

    return results


def reload_knowledge() -> None:
    """Force reload of knowledge cache."""
    global _knowledge_cache
    _knowledge_cache = None
