from rest_framework import serializers

from accounts.models import User

from .models import AuditEvent, ModerationItem


class ModerationItemSerializer(serializers.ModelSerializer):
    thesis_title = serializers.CharField(source="thesis.title", read_only=True)
    thesis_author = serializers.CharField(source="thesis.author", read_only=True)
    thesis_department = serializers.CharField(source="thesis.department", read_only=True)
    reporter_name = serializers.CharField(source="reporter.display_name", read_only=True)
    reviewer_name = serializers.CharField(source="reviewer.display_name", read_only=True)

    class Meta:
        model = ModerationItem
        fields = (
            "id",
            "thesis",
            "thesis_title",
            "thesis_author",
            "thesis_department",
            "flag_type",
            "similarity_score",
            "note",
            "reporter",
            "reporter_name",
            "status",
            "reviewer",
            "reviewer_name",
            "created_at",
            "reviewed_at",
        )
        read_only_fields = fields


class ModerationReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=["approved", "dismissed"])
    note = serializers.CharField(required=False, allow_blank=True)


class UserAdminSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="display_name", read_only=True)
    joined = serializers.DateTimeField(source="date_joined", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "name",
            "email",
            "role",
            "status",
            "department",
            "faculty",
            "avatar",
            "joined",
        )
        read_only_fields = ("email", "joined", "avatar")


class UserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=User.Role.choices, required=False)
    status = serializers.ChoiceField(choices=User.Status.choices, required=False)


class AuditEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.display_name", read_only=True, allow_null=True)

    class Meta:
        model = AuditEvent
        fields = ("id", "actor", "actor_name", "action", "subject_type", "subject_id", "detail", "created_at")
        read_only_fields = fields


class ServiceHealthSerializer(serializers.Serializer):
    db = serializers.CharField()
    storage = serializers.CharField()


class AdminSummarySerializer(serializers.Serializer):
    total_theses = serializers.IntegerField()
    published_theses = serializers.IntegerField()
    draft_theses = serializers.IntegerField()
    restricted_theses = serializers.IntegerField()
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    suspended_users = serializers.IntegerField()
    pending_moderation = serializers.IntegerField()
    pending_access_requests = serializers.IntegerField()
    moderation_by_type = serializers.DictField(child=serializers.IntegerField())
    health = ServiceHealthSerializer()
    recent_activity = AuditEventSerializer(many=True)