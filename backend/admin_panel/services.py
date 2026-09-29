from .models import AuditEvent

__all__ = ["log_event"]


def log_event(actor, action, subject_type="", subject_id=None, detail=""):
    """Record a platform activity event for the admin audit/activity feed."""
    AuditEvent.objects.create(
        actor=actor,
        action=action,
        subject_type=subject_type or "",
        subject_id=subject_id,
        detail=detail or "",
    )