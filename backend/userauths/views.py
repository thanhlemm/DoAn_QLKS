from django.contrib.auth.models import AnonymousUser
from rest_framework import status, viewsets, generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer, UserSerializer
from .models import User, UserProfile, Role
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import redirect
from django.urls import reverse
from userauths.utils import google_setup, upload_image_from_url

from userauths.utils import google_callback
from django.http import JsonResponse
from rest_framework.authtoken.models import Token
from oauth2_provider.models import AccessToken, RefreshToken, Application
from oauthlib.common import generate_token


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView,
                  generics.RetrieveAPIView,
                  generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Bạn có thể tùy chỉnh queryset tại đây
        return User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        # Đã được chứng thực rồi thì không cần truy vấn nữa => Xác định đây là người dùng luôn
        # user = user hiện đang đăng nhập
        user = request.user

        return Response(UserSerializer(user).data)

    # API cập nhật một phần cho User
    @action(methods=['patch'], url_path='patch-current-user', detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def patch_current_user(self, request):
        user = request.user
        if request.method == 'PATCH':
            for k, v in request.data.items():
                setattr(user, k, v)
            user.save()
            return Response(UserSerializer(user).data)
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    # API xóa tài khoản
    # /users/<user_id>/delete-account/
    @action(detail=True, methods=['delete'], url_path='delete-account')
    def delete_account(self, request, pk=None):
        try:
            # Lấy user từ pk hoặc raise 404 nếu không tìm thấy
            user = get_object_or_404(User, pk=pk)

            # Kiểm tra quyền hạn: Chỉ người tạo mới có quyền xóa hoặc admin
            if request.user.role.name == "Admin" or request.user == user:
                user.delete()
                return Response({"message": "User account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "You do not have permission to delete this user account."},
                                status=status.HTTP_403_FORBIDDEN)

        except User.DoesNotExist:
            return Response({"error": "User account not found."}, status=status.HTTP_404_NOT_FOUND)


class GoogleOAuth2LoginCallbackView(APIView):
    def get(self, request):
        redirect_uri = request.build_absolute_uri(reverse("google_login_callback"))
        auth_uri = request.build_absolute_uri()

        user_data = google_callback(redirect_uri, auth_uri)

        # Lấy URL frontend từ OAuth state
        frontend_url = request.GET.get('state')
        
        if frontend_url is None:
            return JsonResponse({"error": "State (frontend URL) is missing."}, status=400)
        # try:
        #     user = User.objects.get(username=user_data["email"])
        # except User.DoesNotExist:
        #     # return JsonResponse(
        #     #     {"error": "User does not exist. Please sign up first."}, status=400
        #     # )
        #     signup_url = f"http://127.0.0.1:3000/register?email={user_data['email']}"
        #     return redirect(signup_url)
        user_picture = user_data.get('picture')
        # Use get_or_create since an existing user may end up signing in
        # through the sign up route.
        user, _ = User.objects.get_or_create(
            username=user_data["email"],
            defaults={"first_name": user_data["given_name"],
                      "last_name": user_data.get("family_name", ""),
                      "role": Role.objects.get(id=3),  # Thiết lập role mặc định là khách hàng
                      'avatar': upload_image_from_url(user_picture)
                      }

        )

        # Populate the extended user data stored in UserProfile.
        UserProfile.objects.get_or_create(
            user=user, defaults={"google_id": user_data["id"]}
        )
        expires = timezone.now() + timedelta(seconds=36000)
        access_token = AccessToken.objects.create(
            user=user,
            scope='read write',
            expires=expires,
            token=generate_token(),
            application=get_object_or_404(Application, name="hotel")
        )

        # Create the auth token for the frontend to use.
        token, _ = Token.objects.get_or_create(user=user)
        # print(access_token.token)
        # Here we assume that once we are logged in we should send
        # a token to the frontend that a framework like React or Angular
        # can use to authenticate further requests.
        # return JsonResponse({"token": token.key})
        # Chuyển hướng về frontend với token trong query parameters
        redirect_url = f"{frontend_url}/?token={access_token.token}"
        return redirect(redirect_url)


class GoogleOAuth2LoginView(APIView):
    def get(self, request):
        redirect_uri = request.build_absolute_uri(reverse("google_login_callback"))
        return redirect(google_setup(redirect_uri))

