from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField


class Role(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class User(AbstractUser):
    fullname = models.CharField(max_length=100)
    avatar = CloudinaryField(null=True)
    DOB = models.DateField(null=True)
    address = models.CharField(max_length=200, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)

    class Sex(models.IntegerChoices):
        NAM = 1, 'Nam'
        NU = 2, 'Nữ'

    sex = models.IntegerField(choices=Sex.choices, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    google_id = models.CharField(max_length=255, unique=True, null=True)
    github_id = models.CharField(max_length=255, unique=True, null=True)

    def clean(self):
        if self.google_id is None and self.github_id is None:
            raise ValidationError("One of google_id or github_id must be set.")