from django.utils import timezone
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from notifications.services import notify

from .models import Conversation, ConversationParticipant, Message
from .serializers import ConversationDetailSerializer, ConversationSerializer, MessageSerializer


class ConversationViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Direct-message conversations (currently 1-on-1)."""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).prefetch_related(
            "participants", "messages"
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ConversationDetailSerializer
        return ConversationSerializer

    def get_object(self):
        conversation = super().get_object()
        membership = conversation.memberships.filter(user=self.request.user).first()
        membership.last_read_at = timezone.now()
        membership.save(update_fields=["last_read_at"])
        return conversation

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        conversation = self.get_object()
        body = (request.data.get("body") or "").strip()
        if not body:
            raise ValidationError({"body": "Message body is required."})
        message = Message.objects.create(conversation=conversation, sender=request.user, body=body)
        for participant in conversation.participants.exclude(id=request.user.id):
            notify(
                recipient=participant,
                actor=request.user,
                notification_type="message",
                title="New message",
                message=f"{request.user.display_name}: {body[:140]}",
            )
        return Response(MessageSerializer(message).data, status=201)