from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.signing import BadSignature, dumps, loads
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    DetailSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()

RESET_TOKEN_SALT = "oau-thesis-password-reset"
RESET_TOKEN_MAX_AGE = 30 * 60  # seconds


class RegisterView(generics.CreateAPIView):
    """Create a user account and return JWTs so the client is signed in immediately."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """Return or update the currently authenticated user's profile."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@extend_schema(request=PasswordChangeSerializer, responses={200: DetailSerializer})
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password updated."})


@extend_schema(request=PasswordResetRequestSerializer, responses={200: DetailSerializer})
class PasswordResetView(APIView):
    """Send a password reset token by email. Always returns 200 (no user enumeration)."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()
        if user:
            token = dumps(user.pk, salt=RESET_TOKEN_SALT, compress=True)
            reset_path = f"/api/auth/password-reset/confirm/?token={token}"
            send_mail(
                subject="OAU Thesis Bank — Password reset",
                message=(
                    f"Hello {user.display_name},\n\n"
                    f"You requested a password reset. Use the token below to set a new password "
                    f"(valid for 30 minutes):\n\n"
                    f"Reset token: {token}\n\n"
                    f"Confirm endpoint: {request.build_absolute_uri('/api/auth/password-reset/confirm/')}\n"
                    f"(POST {{'token': ..., 'new_password': ...}} to that endpoint, or open {reset_path})\n\n"
                    f"If you didn't request this, you can ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
        return Response({"detail": "If that email exists, a reset link has been sent."})


@extend_schema(request=PasswordResetConfirmSerializer, responses={200: DetailSerializer})
class PasswordResetConfirmView(APIView):
    """Set a new password using an emailed reset token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        try:
            user_id = loads(token, salt=RESET_TOKEN_SALT, max_age=RESET_TOKEN_MAX_AGE)
        except (BadSignature, ValueError, TypeError, StopIteration):
            return Response(
                {"detail": "Invalid or expired reset token."}, status=status.HTTP_400_BAD_REQUEST
            )
        user = User.objects.filter(pk=user_id).first()
        if not user:
            return Response(
                {"detail": "Invalid or expired reset token."}, status=status.HTTP_400_BAD_REQUEST
            )
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password reset complete."})