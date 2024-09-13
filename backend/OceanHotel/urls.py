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
r.register(r'sendemail', views.SendEmailViewSet, basename='sendemail')
r.register(r'coupon', views.CouponViewSet, basename='coupon')
r.register(r'feedback', views.FeedbackViewSet, basename='feedback')
r.register(r'notification', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(r.urls)),
    # path('o/', include('oauth2_provider.urls', namespace='oauth2_provider'))
]
