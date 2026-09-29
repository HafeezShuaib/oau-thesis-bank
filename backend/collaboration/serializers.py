from rest_framework import serializers

from accounts.models import User
from theses.serializers import TagField

from .models import CollaborationOpportunity, MentorshipRequest


class UserLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "display_name", "role", "department", "faculty", "avatar")


class CollaborationOpportunitySerializer(serializers.ModelSerializer):
    skills = TagField()
    owner = UserLiteSerializer(read_only=True)

    class Meta:
        model = CollaborationOpportunity
        fields = ("id", "title", "description", "owner", "skills", "status", "created_at", "updated_at")
        read_only_fields = ("id", "owner", "created_at", "updated_at")

    def create(self, validated_data):
        skills = validated_data.pop("skills", [])
        validated_data["owner"] = self.context["request"].user
        opportunity = CollaborationOpportunity.objects.create(**validated_data)
        opportunity.skills.set(skills)
        return opportunity

    def update(self, instance, validated_data):
        skills = validated_data.pop("skills", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if skills is not None:
            instance.skills.set(skills)
        return instance


class MentorshipRequestSerializer(serializers.ModelSerializer):
    mentor = UserLiteSerializer(read_only=True)
    mentee = UserLiteSerializer(read_only=True)
    mentor_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=User.objects.all(),
        source="mentor",
        required=True,
    )

    class Meta:
        model = MentorshipRequest
        fields = ("id", "mentor", "mentor_id", "mentee", "message", "status", "created_at")
        read_only_fields = ("id", "mentee", "status", "created_at")

    def validate_mentor_id(self, mentor):
        user = self.context["request"].user
        if mentor.id == user.id:
            raise serializers.ValidationError("You cannot request mentorship from yourself.")
        if mentor.role not in ("researcher", "faculty", "admin"):
            raise serializers.ValidationError("This user is not available as a mentor.")
        if MentorshipRequest.objects.filter(mentor=mentor, mentee=user).exists():
            raise serializers.ValidationError("You have already sent a mentorship request to this user.")
        return mentor