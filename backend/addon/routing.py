# from django.urls import path
#
# from .consumers import ChatConsumer
#
# websocket_urlpatterns = [
#     path(r'ws/<str:room_name>/', ChatConsumer.as_asgi()),
# ]
from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/(?P<room_name>\d+)/$', ChatConsumer.as_asgi()),
]
