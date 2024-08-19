from rest_framework import routers
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
#

r = routers.DefaultRouter()
r.register(r'branch', views.BranchViewSet, basename='branch')
r.register(r'roomtypes', views.RoomTypeViewSet, basename='roomtype')
r.register(r'rooms', views.RoomViewSet, basename='room')
r.register(r'booking', views.BookingViewSet, basename='booking')
# r.register(r'services', views.ServiceViewSet, basename='service')
#
#
urlpatterns = [
    path('', include(r.urls)),
    # path('o/', include('oauth2_provider.urls', namespace='oauth2_provider'))
]
