"""Tests for tool execution handlers."""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.knowledge.cards import card_lookup, get_card_by_id, relax_and_search
from app.knowledge.points import points_estimate
from app.knowledge.cta import cta_lookup
from app.knowledge.search import knowledge_search


class TestCardLookup:
    def test_filter_by_program_qantas(self):
        results = card_lookup(program="qantas")
        assert len(results) > 0
        for card in results:
            # Either direct qantas, or flexible, or has qantas transfer partner
            program = card["program"]
            has_transfer = any(
                tp["program"] == "qantas" for tp in card.get("transfer_partners", [])
            )
            assert program in ("qantas", "flexible", "amex_mr") or has_transfer

    def test_filter_by_program_velocity(self):
        results = card_lookup(program="velocity")
        assert len(results) > 0

    def test_filter_by_max_fee(self):
        results = card_lookup(program="any", max_annual_fee=200)
        assert len(results) > 0
        for card in results:
            first_year = card.get("annual_fee_first_year")
            ongoing = card.get("annual_fee", 0)
            # Card passes if either first-year fee or ongoing fee is within limit
            effective_fee = first_year if first_year is not None else ongoing
            assert effective_fee <= 200 or ongoing <= 200

    def test_filter_min_bonus(self):
        results = card_lookup(program="any", min_signup_bonus=100000)
        for card in results:
            assert card["signup_bonus"]["points"] >= 100000

    def test_exclude_amex(self):
        results = card_lookup(program="any", exclude_networks=["amex"])
        for card in results:
            assert card["network"] != "amex"

    def test_no_results_relaxation(self):
        # Impossible criteria — should relax and find something
        results = relax_and_search(
            program="krisflyer",
            max_annual_fee=0,
            min_signup_bonus=500000,
            exclude_networks=["amex", "visa", "mastercard"],
        )
        assert len(results) > 0  # Relaxation should always return something

    def test_get_card_by_id(self):
        card = get_card_by_id("amex-explorer")
        assert card is not None
        assert card["card_name"] == "American Express Explorer Credit Card"

    def test_get_nonexistent_card(self):
        card = get_card_by_id("nonexistent-card")
        assert card is None

    def test_results_sorted_by_bonus(self):
        results = card_lookup(program="any")
        for i in range(len(results) - 1):
            assert results[i]["signup_bonus"]["points"] >= results[i + 1]["signup_bonus"]["points"]


class TestPointsEstimate:
    def test_syd_to_tokyo_business_qantas(self):
        result = points_estimate("Sydney", "Tokyo", "business", "qantas", "return")
        assert result["found"] is True
        assert result["estimates"]["qantas"] == 144000  # 72000 * 2

    def test_syd_to_tokyo_oneway(self):
        result = points_estimate("SYD", "TYO", "business", "qantas", "oneway")
        assert result["found"] is True
        assert result["estimates"]["qantas"] == 72000

    def test_all_programs(self):
        result = points_estimate("Sydney", "Singapore", "business", "any", "oneway")
        assert result["found"] is True
        assert "qantas" in result["estimates"]
        assert "velocity" in result["estimates"]
        assert "krisflyer" in result["estimates"]

    def test_unknown_route(self):
        result = points_estimate("Sydney", "Antarctica", "business")
        assert result["found"] is False

    def test_city_name_mapping(self):
        result = points_estimate("Melbourne", "London", "economy", "any", "oneway")
        assert result["found"] is True
        assert result["origin"] == "MEL"
        assert result["destination"] == "LON"

    def test_default_return(self):
        result = points_estimate("Sydney", "Tokyo", "economy", "qantas")
        assert result["found"] is True
        assert result["trip_type"] == "return"
        assert result["estimates"]["qantas"] == 72000  # 36000 * 2


class TestCtaLookup:
    def test_email_capture_learning(self):
        cta = cta_lookup("email_capture", intent="LEARNING")
        assert cta is not None
        assert cta["cta_type"] == "email_capture"
        assert "pointhacks.com.au" in cta["url"] or "join.pointhacks.com.au" in cta["url"]

    def test_seat_alert_create(self):
        cta = cta_lookup("seat_alert_create", intent="SEAT_ALERTS")
        assert cta is not None
        assert cta["cta_type"] == "seat_alert_create"

    def test_card_application(self):
        cta = cta_lookup("card_application", card_id="amex-explorer")
        assert cta is not None
        assert cta["cta_type"] == "card_application"
        assert "amex-explorer" in cta["url"]

    def test_guide_link_qantas(self):
        cta = cta_lookup("guide_link", program="qantas", intent="LEARNING")
        assert cta is not None
        assert cta["cta_type"] == "guide_link"

    def test_no_match(self):
        # With expanded CTA directory, guide_links with programs=null match any program
        # So we test a cta_type that truly doesn't exist
        cta = cta_lookup("nonexistent_type")
        assert cta is None


class TestKnowledgeSearch:
    def test_search_qantas(self):
        results = knowledge_search("qantas frequent flyer", program="qantas")
        assert len(results) > 0
        # Should find qantas-related content
        found_qantas = any("qantas" in r["id"].lower() or "qantas" in r["title"].lower() for r in results)
        assert found_qantas

    def test_search_seat_alerts(self):
        results = knowledge_search("how seat alerts work", category="seat-alerts")
        assert len(results) > 0

    def test_search_learning(self):
        results = knowledge_search("how points work", category="learning")
        assert len(results) > 0

    def test_max_results(self):
        results = knowledge_search("points", max_results=2)
        assert len(results) <= 2

    def test_empty_query(self):
        results = knowledge_search("")
        # May return empty or scored results
        assert isinstance(results, list)
