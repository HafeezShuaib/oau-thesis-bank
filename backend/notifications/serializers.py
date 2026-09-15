from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.display_name", read_only=True, default=None)

    class Meta:
        model = Notification
        fields = ("id", "actor", "actor_name", "notification_type", "title", "message", "is_read", "created_at")
        read_only_fields = fields