from django.db import models
from userauths.models import User


class ChatRoom(models.Model):
    branch = models.ForeignKey('OceanHotel.Branch', related_name='chat_rooms', on_delete=models.CASCADE)
    customer = models.ForeignKey(User, related_name='customer_chat_rooms', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Room Chat {self.id} for branch {self.branch.name} with customer {self.customer.username}'


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender.username}: {self.content[:20]}'
