from django.core.mail import send_mail
from django.db.models import Q
from requests import Response
from rest_framework import viewsets, generics, status
from rest_framework.generics import get_object_or_404
from rest_framework.decorators import action
from .models import Branch, RoomType, Room, Booking
from .sendEmail import send_confirmation_email
from .serializers import BranchSerializer, RoomTypeSerializer, RoomSerializer, RoomAvailabilitySerializer, \
    BookingSerializer
from rest_framework.response import Response
from django.conf import settings


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


class RoomTypeViewSet(viewsets.ViewSet, generics.CreateAPIView,
                      generics.RetrieveAPIView,
                      generics.ListAPIView):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer

    def get_queryset(self):
        return RoomType.objects.all()


class RoomViewSet(viewsets.ViewSet, generics.CreateAPIView,
                  generics.RetrieveAPIView,
                  generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def get_queryset(self):
        return Room.objects.all()

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

        # Thêm danh sách các phòng vào dữ liệu yêu cầu
        data['room'] = room_ids
        data['is_active'] = True

        # Tạo serializer với dữ liệu yêu cầu
        serializer = BookingSerializer(data=data)
        if serializer.is_valid():
            booking = serializer.save()
            booking.room.set(rooms)  # Gán các phòng vào booking

            rooms.update(is_available=False)
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
        return Response({'success': True, 'message': 'Booking đã được check-out thành công.'},
                        status=status.HTTP_200_OK)


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
