from rest_framework import serializers

from accounts.models import User

from .models import Conversation, ConversationParticipant, Message

PARTICIPANT_LIMIT = 2


class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "display_name", "role", "avatar", "department", "faculty")


class MessageSerializer(serializers.ModelSerializer):
    sender = ParticipantSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ("id", "conversation", "sender", "body", "read_at", "created_at")
        read_only_fields = ("id", "sender", "read_at", "created_at")


class ConversationSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        write_only=True, many=True, queryset=User.objects.all(), source="participants", required=False
    )
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ("id", "participants", "participant_ids", "last_message", "unread_count", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def get_last_message(self, obj):
        last = obj.messages.last()
        return MessageSerializer(last).data if last else None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        membership = obj.memberships.filter(user=user).first()
        qs = obj.messages.exclude(sender=user)
        if membership and membership.last_read_at:
            qs = qs.filter(created_at__gt=membership.last_read_at)
        return qs.count()

    def validate_participant_ids(self, participants):
        participants = list(participants)
        if len(participants) != PARTICIPANT_LIMIT - 1:
            raise serializers.ValidationError(f"Provide exactly {PARTICIPANT_LIMIT - 1} other participant.")
        if any(p.id == self.context["request"].user.id for p in participants):
            raise serializers.ValidationError("You cannot message yourself.")
        return participants

    def create(self, validated_data):
        others = validated_data.pop("participants")
        user = self.context["request"].user
        others_ids = sorted([user.id, *[p.id for p in others]])
        existing = Conversation.objects.filter(memberships__user=user)
        for conv in existing.distinct():
            member_ids = sorted(conv.participants.values_list("id", flat=True))
            if member_ids == others_ids:
                self.conversation_existed = True
                return conv
        conversation = Conversation.objects.create()
        ConversationParticipant.objects.bulk_create(
            [
                ConversationParticipant(conversation=conversation, user=user),
                ConversationParticipant(conversation=conversation, user=others[0]),
            ]
        )
        self.conversation_existed = False
        return conversation


class ConversationDetailSerializer(ConversationSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ("messages",)