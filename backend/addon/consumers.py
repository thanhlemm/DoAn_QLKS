# consumers.py
import json
from asgiref.sync import sync_to_async

from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatRoom, Message
from userauths.models import User


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # async def receive(self, text_data):
    #     from .models import ChatRoom, Message
    #     from userauths.models import User
    #     data = json.loads(text_data)
    #     message = data['message']
    #     sender_id = data['sender']

    #     # Find the chat room
    #     room = ChatRoom.objects.get(id=self.room_id)
    #     sender = User.objects.get(id=sender_id)

    #     # Save the message to the database
    #     Message.objects.create(room=room, sender=sender, content=message)

    #     # Send message to room group
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             'type': 'chat_message',
    #             'message': message,
    #             'sender': sender.username
    #         }
    #     )
    async def receive(self, text_data):
        # from .models import ChatRoom, Message
        # from userauths.models import User
        data = json.loads(text_data)
        message = data.get('message')
        sender_id = data.get('sender')

        if not message or not sender_id:
            return  # Optionally send an error back to the user

        try:
            room = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
            sender = await sync_to_async(User.objects.get)(id=sender_id)

            # Save the message to the database
            await sync_to_async(Message.objects.create)(room=room, sender=sender, content=message)

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender.username
                }
            )
        except (ChatRoom.DoesNotExist, User.DoesNotExist) as e:
            # Handle the error (log it, notify the user, etc.)
            print(f"Error: {e}")

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))

