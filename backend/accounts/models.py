from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Manager for the custom User model (email is the login identifier)."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user tied to the frontend contract: role, department, faculty, status."""

    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        RESEARCHER = "researcher", "Researcher"
        FACULTY = "faculty", "Faculty"
        ADMIN = "admin", "Admin"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        PENDING = "pending", "Pending"

    username = None
    email = models.EmailField("email address", unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    department = models.CharField(max_length=150, blank=True)
    faculty = models.CharField(max_length=150, blank=True)
    avatar = models.CharField(max_length=10, blank=True, help_text="Initials shown in the UI")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def display_name(self):
        return self.get_full_name() or self.email