from rest_framework import serializers
from .models import Branch, RoomType, Room, Booking
from userauths.serializers import UserSerializer
from userauths.models import User


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


class BookingSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(many=True, queryset=Room.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    room_type = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.all())
    # room_type = RoomTypeSerializer()

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'payment_status',
            'email',
            'phone',
            'branch',
            'room_type',
            'room',
            'before_discount',
            'total',
            'saved',
            'check_in_date',
            'check_out_date',
            'total_days',
            'checked_in',
            'checked_out',
            'is_active',
            'checked_in_tracker',
            'checked_out_tracker',
            'date',
        ]
