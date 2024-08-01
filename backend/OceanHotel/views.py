# from django.contrib.auth.models import AnonymousUser
# from django.shortcuts import render
# from rest_framework import generics, status, viewsets, parsers, permissions, exceptions
# from rest_framework.decorators import action
# from rest_framework.exceptions import PermissionDenied
# from rest_framework.generics import get_object_or_404
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.views import APIView
# from . import serializers
# from .models import Account, RoomType, Room, Reservation, Service, Refund, Bill, ReservationService
# from .serializers.Account import AccountSerializer
# from .serializers.Admin import RoomTypeSerializer, RoomSerializer, ServiceSerializer
# from .serializers.Billing import BillSerializer
# from .serializers.Booking import ReservationSerializer, RefundSerializer
#
#
# class AccountViewSet(viewsets.ViewSet, generics.CreateAPIView,
#                      generics.RetrieveAPIView,
#                      generics.ListAPIView):
#     queryset = Account.objects.filter(is_active=True).all()
#     serializer_class = AccountSerializer
#     parser_classes = [parsers.MultiPartParser, parsers.JSONParser]  # upload được hình ảnh và làm việc với json
#     permission_classes = [permissions.AllowAny()]  # role nào vô cùng đc
#
#     def get_permissions(self):
#         if self.action in ['list', 'get_current_user', 'partial_update', 'account_is_valid', 'delete_staff', 'retrieve']:
#             # permission_classes = [IsAuthenticated]
#             return [permissions.AllowAny()]
#         elif self.action in 'create':
#             if isinstance(self.request.user, AnonymousUser):
#                 if self.request.data and (self.request.data.get('role') == str(Account.Roles.KhachHang)):
#                     return [permissions.AllowAny()]
#                 else:
#                     return [permissions.IsAuthenticated()]
#             elif self.request.data and self.request.data.get('role') == str(Account.Roles.LeTan):
#                 if self.request.user.role in [Account.Roles.ADMIN.value]:
#                     return [permissions.IsAuthenticated()]
#                 else:
#                     raise exceptions.PermissionDenied()
#             elif self.request.data and self.request.data.get('role') in [str(Account.Roles.ADMIN)]:
#                 if self.request.user.role == Account.Roles.ADMIN.value:
#                     return [permissions.IsAuthenticated()]
#                 else:
#                     raise exceptions.PermissionDenied()
#         # elif self.action in ['delete_staff']:
#         #     permission_classes = [perm.IsAdmin()]
#
#     # API xem chi tiết tài khoản hiện (chỉ xem được của mình) + cập nhật tài khoản (của mình)
#     # /users/current-user/
#     @action(methods=['get', 'patch'], url_path='current-user', detail=False)
#     def get_current_user(self, request):
#         # Đã được chứng thực rồi thì không cần truy vấn nữa => Xác định đây là người dùng luôn
#         # user = user hiện đang đăng nhập
#         user = request.user
#         if request.method.__eq__('PATCH'):
#
#             for k, v in request.data.items():
#                 # Thay vì viết user.first_name = v
#                 setattr(user, k, v)
#             user.save()
#
#         return Response(serializers.AccountSerializer(user).data)
#
#     # API cập nhật một phần cho User
#     # API vô hiệu hoá tài khoản nhân viên
#     # /users/<user_id>/delete-account/
#     @action(detail=True, methods=['patch'], url_path='delete-staff')
#     def delete_staff(self, request, pk=None):
#         user = Account.objects.get(pk=pk)
#         user.is_active = False
#         user.save()
#         return Response({"Thông báo": "Vô hiệu hoá tài khoản thành công."}, status=status.HTTP_204_NO_CONTENT)
#
#     @action(methods=['get'], url_path='account-is-valid', detail=False)
#     def account_is_valid(self, request):
#         email = self.request.query_params.get('email')
#         username = self.request.query_params.get('username')
#
#         if email:
#             tk = Account.objects.filter(email=email)
#             if tk.exists():
#                 return Response(data={'is_valid': "True", 'message': 'Email đã tồn tại'}, status=status.HTTP_200_OK)
#
#         if username:
#             tk = Account.objects.filter(username=username)
#             if tk.exists():
#                 return Response(data={'is_valid': "True", 'message': 'Username đã tồn tại'},
#                                 status=status.HTTP_200_OK)
#
#         return Response(data={'is_valid': "False"}, status=status.HTTP_200_OK)
#
#
# class RoomTypeViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
#     queryset = RoomType.objects.filter(active=True)
#     serializer_class = RoomTypeSerializer
#
#     # pagination_class = RoomTypePaginator
#
#     def list(self, request, *args, **kwargs):
#         response = super().list(request, *args, **kwargs)
#         # Log kiểu dữ liệu
#         print(f"Type of response.data: {type(response.data)}")
#         print(f"Response data: {response.data}")
#
#         if isinstance(response.data, dict) and 'results' in response.data:
#             for item in response.data['results']:
#                 if 'image' in item and 'image/upload/' in item['image']:
#                     item['image'] = item['image'].split('image/upload/', 1)[-1]
#         elif isinstance(response.data, list):
#             for item in response.data:
#                 if 'image' in item and 'image/upload/' in item['image']:
#
#                     item['image'] = item['image'].split('image/upload/', 1)[-1]
#
#         return Response(response.data)
#     #
#     # def retrieve(self, request, *args, **kwargs):
#     #     response = super().retrieve(request, *args, **kwargs)
#     #     if 'image' in response.data and 'image/upload/' in response.data['image']:
#     #         response.data['image'] = response.data['image'].split('image/upload/', 1)[-1]
#     #     return Response(response.data)
#     def create(self, request):
#         # Thêm trường 'active' với giá trị mặc định là True
#         data = request.data.copy()  # Sao chép dữ liệu từ request
#         data['active'] = True  # Đặt giá trị mặc định cho trường 'active'
#
#         # image_url = data.get('image', '')
#         # # Remove "image/upload/" part
#         # cleaned_image_url = image_url.replace("image/upload/", "")
#         # # Optionally, prepend the base URL if needed
#         # base_url = "https://res.cloudinary.com/thanhlem/image/upload/"
#         # data['image'] = cleaned_image_url
#
#         serializer = RoomTypeSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#     def get_permissions(self):
#         if self.action in ['list', 'create', 'update', 'partial_update', 'destroy', 'retrieve', 'delete_roomType']:
#             # if not (self.request.user.is_authenticated and
#             #         self.request.user.role in Account.Roles.ADMIN.value):  # Chỉ admin mới có quyền
#             #     raise PermissionDenied("Only admin can perform this action.")
#             # return [permissions.IsAuthenticated()]
#             return [permissions.AllowAny()]
#
#     def get_queryset(self):
#         queryset = self.queryset.filter(active=True)
#         q = self.request.query_params.get('nameRoomType')
#         if q:
#             queryset = queryset.filter(nameRoomType__icontains=q)
#
#         return queryset
#
#     # @action(methods=['get'], url_path='rooms', detail=True)
#     # def get_rooms(self, request, pk):
#     #     rooms = self.get_object().room_set.filter(active=True)
#     #     q = request.query_params.get('nameRoom')
#     #     if q:
#     #         rooms = rooms.filter(nameRoom__icontains=q)
#     #
#     #     return Response(serializers.RoomSerializer(rooms, many=True).data,
#     #                     status=status.HTTP_200_OK)
#
#     def partial_update(self, request, pk=None):
#         try:
#             # roomType = RoomType.objects.get(pk=pk)
#             roomType = self.get_object()
#         except RoomType.DoesNotExist:
#             return Response({"detail": "RoomType not found."}, status=status.HTTP_404_NOT_FOUND)
#
#         serializer = self.serializer_class(roomType, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#
#     @action(detail=True, methods=['patch'], url_path='delete-roomTypes')
#     def delete_roomType(self, request, pk=None):
#         try:
#             roomType = self.get_object()
#             # Debugging: Kiểm tra giá trị của `room`
#             print(f"Room: {roomType}")
#             if roomType is None:
#                 return Response({"detail": "roomType not found."}, status=status.HTTP_404_NOT_FOUND)
#
#             # Thực hiện vô hiệu hóa (disable) room
#             roomType.active = False
#             roomType.save()
#
#             return Response({"detail": "roomType has been deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
#         except Exception as e:
#             return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#
# class RoomViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
#     queryset = Room.objects.filter(active=True)
#     serializer_class = RoomSerializer
#
#     # pagination_class = RoomPaginator
#
#     def get_permissions(self):
#         if self.action in ['list', 'create', 'update', 'partial_update', 'destroy', 'delete_room', 'retrieve']:
#             # if not (self.request.user.is_authenticated and
#             #         self.request.user.role in Account.Roles.ADMIN.value):  # Chỉ admin mới có quyền
#             #     raise PermissionDenied("Only admin can perform this action.")
#             # return [permissions.IsAuthenticated()]
#             return [permissions.AllowAny()]
#
#
#     def create(self, request, *args, **kwargs):
#         try:
#             # Lấy dữ liệu từ request
#             room_type_id = request.data.get("roomType")
#             name_room = request.data.get("nameRoom")
#
#             # Kiểm tra dữ liệu đầu vào
#             if not room_type_id or not name_room:
#                 return Response(
#                     {"detail": "RoomType and nameRoom are required."},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#
#             # Lấy RoomType từ cơ sở dữ liệu
#             room_type = RoomType.objects.get(id=room_type_id)
#
#             # Tạo phòng mới
#             new_room = Room.objects.create(nameRoom=name_room, roomType=room_type)
#
#             # Serialize dữ liệu của phòng mới
#             # serializer = self.get_serializer(new_room)
#
#             # Trả về phản hồi thành công
#             return Response(
#                 serializers.RoomSerializer(new_room).data,
#                 status=status.HTTP_201_CREATED
#             )
#         except RoomType.DoesNotExist:
#             return Response(
#                 {"detail": "RoomType not found."},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except Exception as e:
#             return Response(
#                 {"detail": str(e)},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#
#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset().filter(active=True)
#         serializer = RoomSerializer(queryset, many=True)
#         return Response(serializer.data)
#
#     def get_queryset(self):
#         return self.queryset
#
#     def partial_update(self, request, pk=None):
#         try:
#             room = self.get_object()
#         except Room.DoesNotExist:
#             return Response({"detail": "Room not found."}, status=status.HTTP_404_NOT_FOUND)
#
#         serializer = self.get_serializer(room, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#     @action(detail=True, methods=['patch'], url_path='delete-room')
#     def delete_room(self, request, pk=None):
#         try:
#             room = self.get_object()
#             # Debugging: Kiểm tra giá trị của `room`
#             print(f"Room: {room}")
#             if room is None:
#                 return Response({"detail": "Room not found."}, status=status.HTTP_404_NOT_FOUND)
#
#             # Thực hiện vô hiệu hóa (disable) room
#             room.active = False
#             room.save()
#
#             return Response({"detail": "Room has been deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
#         except Exception as e:
#             return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
#
#
# class ReservationViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
#     queryset = Reservation.objects.filter(active=True)
#     serializer_class = ReservationSerializer
#
#     def get_permissions(self):
#         if self.action in ['patch_current_reservation', 'partial_update', 'list', 'create', 'get_rooms', 'add_service']:
#             # if (self.request.user.is_authenticated and
#             #         self.request.user.role in Account.Roles.LeTan.value):
#             #     return [permissions.IsAuthenticated()]
#             # else:
#             #     raise PermissionDenied("Only the customer or receptionists can partially update this reservation.")
#             return [permissions.AllowAny()]
#         elif self.action == ['get_reservation_guest', 'get_rooms', 'add_service']:
#             return [permissions.IsAuthenticated()] #, perm.IsKhachHang()
#         elif self.action == ['cancel_reservation', 'check_in']:
#             return [permissions.IsAuthenticated(), self.request.user.role in [Account.Roles.LeTan.value]]
#         return [permissions.AllowAny()]
#
#     def get_queryset(self):
#         return self.queryset
#
#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset().filter(active=True)
#         serializer = ReservationSerializer(queryset, many=True)
#         return Response(serializer.data)
#
#     # chat
#     def partial_update(self, request, *args, **kwargs):
#         pk = kwargs.get('pk')
#         try:
#             reservation = self.queryset.get(pk=pk)
#         except Reservation.DoesNotExist:
#             return Response({'detail': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)
#
#         if request.user.role not in [Account.Roles.KhachHang, Account.Roles.LeTan]:
#             return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
#
#         serializer = self.get_serializer(reservation, data=request.data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)
#
#         headers = self.get_success_headers(serializer.data)
#         return Response(serializer.data, status=status.HTTP_200_OK, headers=headers)
#
#     def perform_update(self, serializer):
#         serializer.save()
#
#
#     def create(self, request, *args, **kwargs):
#         guest_name = request.data.get('guest')
#         guest = Account.objects.get(username=guest_name)
#         room_type_name = request.data.get('room')
#         room_data = room_type_name[0]
#         roomType = RoomType.objects.get(nameRoomType=room_data.get('roomType'))
#
#         if not guest_name or not room_type_name:
#             return Response({'detail': 'Customer ID and Room Type ID are required.'},
#                             status=status.HTTP_400_BAD_REQUEST)
#
#         rooms = Room.objects.filter(roomType=roomType, status=0)
#
#         if not rooms.exists():
#             return Response({'detail': 'No available rooms for the selected room type.'},
#                             status=status.HTTP_400_BAD_REQUEST)
#
#         room = rooms.first()  # Chọn phòng đầu tiên có sẵn
#
#         reservation = Reservation.objects.create(
#             guest=guest,
#             bookDate=request.data.get('bookDate'),  # Cung cấp giá trị cho bookDate
#             checkin=request.data.get('checkin'),
#             checkout=request.data.get('checkout'),
#             active=True  # hoặc các giá trị khác từ request.data
#         )
#         reservation.room.add(room)
#         reservation.save()
#
#         room.status = 1  # Cập nhật trạng thái phòng không còn sẵn sàng
#         room.save()
#
#         return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)
#
#     def retrieve(self, request, *args, **kwargs):
#         return Response(ReservationDetailSerializer(self.get_object()).data, status=status.HTTP_200_OK)
#
#     @action(detail=True, methods=['patch'], url_path='deactivate')
#     def deactivate_reservation(self, request, pk=None):
#         try:
#             reservation = self.get_object()
#             if request.user.is_authenticated and request.user.role in [Account.Roles.LeTan]:
#                 reservation.active = False
#                 reservation.save()
#                 return Response({'status': 'reservation deactivated'}, status=status.HTTP_200_OK)
#             else:
#                 raise PermissionDenied("Only receptionists can deactivate reservations.")
#         except Reservation.DoesNotExist:
#             return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)
#
#
#     # Cập nhật phiếu đặt phòng
#     @action(detail=True, methods=['patch'], url_path='current-reservation')
#     def patch_current_reservation(self, request, pk=None):
#         # Lấy đối tượng Reservation dựa trên pk
#         reservation = self.get_object()
#
#         # Lấy username của guest từ dữ liệu yêu cầu
#         guest_username = self.request.data.get('guest')
#
#         try:
#             # Tìm kiếm đối tượng Account (guest) với username tương ứng
#             guest = Account.objects.get(username=guest_username)
#         except Account.DoesNotExist:
#             return Response({"detail": "Guest not found."}, status=status.HTTP_404_NOT_FOUND)
#         except Account.MultipleObjectsReturned:
#             return Response({"detail": "Multiple accounts found with this username."},
#                             status=status.HTTP_400_BAD_REQUEST)
#
#         # Cập nhật đối tượng guest cho đặt phòng (Reservation)
#         reservation.guest = guest
#
#         # Xử lý các trường dữ liệu khác từ yêu cầu PATCH
#         for k, v in request.data.items():
#             if k == 'room':
#                 rooms_data = v
#                 rooms = []
#                 for room_data in rooms_data:
#                     # Lấy và loại bỏ roomType từ dữ liệu phòng
#                     room_type_name = room_data.pop('roomType')
#
#                     try:
#                         # Tìm roomType theo tên
#                         room_type = RoomType.objects.get(nameRoomType=room_type_name)
#                         room_data['roomType'] = room_type  # Gán roomType là đối tượng RoomType tìm được
#                     except RoomType.DoesNotExist:
#                         # Trả về lỗi nếu không tìm thấy roomType
#                         return Response({"detail": f"RoomType '{room_type_name}' not found."},
#                                         status=status.HTTP_404_NOT_FOUND)
#
#                     # Tạo hoặc lấy đối tượng phòng (Room) từ dữ liệu
#                     room, created = Room.objects.get_or_create(**room_data)
#                     rooms.append(room)
#
#                 # Cập nhật các phòng cho đặt phòng (Reservation)
#                 reservation.room.set(rooms)
#             elif k != 'guest':
#                 # Cập nhật các trường dữ liệu khác trừ 'guest'
#                 setattr(reservation, k, v)
#
#         # Lưu các thay đổi vào đặt phòng (Reservation)
#         reservation.save()
#
#         # Trả về thông tin đặt phòng đã được cập nhật dưới dạng JSON
#         return Response(ReservationSerializer(reservation).data)
#
#     # Xoá phiếu đặt phòng
#     @action(detail=True, methods=['patch'], url_path='cancel-reservation')
#     def cancel_reservation(self, request, pk=None):
#         reservation = self.get_object()
#
#         # Thực hiện vô hiệu hóa (disable) reservation
#         reservation.active = False
#         reservation.save()
#
#         return Response({"detail": "Reservation has been cancelled successfully."}, status=status.HTTP_204_NO_CONTENT)
#
#     @action(methods=['get'], url_path='rooms', detail=True)
#     def get_rooms(self, request, pk):
#         rooms = self.get_object().room.filter(active=True)
#         q = request.query_params.get('nameRoom')
#         if q:
#             rooms = rooms.filter(nameRoom__icontains=q)
#
#         return Response(serializers.RoomSerializer(rooms, many=True).data,
#                         status=status.HTTP_200_OK)
#
#     @action(methods=['get'], url_path='get-reservation-guest', detail=False)
#     def get_reservation_guest(self, request):
#         reservations = Reservation.objects.filter(guest=request.user).order_by('-created_date')
#         serializer = ReservationSerializer(reservations, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
#
#     # Thêm service vào reservation
#     @action(detail=True, url_path='add-service', methods=['post'])
#     def add_service(self, request, pk=None):
#         reservation = self.get_object()
#         service_name = request.data.get('nameService')
#         quantity = request.data.get('quantity', 1)
#         print(f"Received nameService: {service_name}")
#         # Check if service exists
#         service = get_object_or_404(Service, nameService=service_name)
#
#         # Add or update service in reservation
#         reservation_service, created = ReservationService.objects.get_or_create(
#             reservation=reservation,
#             service=service,
#             defaults={'quantity': quantity}
#         )
#         if not created:
#             reservation_service.quantity += quantity
#             reservation_service.save()
#
#         return Response({'status': 'service added'})
#
#     @action(detail=True, methods=['post'], url_path='check-in-status')
#     def check_in(self, request, pk=None):
#         reservation = self.get_object()
#         reservation.statusCheckin = True
#         reservation.save()
#
#         return Response({"detail": "Check-in completed successfully."}, status=status.HTTP_200_OK)
#
#
# class ServiceViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
#     queryset = Service.objects.filter(active=True)
#     serializer_class = ServiceSerializer
#
#     # permission_classes = [IsAuthenticated]
#
#     def get_permissions(self):
#         if self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
#             if not (Account.role.id == 1):  # Chỉ admin mới có quyền
#                 raise PermissionDenied("Only admin can perform this action.")
#             return [permissions.IsAuthenticated()]
#         return [permissions.AllowAny()]
#
#     def get_queryset(self):
#         return self.queryset
#
#     def partial_update(self, request, pk=None):
#         try:
#             room = Room.objects.get(pk=pk)
#         except Room.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)
#
#         serializer = self.serializer_class(room, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#     @action(detail=True, methods=['post'], url_path='delete-service')
#     def delete_service(self, request, pk=None):
#         service = self.get_object()
#
#         # Thực hiện vô hiệu hóa
#         service.active = False
#         service.save()
#
#         return Response({"detail": "Service has been cancelled successfully."}, status=status.HTTP_204_NO_CONTENT)
#
#
# class RefundView(generics.ListCreateAPIView):
#     queryset = Refund.objects.all()
#     serializer_class = RefundSerializer
#     permission_classes = [IsAuthenticated]
#
#
# class BillView(generics.ListCreateAPIView):
#     queryset = Bill.objects.all()
#     serializer_class = BillSerializer
#     permission_classes = [IsAuthenticated]
#
#
# class BillDetailView(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Bill.objects.all()
#     serializer_class = BillSerializer
#     permission_classes = [IsAuthenticated]
#
# # Create your views here.
