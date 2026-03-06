from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "points_requirements.json"
_data: dict[str, Any] | None = None


def _load_data() -> dict[str, Any]:
    global _data
    if _data is None:
        with open(_DATA_PATH) as f:
            _data = json.load(f)
    return _data


def _city_to_code(city: str) -> str:
    """Convert city name to airport code, or return as-is if already a code."""
    data = _load_data()
    code_map = data.get("common_city_codes", {})
    # Check direct match (case-insensitive)
    for name, code in code_map.items():
        if name.lower() == city.lower():
            return code
    # Might already be a code
    if len(city) == 3 and city.upper() == city:
        return city
    # Try uppercase
    return city.upper()[:3]


def points_estimate(
    origin: str,
    destination: str,
    cabin_class: str,
    program: str | None = None,
    trip_type: str | None = None,
) -> dict[str, Any]:
    """Estimate points needed for a route."""
    data = _load_data()
    origin_code = _city_to_code(origin)
    dest_code = _city_to_code(destination)
    is_return = trip_type == "return" if trip_type else True  # Default return

    # Find matching route
    matching_route = None
    for route in data.get("routes", []):
        if route["origin"] == origin_code and route["destination"] == dest_code:
            matching_route = route
            break
        # Try reverse direction
        if route["origin"] == dest_code and route["destination"] == origin_code:
            matching_route = route
            break

    if not matching_route:
        return {
            "found": False,
            "origin": origin_code,
            "destination": dest_code,
            "message": f"No points data available for {origin_code} to {dest_code}",
        }

    result: dict[str, Any] = {
        "found": True,
        "origin": origin_code,
        "destination": dest_code,
        "cabin_class": cabin_class,
        "trip_type": "return" if is_return else "oneway",
        "estimates": {},
    }

    programs_data = matching_route.get("programs", {})
    multiplier = 2 if is_return else 1

    if program and program != "any":
        # Specific program
        if program in programs_data:
            points = programs_data[program].get(cabin_class)
            if points is not None:
                result["estimates"][program] = points * multiplier
            else:
                result["estimates"][program] = None
    else:
        # All programs
        for prog_name, cabins in programs_data.items():
            points = cabins.get(cabin_class)
            if points is not None:
                result["estimates"][prog_name] = points * multiplier
            else:
                result["estimates"][prog_name] = None

    return result
