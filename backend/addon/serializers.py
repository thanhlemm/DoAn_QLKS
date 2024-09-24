from rest_framework import serializers
from .models import ChatRoom
from userauths.models import User
from OceanHotel.models import Branch


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    customer = serializers.SlugRelatedField(
        slug_field='username',
        queryset=User.objects.all()
    )

    class Meta:
        model = ChatRoom
        fields = ['branch', 'customer', 'created_at']