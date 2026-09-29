from accounts.models import User
from rest_framework import serializers

from .models import ResearcherProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "display_name", "first_name", "last_name", "role", "department", "faculty", "avatar", "status")


class ResearcherProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=User.objects.all(), required=False)

    class Meta:
        model = ResearcherProfile
        fields = (
            "id",
            "user",
            "user_id",
            "bio",
            "orcid",
            "github",
            "website",
            "research_interests",
            "is_available_for_mentoring",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def create(self, validated_data):
        user_id = validated_data.pop("user_id", None)
        if user_id is None:
            user_id = self.context["request"].user
        profile, _ = ResearcherProfile.objects.get_or_create(user=user_id, defaults=validated_data)
        return profile

    def update(self, instance, validated_data):
        validated_data.pop("user_id", None)
        return super().update(instance, validated_data)