from django.contrib.auth.models import AnonymousUser
from rest_framework import status, viewsets, generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer, UserSerializer, RoleSerializer, EmployeeSerializer, CustomerSerializer
from .models import User, UserProfile, Role
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import redirect
from django.urls import reverse
from userauths.utils import upload_image_from_url, facebook_callback

from userauths.utils import google_callback
from django.http import JsonResponse
from rest_framework.authtoken.models import Token
from oauth2_provider.models import AccessToken, Application
from oauthlib.common import generate_token
import requests


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

    @action(detail=False, methods=['post'], url_path='add-employee')
    def add_employee(self, request):
        # Sử dụng serializer để kiểm tra và validate dữ liệu đầu vào
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            # Lưu nhân viên vào database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # Trả về lỗi nếu dữ liệu không hợp lệ
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

    @action(detail=True, methods=['patch'], url_path='update-employee')
    def update_employee(self, request, pk=None):
        try:
            user = self.get_object()  # Lấy đối tượng user cần cập nhật dựa vào pk
            serializer = self.get_serializer(user, data=request.data,
                                             partial=True)  # partial=True cho phép cập nhật từng phần

            if serializer.is_valid():
                serializer.save()  # Lưu lại các thay đổi sau khi cập nhật
                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # API xóa tài khoản
    # /users/<user_id>/delete-account/
    @action(detail=True, methods=['delete'], url_path='delete-account')
    def delete_account(self, request, pk=None):
        try:
            # Lấy user từ pk hoặc raise 404 nếu không tìm thấy
            user = get_object_or_404(User, pk=pk)

            # Kiểm tra quyền hạn: Chỉ người tạo mới có quyền xóa hoặc admin
            if request.user.is_authenticated and (request.user.role.name == "Admin" or request.user == user):
                user.delete()
                return Response({"message": "User account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "You do not have permission to delete this user account."},
                                status=status.HTTP_403_FORBIDDEN)

        except Exception as e:
            # Log the exception for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to delete user account: {e}", exc_info=True)
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Check tài khoản có mật khẩu chưa
    @action(detail=False, methods=['get'])
    def password_status(self, request):
        user = request.user

        if user.is_authenticated:
            # Kiểm tra xem người dùng có mật khẩu không
            has_password = user.password and user.password.startswith('pbkdf2_sha256$')
            message = 'Password exists' if has_password else 'Password not set'
            return Response({'message': message}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'])
    def set_password(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        new_password = request.data.get('newPassword')
        if not new_password:
            return Response({'detail': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'detail': 'Password set successfully'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        old_password = request.data.get('oldPassword')
        new_password = request.data.get('newPassword')

        if not user.check_password(old_password):
            return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        if not new_password:
            return Response({'detail': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'detail': 'Password changed successfully'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='search-customer-phone')
    def search_customer(self, request):
        phone_number = request.query_params.get('phone', None)

        if phone_number is None:
            return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = User.objects.get(phone=phone_number)
        except User.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CustomerSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GoogleOAuth2LoginCallbackView(APIView):
    def get(self, request):
        redirect_uri = request.build_absolute_uri(reverse("google_login_callback"))
        auth_uri = request.build_absolute_uri()

        user_data = google_callback(redirect_uri, auth_uri)

        # Lấy URL frontend từ OAuth state
        frontend_url = request.GET.get('state')

        if frontend_url is None:
            return JsonResponse({"error": "State (frontend URL) is missing."}, status=400)

        user_picture = user_data.get('picture')

        user, _ = User.objects.get_or_create(
            username=user_data["email"],
            defaults={"first_name": user_data["given_name"],
                      "last_name": user_data.get("family_name", ""),
                      'email': user_data["email"],
                      "role": Role.objects.get(name="Khách hàng"),  # Thiết lập role mặc định là khách hàng
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


class RoleViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer


class FacebookLoginCallbackView(APIView):
    def post(self, request):
        access_token = request.data.get('accessToken')
        print(access_token)
        if not access_token:
            return Response({'error': 'Access token not provided'}, status=status.HTTP_400_BAD_REQUEST)

        facebook_url = f'https://graph.facebook.com/me?access_token={access_token}&fields=id,name,email,picture'

        response = requests.get(facebook_url)
        if response.status_code != 200:
            return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = response.json()
        user_email = user_data.get('email')
        user_name = user_data.get('name')
        user_picture = user_data.get('picture', {}).get('data', {}).get('url')

        if not user_email:
            return Response({'error': 'Email not found in access token'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            username=user_name,
            defaults={'first_name': user_name, 'email': user_email, "role": Role.objects.get(id=3),
                      'avatar': upload_image_from_url(user_picture)})

        # Cập nhật thông tin mở rộng trong UserProfile
        UserProfile.objects.get_or_create(
            user=user, defaults={"facebook_id": user_data["id"]}
        )

        # access_token, refresh_token = utils.create_user_token(user=user)
        # Tạo Access Token
        expires = timezone.now() + timedelta(seconds=36000)
        access_token = AccessToken.objects.create(
            user=user,
            scope='read write',
            expires=expires,
            token=generate_token(),
            application=get_object_or_404(Application, name="hotel")
        )

        return Response({
            'access_token': access_token.token,
        })
