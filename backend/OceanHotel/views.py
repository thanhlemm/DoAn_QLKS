from django.core.mail import send_mail
from django.db.models import Q
from requests import Response
from rest_framework import viewsets, generics, status
from rest_framework.generics import get_object_or_404
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Branch, RoomType, Room, Booking, Coupon, Feedback, Notification, Invoice
from .serializers import (BranchSerializer, RoomTypeSerializer, RoomSerializer, RoomAvailabilitySerializer,
                          BookingSerializer, CouponSerializer, FeedbackSerializer, NotificationSerializer,
                          InvoiceSerializer, InvoiceCreateSerializer, BookingCreateSerializer)
from userauths.serializers import UserSerializer
from rest_framework.response import Response
from django.conf import settings
from userauths.models import User
from rest_framework import status as drf_status


class BranchViewSet(viewsets.ViewSet, generics.CreateAPIView,
                    generics.RetrieveAPIView,
                    generics.ListAPIView):
    queryset = Branch.objects.filter(status="Live")
    serializer_class = BranchSerializer

    def get_queryset(self):
        return Branch.objects.filter(status="Live")

    # def get_object(self):
    #     name = self.kwargs.get('name')
    #     return get_object_or_404(self.queryset, name=name)

    @action(detail=True, methods=['get'], url_path='roomtypes')
    def room_types(self, request, pk=None):
        branch = get_object_or_404(Branch, pk=pk)
        room_types = RoomType.objects.filter(branch=branch)
        serializer = RoomTypeSerializer(room_types, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='receptionists')
    def receptionists(self, request, pk=None):
        branch = get_object_or_404(Branch, pk=pk)
        receptionists = User.objects.filter(branch=branch,
                                            role__name='Lễ tân')  # Assuming role name is 'Receptionist'
        print(f"Number of receptionists found: {receptionists.count()}")
        if not receptionists.exists():
            return Response({"error": "No receptionists found for this branch."}, status=404)

        serializer = UserSerializer(receptionists, many=True)  # Assuming you have a serializer for User
        return Response(serializer.data)


class RoomTypeViewSet(viewsets.ViewSet, generics.CreateAPIView,
                      generics.RetrieveAPIView,
                      generics.ListAPIView):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer

    def get_queryset(self):
        return RoomType.objects.filter(active=True)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Đảm bảo trường is_active được thiết lập là True khi tạo mới
        data['active'] = True

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            # Log or print the error message for debugging
            print("Error during partial update:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        # Update the instance with the validated data
        serializer.save()

    @action(detail=True, methods=['patch'], url_path='delete-roomtypes')
    def delete_roomtypes(self, request, pk=None):
        room_type = self.get_object()
        room_type.active = False
        room_type.save()
        return Response({'success': True, 'message': 'Room type has been deactivated.'}, status=status.HTTP_200_OK)


class RoomViewSet(viewsets.ViewSet, generics.CreateAPIView,
                  generics.RetrieveAPIView,
                  generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_queryset(self):
        return Room.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Đảm bảo trường is_active được thiết lập là True khi tạo mới
        data['active'] = True

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            print("Error during partial update:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['patch'], url_path='delete-room')
    def delete_roomtypes(self, request, pk=None):
        room = self.get_object()
        room.active = False
        room.save()
        return Response({'success': True, 'message': 'Room has been deactivated.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='check-availability')
    def check_availability(self, request):
        serializer = RoomAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            branch_id = serializer.validated_data['branch_id']
            room_type_id = serializer.validated_data['room_type_id']
            checkin = serializer.validated_data['checkin']
            checkout = serializer.validated_data['checkout']

            # Lọc các phòng có sẵn và không bị trùng lặp
            available_rooms = Room.objects.filter(
                branch_id=branch_id,
                room_type_id=room_type_id,
                is_available=True,
            ).exclude(
                # Q(booking__check_in_date__lt=checkout,
                #   booking__check_out_date__lte=checkout) |  # Phòng đã được đặt và kết thúc trước khi hoặc đúng thời gian bạn check-out.
                # Q(booking__check_in_date__gte=checkin,
                #   booking__check_out_date__gt=checkin) |  # Phòng đã được đặt bắt đầu sau thời gian bạn check-in hoặc kéo dài qua thời gian bạn check-in.
                # Q(booking__check_in_date__lte=checkin, booking__check_out_date__gte=checkout)
                # # Phòng đã được đặt bao phủ toàn bộ khoảng thời gian bạn yêu cầu.
                Q(booking__check_in_date__lt=checkout, booking__check_out_date__gt=checkin) &
                Q(booking__is_active=True)
            ).distinct()

            # Serialize danh sách các phòng có sẵn
            room_serializer = RoomSerializer(available_rooms, many=True)

            return Response({
                "available_rooms": room_serializer.data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingViewSet(viewsets.ViewSet, generics.CreateAPIView,
                     generics.RetrieveAPIView,
                     generics.ListAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.all()

    @action(detail=False, methods=['post'])
    def book(self, request):
        data = request.data.copy()

        # Lấy danh sách room_id từ dữ liệu yêu cầu
        room_ids = data.get('room')

        if not room_ids:
            return Response({"error": "Room IDs not provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra xem room_ids có phải là danh sách không
        if not isinstance(room_ids, list):
            return Response({"error": "Room IDs must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy các phòng dựa trên danh sách room_ids
        rooms = Room.objects.filter(id__in=room_ids)
        if rooms.count() != len(room_ids):
            return Response({"error": "One or more rooms not found."}, status=status.HTTP_404_NOT_FOUND)

        coupon_code = data.get('code')  # Lấy coupon code từ request
        print(coupon_code)
        if coupon_code:
            try:
                # Lấy mã coupon từ database
                coupon = Coupon.objects.get(code=coupon_code)

                # Kiểm tra tính hợp lệ của mã coupon
                now = timezone.now()
                if not (coupon.valid_from <= now <= coupon.valid_to and coupon.redemptions < coupon.max_redemptions):
                    return Response({"error": "Invalid or expired coupon code."}, status=status.HTTP_400_BAD_REQUEST)

                # Nếu hợp lệ, thêm mã giảm giá vào quá trình booking
                data['code'] = coupon_code

            except Coupon.DoesNotExist:
                return Response({"error": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)

        # Thêm danh sách các phòng vào dữ liệu yêu cầu
        data['room'] = room_ids
        data['is_active'] = True

        # Tạo serializer với dữ liệu yêu cầu
        serializer = BookingCreateSerializer(data=data)
        if serializer.is_valid():
            booking = serializer.save()
            booking.room.set(rooms)  # Gán các phòng vào booking

            rooms.update(is_available=False)

            if coupon_code:
                coupon.redemptions += 1
                coupon.save()
            # Gửi email xác nhận
            # send_confirmation_email(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def bookings_by_userid(self, request):
        user_id = request.query_params.get('user_id')

        if not user_id:
            return Response({'detail': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bookings = Booking.objects.filter(user_id=user_id)
            serializer = BookingSerializer(bookings, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({'detail': 'Bookings not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='confirmation')
    def booking_by_confirmationCode(self, request):
        confirmation_code = request.query_params.get('confirmationCode')
        if not confirmation_code:
            return Response({'error': 'confirmationCode is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(confirmationCode=confirmation_code)
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='cancel-booking')
    def cancel_booking(self, request, pk=None):
        # Tìm booking dựa trên pk
        booking = self.get_object()

        if not booking.is_active:
            return Response({'success': False, 'message': 'Booking đã bị hủy trước đó!'},
                            status=status.HTTP_400_BAD_REQUEST)

        booking.is_active = False
        booking.save()

        if booking.room.exists():  # Kiểm tra nếu booking có phòng liên quan
            for r in booking.room.all():
                r.is_available = True
                r.save()

        # Lấy mã coupon từ request nếu có
        coupon_code = request.data.get('code', None)

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)

                # Giảm số lần sử dụng (redemptions) khi huỷ booking
                if coupon.redemptions > 0:
                    coupon.redemptions -= 1
                    coupon.save()

            except Coupon.DoesNotExist:
                return Response({'success': False, 'message': 'Coupon không tồn tại!'},
                                status=status.HTTP_404_NOT_FOUND)

        return Response({'success': True, 'message': 'Booking đã được hủy thành công!'})

    @action(detail=True, methods=['post'], url_path='check-in')
    def check_in_booking(self, request, pk=None):
        booking = self.get_object()
        if not booking.is_active:
            return Response({'success': False, 'message': 'Booking đã bị hủy và không thể check-in.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if booking.checked_in:
            return Response({'success': False, 'message': 'Booking đã được check-in trước đó.'},
                            status=status.HTTP_400_BAD_REQUEST)

        booking.checked_in = True
        booking.save()

        return Response({'success': True, 'message': 'Booking đã được check-in thành công.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='check-out')
    def check_out_booking(self, request, pk=None):
        booking = self.get_object()
        if not booking.is_active:
            return Response({'success': False, 'message': 'Booking đã bị hủy và không thể check-out.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if not booking.checked_in:
            return Response({'success': False, 'message': 'Booking chưa được check-in và không thể check-out.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if booking.checked_out:
            return Response({'success': False, 'message': 'Booking đã được check-out trước đó.'},
                            status=status.HTTP_400_BAD_REQUEST)

        booking.checked_out = True
        booking.save()

        for r in booking.room.all():  # Iterate through the related rooms
            r.is_available = True
            r.save()

        return Response({'success': True, 'message': 'Booking đã được check-out thành công.'},
                        status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='change-status')
    def change_status(self, request, pk=None):
        try:
            booking = Booking.objects.get(id=pk)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=drf_status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('payment_status')

        # valid_statuses = [status[0] for status in Booking.PAYMENT_STATUS]  # Lấy danh sách các giá trị hợp lệ
        # if new_status not in valid_statuses:
        #     return Response({"error": "Invalid status"}, status=drf_status.HTTP_400_BAD_REQUEST)

        booking.payment_status = new_status
        booking.save()
        if hasattr(booking, 'invoice'):
            invoice = booking.invoice
            invoice.status = new_status
            invoice.save()

        return Response({"message": "Booking payment status updated successfully", "status": new_status},
                        status=drf_status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='checked-out-unpaid')
    def get_checked_out_unpaid_bookings(self, request):
        checked_out_bookings = Booking.objects.filter(checked_out=True, is_active=True, payment_status='unpaid')
        serializer = BookingSerializer(checked_out_bookings, many=True)
        return Response(serializer.data, status=drf_status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='checked-out')
    def get_checked_out_bookings(self, request):
        branch_id = request.query_params.get('branch')

        if branch_id:
            checked_out_bookings = Booking.objects.filter(checked_out=False, is_active=True, branch_id=branch_id)
        else:
            checked_out_bookings = Booking.objects.filter(checked_out=False, is_active=True)

        serializer = BookingSerializer(checked_out_bookings, many=True)
        return Response(serializer.data, status=drf_status.HTTP_200_OK)


class SendEmailViewSet(viewsets.ViewSet):
    def create(self, request):
        subject = request.data.get('subject')
        message = request.data.get('message')
        recipient_list = [request.data.get('recipient')]
        sender = 'tan036075@gmail.com'

        if not subject or not message or not recipient_list:
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            send_mail(subject, message, sender, recipient_list)
            return Response({'success': True})
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from django.utils import timezone


class CouponViewSet(viewsets.ViewSet, generics.CreateAPIView,
                    generics.RetrieveAPIView,
                    generics.ListAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_queryset(self):
        return Coupon.objects.filter(active=True)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            # Log or print the error message for debugging
            print("Error during partial update:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='get-coupon')
    def get_coupon(self, request):
        code = request.data.get('code')
        try:
            coupon = Coupon.objects.get(code=code)
            now = timezone.now()
            if coupon.valid_from <= now <= coupon.valid_to and coupon.redemptions < coupon.max_redemptions:
                return Response({
                    'discount': coupon.discount,
                    'type': coupon.type  # Assuming type is a field in your Coupon model
                })
            else:
                return Response({
                    'discount': 0,
                    'type': 'none'  # Specify a default type when the coupon is invalid
                })
        except Coupon.DoesNotExist:
            return Response({
                'discount': 0,
                'type': 'none'  # Specify a default type when the coupon does not exist
            })

    @action(detail=True, methods=['patch'], url_path='delete-coupon')
    def delete_coupon(self, request, pk=None):
        coupon = self.get_object()
        coupon.active = False
        coupon.save()
        return Response({'success': True, 'message': 'Coupon has been deactivated.'}, status=status.HTTP_200_OK)

    # Action để phát hành coupon cho tất cả người dùng
    @action(detail=False, methods=['post'], url_path='issue_coupon')
    def issue_coupon(self, request):
        try:
            # Lấy dữ liệu coupon từ request
            coupon_id = request.data.get('coupon_id')
            if not coupon_id:
                return Response({"error": "Coupon ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            coupon = Coupon.objects.get(id=coupon_id)

            # Lấy tất cả người dùng và phát hành coupon
            users = User.objects.filter(role=2)

            for user in users:
                # Tạo một bản sao của coupon cho từng người dùng
                # new_coupon = Coupon.objects.create(
                #     code=coupon.code,
                #     user=user,
                #     # các trường khác cần thiết, nếu có
                # )

                # Tạo thông báo cho từng người dùng về coupon được cung cấp
                Notification.objects.create(
                    user=user,
                    type="Coupon Issued",
                    booking=None,  # Không liên quan đến booking
                    seen=False,
                    content=f"Congratulations {user.username}! You've received a coupon. Your coupon code is: {coupon.code}",
                )

            return Response({"message": "Coupon issued to all users successfully."}, status=status.HTTP_200_OK)

        except Coupon.DoesNotExist:
            return Response({"error": "Coupon not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FeedbackViewSet(viewsets.ViewSet, generics.CreateAPIView,
                      generics.RetrieveAPIView,
                      generics.ListAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def list(self, request):
        # Lấy feedback của người dùng hiện tại
        user = request.user
        feedbacks = Feedback.objects.filter(user=user)
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):
        # Tạo feedback mới
        data = request.data
        data['user'] = request.user.id  # Gắn user hiện tại vào request data
        serializer = FeedbackSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def get_by_branch(self, request):
        branch_id = request.query_params.get('branch_id')
        if branch_id:
            feedbacks = Feedback.objects.filter(branch_id=branch_id).order_by('-feedback_date')
            serializer = FeedbackSerializer(feedbacks, many=True)
            return Response(serializer.data)
        return Response({"error": "Branch ID is required."}, status=400)


class NotificationViewSet(viewsets.ViewSet, generics.CreateAPIView,
                          generics.RetrieveAPIView,
                          generics.ListAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    @action(detail=False, methods=['get'])
    def user_notifications(self, request):
        if request.user.is_authenticated:
            notifications = Notification.objects.filter(user=request.user)
            serializer = self.get_serializer(notifications, many=True)
            return Response(serializer.data)
        else:
            return Response({'detail': 'Authentication credentials were not provided.'},
                            status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        try:
            notification = self.get_object()
            if notification.user != request.user:
                return Response({'detail': 'You do not have permission to modify this notification.'},
                                status=status.HTTP_403_FORBIDDEN)
            notification.seen = True
            notification.save()
            serializer = self.get_serializer(notification)
            return Response(serializer.data)
        except Notification.DoesNotExist:
            return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


class InvoiceViewSet(viewsets.ViewSet,
                     generics.RetrieveAPIView,
                     generics.ListAPIView):
    queryset = Invoice.objects.all().order_by('-transaction_date')
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role.name == 'Lễ tân':
            return queryset
        return queryset.filter(user=user)

    @action(detail=False, methods=['post'])
    def create_invoice(self, request):
        """
        Tạo một hóa đơn mới dựa trên dữ liệu được gửi.
        """
        serializer = InvoiceCreateSerializer(data=request.data)
        if serializer.is_valid():
            invoice = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'])
    def update_vnp_response_code_by_booking(self, request):
        """
        Cập nhật vnp_response_code cho hóa đơn dựa trên booking_id.
        """
        booking_id = request.data.get('booking_id')
        vnp_response_code = request.data.get('vnp_response_code')
        new_status = request.data.get('status', 'paid')

        if not booking_id:
            return Response({'error': 'Missing booking_id or vnp_response_code'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invoice = Invoice.objects.get(booking_id=booking_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

        invoice.vnp_response_code = vnp_response_code
        invoice.status = new_status
        invoice.save()

        serializer = self.get_serializer(invoice)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='confirm-payment')
    def confirm_payment(self, request, pk=None):
        """
        Confirm the payment for a specific invoice.
        """
        # Fetch the invoice using the pk (invoice_id)
        invoice = get_object_or_404(Invoice, pk=pk)

        # Check if the invoice is already paid
        if invoice.status == 'paid':
            return Response({"detail": "Invoice already paid."}, status=status.HTTP_400_BAD_REQUEST)

        # Update the invoice status to 'paid'
        invoice.status = 'paid'
        invoice.save()

        if invoice.booking:  # Ensure the invoice has an associated booking
            invoice.booking.update_status_to_paid()

        # Serialize and return the updated invoice
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data, status=status.HTTP_200_OK)
