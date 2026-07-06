from collections import Counter
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.visit import VisitEvent


def build_admin_stats(db: Session) -> dict[str, object]:
    visits = db.scalars(select(VisitEvent).order_by(VisitEvent.entered_at.desc())).all()
    week_ago = datetime.now() - timedelta(days=7)
    durations = [visit.duration_seconds for visit in visits if visit.duration_seconds]

    return {
        "total_visits": len(visits),
        "visits_this_week": sum(visit.entered_at >= week_ago for visit in visits),
        "average_duration_seconds": (
            round(sum(durations) / len(durations)) if durations else 0
        ),
        "device_breakdown": dict(Counter(visit.device_type for visit in visits)),
        "unlock_method_breakdown": dict(
            Counter(visit.unlock_method for visit in visits if visit.unlock_method)
        ),
        "recent_visits": [
            {
                "ip_hash": visit.ip_hash,
                "device_type": visit.device_type,
                "entered_at": visit.entered_at,
                "duration_seconds": visit.duration_seconds,
                "screens_completed": visit.screens_completed,
            }
            for visit in visits[:20]
        ],
    }
