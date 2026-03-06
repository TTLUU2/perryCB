"""Parse WP Courseware XML exports and convert to knowledge markdown files."""

import html
import os
import re
import xml.etree.ElementTree as ET
from pathlib import Path

INPUT_DIR = Path(__file__).resolve().parent.parent.parent / "wp-courseware"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "backend" / "app" / "data" / "knowledge" / "courses"

# Map course titles to categories and intents
COURSE_MAPPING = {
    "introduction to frequent flyer": {
        "category": "learning",
        "programs": [],
        "intents": ["LEARNING"],
    },
    "credit cards": {
        "category": "learning",
        "programs": [],
        "intents": ["LEARNING", "CARD_MATCH"],
    },
    "lounges": {
        "category": "learning",
        "programs": [],
        "intents": ["LEARNING"],
    },
    "transferring": {
        "category": "programs",
        "programs": [],
        "intents": ["LEARNING", "CARD_MATCH"],
    },
    "redeeming": {
        "category": "redemptions",
        "programs": [],
        "intents": ["LEARNING", "SEAT_ALERTS"],
    },
    "platinum status": {
        "category": "programs",
        "programs": ["qantas", "velocity"],
        "intents": ["LEARNING"],
    },
    "reward flights": {
        "category": "redemptions",
        "programs": [],
        "intents": ["LEARNING", "SEAT_ALERTS"],
    },
    "buying points": {
        "category": "programs",
        "programs": [],
        "intents": ["LEARNING", "CARD_MATCH"],
    },
    "upgrades": {
        "category": "redemptions",
        "programs": [],
        "intents": ["LEARNING"],
    },
    "cheap airfares": {
        "category": "redemptions",
        "programs": [],
        "intents": ["LEARNING"],
    },
    "hotel": {
        "category": "learning",
        "programs": [],
        "intents": ["LEARNING"],
    },
    "supermarket": {
        "category": "learning",
        "programs": [],
        "intents": ["LEARNING", "CARD_MATCH"],
    },
    "car hire": {
        "category": "learning",
        "programs": [],
        "intents": ["LEARNING"],
    },
    "travel hacks": {
        "category": "learning",
        "programs": [],
        "intents": ["LEARNING"],
    },
}


def clean_html(text: str) -> str:
    """Convert HTML-encoded content to clean markdown text."""
    if not text:
        return ""
    # Decode HTML entities
    text = html.unescape(text)
    # Decode again (double-encoded)
    text = html.unescape(text)
    # Remove HTML tags but preserve structure
    # Convert headings
    text = re.sub(r"<h[1-6][^>]*>(.*?)</h[1-6]>", r"\n## \1\n", text, flags=re.DOTALL | re.IGNORECASE)
    # Convert bold
    text = re.sub(r"<strong>(.*?)</strong>", r"**\1**", text, flags=re.DOTALL)
    text = re.sub(r"<b>(.*?)</b>", r"**\1**", text, flags=re.DOTALL)
    # Convert italic
    text = re.sub(r"<em>(.*?)</em>", r"*\1*", text, flags=re.DOTALL)
    text = re.sub(r"<i>(.*?)</i>", r"*\1*", text, flags=re.DOTALL)
    # Convert links - keep text only
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r"\2", text, flags=re.DOTALL)
    # Convert list items
    text = re.sub(r"<li[^>]*>(.*?)</li>", r"- \1", text, flags=re.DOTALL)
    # Convert paragraphs
    text = re.sub(r"<p[^>]*>(.*?)</p>", r"\1\n\n", text, flags=re.DOTALL)
    # Convert br tags
    text = re.sub(r"<br\s*/?>", "\n", text)
    # Remove remaining HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Clean up extra whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    # Remove &nbsp;
    text = text.replace("\xa0", " ").replace("&nbsp;", " ")
    return text.strip()


def slugify(text: str) -> str:
    """Create a file-safe slug from text."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text)
    return text.strip("-")[:60]


def get_mapping(course_title: str) -> dict:
    """Get category/intent mapping for a course title."""
    title_lower = course_title.lower()
    for key, mapping in COURSE_MAPPING.items():
        if key in title_lower:
            return mapping
    return {"category": "learning", "programs": [], "intents": ["LEARNING"]}


def parse_xml_file(filepath: Path) -> list[dict]:
    """Parse a single WP Courseware XML file and extract units."""
    tree = ET.parse(filepath)
    root = tree.getroot()

    course_title = ""
    settings = root.find("settings")
    if settings is not None:
        ct = settings.find("course_title")
        if ct is not None and ct.text:
            course_title = ct.text.strip()

    units = []
    modules_el = root.find("modules")
    if modules_el is None:
        return units

    for module in modules_el.findall("module"):
        module_title_el = module.find("module_title")
        module_title = module_title_el.text.strip() if module_title_el is not None and module_title_el.text else ""

        units_el = module.find("units")
        if units_el is None:
            continue

        for unit in units_el.findall("unit"):
            unit_title_el = unit.find("post_title")
            unit_content_el = unit.find("post_content")

            unit_title = unit_title_el.text.strip() if unit_title_el is not None and unit_title_el.text else ""
            unit_content = unit_content_el.text.strip() if unit_content_el is not None and unit_content_el.text else ""

            if not unit_content or len(unit_content) < 100:
                continue

            clean_content = clean_html(unit_content)
            if len(clean_content) < 50:
                continue

            units.append({
                "course_title": course_title,
                "module_title": module_title,
                "unit_title": unit_title,
                "content": clean_content,
            })

    return units


def write_knowledge_file(unit: dict, index: int) -> str:
    """Write a single knowledge markdown file. Returns the filename."""
    mapping = get_mapping(unit["course_title"])

    slug = slugify(unit["unit_title"] or unit["module_title"] or f"unit-{index}")
    filename = f"course-{slug}.md"

    programs_str = ", ".join(mapping["programs"]) if mapping["programs"] else "all"
    intents_str = ", ".join(mapping["intents"])

    # Detect program mentions in content
    content_lower = unit["content"].lower()
    detected_programs = []
    if "qantas" in content_lower:
        detected_programs.append("qantas")
    if "velocity" in content_lower:
        detected_programs.append("velocity")
    if "krisflyer" in content_lower or "singapore airlines" in content_lower:
        detected_programs.append("krisflyer")
    if detected_programs and programs_str == "all":
        programs_str = ", ".join(detected_programs)

    # Truncate very long content to keep files manageable (max ~2000 words)
    content = unit["content"]
    words = content.split()
    if len(words) > 2000:
        content = " ".join(words[:2000]) + "\n\n[Content truncated for knowledge base]"

    md = f"""---
title: "{unit['unit_title']}"
category: {mapping['category']}
programs: [{programs_str}]
intents: [{intents_str}]
source: "{unit['course_title']}"
module: "{unit['module_title']}"
---

# {unit['unit_title']}

{content}
"""
    filepath = OUTPUT_DIR / filename
    filepath.write_text(md, encoding="utf-8")
    return filename


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    all_units = []
    xml_files = sorted(INPUT_DIR.glob("*.xml"))
    print(f"Found {len(xml_files)} XML files")

    for filepath in xml_files:
        print(f"  Parsing: {filepath.name}")
        units = parse_xml_file(filepath)
        print(f"    → {len(units)} units extracted")
        all_units.extend(units)

    print(f"\nTotal units: {len(all_units)}")

    # Deduplicate by unit_title
    seen = set()
    unique_units = []
    for unit in all_units:
        key = unit["unit_title"].lower().strip()
        if key and key not in seen:
            seen.add(key)
            unique_units.append(unit)

    print(f"Unique units: {len(unique_units)}")

    written = []
    for i, unit in enumerate(unique_units):
        filename = write_knowledge_file(unit, i)
        written.append(filename)
        print(f"  ✓ {filename}")

    print(f"\nDone! Wrote {len(written)} knowledge files to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
