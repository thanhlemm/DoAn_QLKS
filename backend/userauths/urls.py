from rest_framework import routers
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
# from .views.google_oauth_signup import GoogleOAuth2SignUpView
# from .views.google_oauth_signup_callback import GoogleOAuth2SignUpCallbackView
# from .views.google_oauth_login import GoogleOAuth2LoginView
# from .views.google_oauth_login_callback import GoogleOAuth2LoginCallbackView

r = routers.DefaultRouter()
r.register('user', views.UserViewSet, basename='user')
r.register('role', views.RoleViewSet, basename='role')

urlpatterns = [
    path('', include(r.urls)),
    path(
        "google/callback/login",
        views.GoogleOAuth2LoginCallbackView.as_view(),
        name="google_login_callback",
    ),
    path(
        "facebook/callback/login",
        views.FacebookLoginCallbackView.as_view(),
        name="facebook_login_callback",
    ),

    # path('o/', include('oauth2_provider.urls', namespace='oauth2_provider'))
]
