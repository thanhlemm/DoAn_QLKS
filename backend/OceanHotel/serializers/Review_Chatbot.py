from rest_framework import serializers

from .Account import AccountSerializer
from .Booking import ReservationSerializer
from ..models import Review, ChatbotMessage


class ReviewSerializer(serializers.ModelSerializer):
    reservation = ReservationSerializer()

    class Meta:
        model = Review
        fields = ['id', 'reservation', 'rating', 'comment']


class ChatbotMessageSerializer(serializers.ModelSerializer):
    user = AccountSerializer()

    class Meta:
        model = ChatbotMessage
        fields = ['id', 'user', 'message', 'response']

