from rest_framework import serializers
from ..models import Bill
from .Booking import ReservationSerializer


class BillSerializer(serializers.ModelSerializer):
    reservation = ReservationSerializer()

    class Meta:
        model = Bill
        fields = '__all__'
