from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.analytics import log_cta_click, record_cta_click
from app.session.manager import create_session, delete_session, get_session, save_session

router = APIRouter()


@router.get("/session/{session_id}")
async def get_session_state(session_id: str):
    """Get current session state (for debugging/admin)."""
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session.model_dump()


@router.post("/session/{session_id}/reset")
async def reset_session(session_id: str):
    """Clear session and start fresh."""
    await delete_session(session_id)
    new_session = await create_session()
    return {"session_id": new_session.session_id, "status": "reset"}


class CtaClickRequest(BaseModel):
    cta_id: str


@router.post("/session/{session_id}/cta-click")
async def track_cta_click(session_id: str, request: CtaClickRequest):
    """Track a CTA click event."""
    session = await get_session(session_id)
    if session:
        session.analytics.ctas_clicked.append(request.cta_id)
        await save_session(session)
    log_cta_click(session_id, request.cta_id)
    record_cta_click(request.cta_id)
    return {"status": "ok"}
