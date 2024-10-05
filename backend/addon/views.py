from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import RoomChat
from .serializers import RoomChatSerializer
from django.db import models


class RoomChatViewSet(viewsets.ViewSet,
                      generics.RetrieveAPIView,
                      generics.ListAPIView):
    queryset = RoomChat.objects.all()
    serializer_class = RoomChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        branch = self.request.query_params.get('branch')
        user = self.request.user  # Get the logged-in receptionist

        # Filter by branch and either sender or receiver being the receptionist
        if branch:
            return self.queryset.filter(branch_id=branch).filter(
                models.Q(sender=user) | models.Q(receiver=user)
            )
        return self.queryset.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        )
