from rest_framework import serializers
from ..models import CheckinReceipt
from .Booking import ReservationSerializer
from .Account import AccountSerializer


class CheckinReceiptSerializer(serializers.ModelSerializer):
    reservation = ReservationSerializer()
    received_by = AccountSerializer()

    class Meta:
        model = CheckinReceipt
        fields = '__all__'
