from rest_framework import serializers

from .Account import AccountSerializer
from .Admin import RoomSerializer, ServiceSerializer
from ..models import Reservation, ReservationService, Refund, Account


class ReservationServiceSerializer(serializers.ModelSerializer):
    service = ServiceSerializer()
    price = serializers.CharField(source='service.price')

    class Meta:
        model = ReservationService
        fields = ['service', 'price', 'quantity']


class ReservationSerializer(serializers.ModelSerializer):
    guest = AccountSerializer()
    room = RoomSerializer(many=True)
    services = ReservationServiceSerializer(source='reservationservice_set', many=True, read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'guest', 'services', 'room', 'bookDate', 'checkin', 'checkout', 'statusCheckin', 'active']


class RefundSerializer(serializers.ModelSerializer):
    guest = serializers.SerializerMethodField()
    reservation = serializers.SerializerMethodField()

    class Meta:
        model = Refund
        fields = ['id', 'guest', 'reservation', 'reason']

    def get_guest(self, obj):
        return {
            'id': obj.guest.id,
            'name': obj.guest.name,
            'role': obj.guest.role.name
        }

    def get_reservation(self, obj):
        return {
            'id': obj.reservation.id,
            'guest_name': obj.reservation.guest.name,
            'room': obj.reservation.room
        }


class RefundCreateSerializer(serializers.ModelSerializer):
    guest = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())
    reservation = serializers.PrimaryKeyRelatedField(queryset=Reservation.objects.all())

    class Meta:
        model = Refund
        fields = ['id', 'guest', 'reservation', 'reason']
