from rest_framework import serializers
from .models import Branch, RoomType, Room
from userauths.serializers import UserSerializer


class BranchSerializer(serializers.ModelSerializer):
    manager = UserSerializer()

    class Meta:
        model = Branch
        fields = '__all__'


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    room_type = RoomTypeSerializer()
    branch = BranchSerializer()

    price = serializers.SerializerMethodField()
    number_of_beds = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = '__all__'

    def get_price(self, obj):
        return obj.price()

    def get_number_of_beds(self, obj):
        return obj.number_of_beds()


# Serializer kiểm tra phòng còn trống
class RoomAvailabilitySerializer(serializers.Serializer):
    branch_id = serializers.IntegerField()
    room_type_id = serializers.IntegerField()
    checkin = serializers.DateField()
    checkout = serializers.DateField()
