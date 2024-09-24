from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom
from .serializers import ChatRoomCreateSerializer
from userauths.models import User


class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomCreateSerializer

    @action(detail=False, methods=['post'], url_path='create-room')
    def create_chat_room(self, request):
        customer_identifier = request.data.get('customer')

        # Kiểm tra username hoặc email có tồn tại hay không
        try:
            customer = User.objects.get(username=customer_identifier)
        except User.DoesNotExist:
            try:
                customer = User.objects.get(email=customer_identifier)
            except User.DoesNotExist:
                return Response({"error": "User not found with the provided username or email"},
                                status=status.HTTP_404_NOT_FOUND)

        serializer = ChatRoomCreateSerializer(data=request.data)
        if serializer.is_valid():
            chat_room = serializer.save()
            return Response({
                "message": "Chat room created successfully",
                "room_id": chat_room.id,
                "branch": chat_room.branch.name,
                "customer": chat_room.customer.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
