from rest_framework import serializers
from ..models import Branch, RoomType, Room, Promotion, Notification, Role, Service
from .Account import AccountSerializer


class BranchSerializer(serializers.ModelSerializer):
    manager = AccountSerializer()

    class Meta:
        model = Branch
        fields = ['id', 'name', 'address', 'phone', 'manager']


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ['id', 'nameRoomType', 'price', 'quantity', 'image']


class RoomSerializer(serializers.ModelSerializer):
    roomType = RoomTypeSerializer()
    branch = BranchSerializer()

    class Meta:
        model = Room
        fields = ['id', 'nameRoom', 'roomType', 'branch', 'status']


class PromotionSerializer(serializers.ModelSerializer):
    branch = BranchSerializer()

    class Meta:
        model = Promotion
        fields = ['id', 'code', 'description', 'discount', 'branch']


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'nameService', 'price']


class NotificationSerializer(serializers.ModelSerializer):
    recipient = AccountSerializer()

    class Meta:
        model = Notification
        fields = '__all__'
