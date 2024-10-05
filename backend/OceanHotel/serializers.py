from rest_framework import serializers
from .models import Branch, RoomType, Room, Booking, Coupon, Feedback, Notification, Invoice
from userauths.serializers import UserSerializer
from userauths.models import User


class BranchSerializer(serializers.ModelSerializer):
    manager = UserSerializer()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = '__all__'

    def get_average_rating(self, obj):
        return obj.average_rating()


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    room_type = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.all())
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


class BookingCreateSerializer(serializers.ModelSerializer):
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
            'confirmationCode',
        ]


class BookingSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(many=True, queryset=Room.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    room_type = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.all())
    invoice = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all())

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
            'confirmationCode',
            'invoice',
        ]
        extra_kwargs = {
            'invoice': {'required': False}
        }


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'type',
            'discount',
            'redemptions',
            'max_redemptions',
            'valid_from',
            'valid_to',
            'date',
            'active',
        ]

    def validate(self, data):
        """
        Custom validation for coupon.
        """
        # Kiểm tra xem ngày bắt đầu có trước ngày kết thúc không
        if data['valid_from'] >= data['valid_to']:
            raise serializers.ValidationError("Ngày bắt đầu phải trước ngày kết thúc.")

        return data


class FeedbackSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())
    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Feedback
        fields = ['id', 'booking', 'branch', 'user', 'rating', 'comment', 'feedback_date', 'response']
        read_only_fields = ['feedback_date', 'response']


class NotificationSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Notification
        fields = ['id', 'user', 'booking', 'type', 'seen', 'date', 'content']


class InvoiceCreateSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Invoice
        fields = [
            'id',  # Thêm nếu bạn muốn hiển thị ID
            'user',
            'booking',
            'order_id',
            'amount',
            'description',
            'payment_method',
            'transaction_date',
            'bank_code',
            'status',
            'vnp_response_code',
        ]

    def create(self, validated_data):
        return Invoice.objects.create(**validated_data)


class InvoiceSerializer(serializers.ModelSerializer):
    booking_id = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Invoice
        fields = [
            'id',
            'user',
            'booking_id',
            'order_id',
            'amount',
            'description',
            'payment_method',
            'transaction_date',
            'bank_code',
            'status',
            'vnp_response_code',
        ]
