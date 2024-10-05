import json
from django.db.models import Q
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.serializers.json import DjangoJSONEncoder

from .models import RoomChat, Messages
from userauths.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.list_event = {
            "chat": self.build_message_chat,
            "previous_messages": self.previous_messages
        }

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        print("self.room_name", self.room_name)
        print("self.room_group_name", self.room_group_name)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    @database_sync_to_async
    def get_previous_messages(self, sender_id, receiver_id, branch_id):
        try:
            room = RoomChat.objects.get(
                (Q(sender_id=sender_id) & Q(receiver_id=receiver_id) |
                 Q(sender_id=receiver_id) & Q(receiver_id=sender_id)) &
                Q(branch_id=branch_id)
            )
            messages = Messages.objects.filter(room=room).select_related('sender').order_by('timestamp')
            return [{
                'message': msg.message,
                'branch_id': room.branch.id,  # Change jobId to branchId
                'sender': {
                    'id': msg.sender.id,
                    'username': msg.sender.username,
                    'avatar': msg.sender.avatar.url if msg.sender.avatar else None,
                },
                'sender_id': msg.sender.id,
                'receiver_id': receiver_id
            } for msg in messages]
        except RoomChat.DoesNotExist:
            return []

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        message = json.loads(text_data)
        print("message", message)
        event_handler = self.list_event.get(message.get("type"))
        if event_handler:
            await event_handler(message)

    async def previous_messages(self, message):
        sender_id = message.get('sender_id')
        receiver_id = message.get('receiver_id')
        branch_id = message.get('branch_id')

        previous_msgs = await self.get_previous_messages(sender_id, receiver_id, branch_id)

        await self.send(text_data=json.dumps({
            'type': 'previous_messages',
            'messages': previous_msgs
        }, cls=DjangoJSONEncoder))

    async def build_message_chat(self, text_data_json):
        message = text_data_json.get('message', [])
        branch_id = text_data_json.get('branch_id', [])
        sender_id = text_data_json.get('sender_id', [])
        receiver_id = text_data_json.get('receiver_id', [])
        sender = text_data_json.get('sender', [])

        room = await self.get_or_create_chatroom(sender_id, receiver_id, branch_id)
        await self.save_message(room, sender_id, message, branch_id)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'branchId': branch_id,
                'sender': sender,
                'sender_id': sender_id,
                'receiver_id': receiver_id,
            }
        )

    async def chat_message(self, event):
        message = event['message']
        branch_id = event['branchId']
        sender = event['sender']
        sender_id = event['sender_id']
        receiver_id = event['receiver_id']

        await self.send(text_data=json.dumps({
            'message': message,
            'branchId': branch_id,
            'sender': sender,
            'sender_id': sender_id,
            'receiver_id': receiver_id
        }))

    @database_sync_to_async
    def get_or_create_chatroom(self, sender_id, receiver_id, branch_id):
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        room = RoomChat.objects.filter(
            (Q(sender=sender) & Q(receiver=receiver)) |
            (Q(sender=receiver) & Q(receiver=sender) & Q(branch_id=branch_id))
        ).first()

        # If no chat room, create a new one
        if not room:
            room = RoomChat.objects.create(sender=sender, receiver=receiver,
                                       branch_id=branch_id)

        return room

    @database_sync_to_async
    def save_message(self, room, sender_id, message, branch_id):
        sender = User.objects.get(id=sender_id)
        Messages.objects.create(room=room, sender=sender, message=message,
                               branch_id=branch_id)
