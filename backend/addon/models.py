from django.db import models
from userauths.models import User


class RoomChat(models.Model):
    branch = models.ForeignKey('OceanHotel.Branch', related_name='chat_rooms', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sender_rooms', on_delete=models.CASCADE, null=True, blank=True)
    receiver = models.ForeignKey(User, related_name='receiver_rooms', on_delete=models.CASCADE, null=True,
                                 blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Đảm bảo mỗi cặp người dùng (sender, receiver) chỉ có một phòng chat.
        unique_together = ('sender', 'receiver')

    def __str__(self):
        return f"ChatRoom between {self.sender.username} and {self.receiver.username}"


class Messages(models.Model):
    room = models.ForeignKey(RoomChat, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    message = models.TextField()
    branch = models.ForeignKey('OceanHotel.Branch', related_name='branch_message', on_delete=models.CASCADE, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} in room {self.room.id}"
