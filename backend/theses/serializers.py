from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import AccessRequest, SavedThesis, Tag, Thesis

User = get_user_model()

MAX_PDF_SIZE = 10 * 1024 * 1024  # 10 MB


class TagField(serializers.ListField):
    """Accept a list of tag strings; write them as normalized Tag objects."""

    child = serializers.CharField(max_length=60)
    required = False

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("required", False)
        kwargs.setdefault("allow_empty", True)
        super().__init__(*args, **kwargs)

    def to_representation(self, value):
        return [tag.name for tag in value.all()]

    def to_internal_value(self, data):
        tags = super().to_internal_value(data)
        return [Tag.objects.get_or_create(name=tag.strip())[0] for tag in tags if tag.strip()]


class ThesisSerializer(serializers.ModelSerializer):
    tags = TagField()
    author = serializers.CharField(max_length=150, required=False)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    saved = serializers.SerializerMethodField()
    access_requests_count = serializers.SerializerMethodField()

    class Meta:
        model = Thesis
        fields = (
            "id",
            "title",
            "author",
            "owner",
            "department",
            "faculty",
            "year",
            "abstract",
            "supervisor",
            "tags",
            "status",
            "access_policy",
            "file",
            "processing_status",
            "views",
            "downloads",
            "created_at",
            "updated_at",
            "saved",
            "access_requests_count",
        )
        read_only_fields = ("created_at", "updated_at", "processing_status", "views", "downloads")

    def get_saved(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return SavedThesis.objects.filter(user=user, thesis=obj).exists()

    def get_access_requests_count(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated or user.id != obj.owner_id:
            return None
        return obj.access_requests.filter(status=AccessRequest.Status.PENDING).count()

    def validate_file(self, file):
        if file.size > MAX_PDF_SIZE:
            raise serializers.ValidationError("PDF must be 10 MB or smaller.")
        if file.content_type and file.content_type != "application/pdf":
            raise serializers.ValidationError("Only PDF files are allowed.")
        return file

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        validated_data.setdefault("owner", self.context["request"].user)
        if not validated_data.get("author"):
            validated_data["author"] = self.context["request"].user.display_name
        thesis = Thesis.objects.create(**validated_data)
        thesis.tags.set(tags)
        return thesis

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance


class ThesisListSerializer(ThesisSerializer):
    class Meta(ThesisSerializer.Meta):
        fields = (
            "id",
            "title",
            "author",
            "department",
            "faculty",
            "year",
            "abstract",
            "supervisor",
            "tags",
            "status",
            "access_policy",
        )


class AccessRequestSerializer(serializers.ModelSerializer):
    requester = serializers.StringRelatedField(read_only=True)
    thesis_title = serializers.CharField(source="thesis.title", read_only=True)

    class Meta:
        model = AccessRequest
        fields = ("id", "thesis", "thesis_title", "requester", "message", "status", "created_at")
        read_only_fields = ("id", "thesis_title", "requester", "created_at")

    def validate_thesis(self, thesis):
        if thesis.is_public():
            raise serializers.ValidationError("This thesis is already public — no request needed.")
        user = self.context["request"].user
        if thesis.owner_id == user.id:
            raise serializers.ValidationError("You own this thesis.")
        if AccessRequest.objects.filter(thesis=thesis, requester=user).exists():
            raise serializers.ValidationError("You have already requested access to this thesis.")
        return thesis