from django.conf import settings
from django.core.mail import send_mail

from .models import Notification


def notify(recipient, actor, notification_type, title, message="", object_id=None):
    """Create an in-app notification and optionally fan out an email.

    Emails are only sent when EMAIL_NOTIFICATIONS_ENABLED is true (default off),
    so tests and local runs never depend on an SMTP server.
    """
    if not recipient or not recipient.is_active:
        return None
    if recipient.id == getattr(actor, "id", None):
        return None

    notification = Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notification_type=notification_type,
        title=title,
        message=message,
    )

    if getattr(settings, "EMAIL_NOTIFICATIONS_ENABLED", False) and recipient.email:
        send_mail(
            subject=f"[OAU Thesis Bank] {title}",
            message=f"{message}\n\nYou have a new notification in the OAU Thesis Bank.",
            from_email=None,
            recipient_list=[recipient.email],
            fail_silently=True,
        )
    return notification