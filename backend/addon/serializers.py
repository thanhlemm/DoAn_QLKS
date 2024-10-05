from rest_framework import serializers
from .models import RoomChat
from userauths.models import User
from OceanHotel.models import Branch
from userauths.serializers import UserSerializer


class RoomChatSerializer(serializers.ModelSerializer):
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    sender = UserSerializer()
    receiver = UserSerializer()

    class Meta:
        model = RoomChat
        fields = ['id', 'branch', 'sender', 'receiver', 'created_at']
