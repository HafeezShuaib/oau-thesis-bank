from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name", "role", "department", "faculty", "avatar", "status")
        read_only_fields = ("id",)

    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return obj.display_name


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "password", "name", "role", "department", "faculty")

    name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs.get("role") == "admin":
            raise serializers.ValidationError({"role": "Admins must be provisioned by an existing admin."})
        return attrs

    def create(self, validated_data):
        name = validated_data.pop("name", "")
        first, _, last = name.partition(" ")
        user = User.objects.create_user(
            email=validated_data.pop("email"),
            password=validated_data.pop("password"),
            first_name=first,
            last_name=last,
            **validated_data,
        )
        user.avatar = (name[:2] or user.email[:2]).upper()
        user.save(update_fields=["avatar"])
        return user


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Your current password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)


class DetailSerializer(serializers.Serializer):
    detail = serializers.CharField()