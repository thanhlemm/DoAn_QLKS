from django.db.models import Q
from requests import Response
from rest_framework import viewsets, generics, status
from rest_framework.generics import get_object_or_404
from rest_framework.decorators import action
from .models import Branch, RoomType, Room
from .serializers import BranchSerializer, RoomTypeSerializer, RoomSerializer, RoomAvailabilitySerializer
from rest_framework.response import Response
import logging


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
                is_available=True
            ).exclude(
                Q(booking__check_in_date__lt=checkout,
                  booking__check_out_date__lte=checkout) |  # Phòng đã được đặt và kết thúc trước khi hoặc đúng thời gian bạn check-out.
                Q(booking__check_in_date__gte=checkin,
                  booking__check_out_date__gt=checkin) |  # Phòng đã được đặt bắt đầu sau thời gian bạn check-in hoặc kéo dài qua thời gian bạn check-in.
                Q(booking__check_in_date__lte=checkin, booking__check_out_date__gte=checkout)
                # Phòng đã được đặt bao phủ toàn bộ khoảng thời gian bạn yêu cầu.
            ).distinct()

            # Serialize danh sách các phòng có sẵn
            room_serializer = RoomSerializer(available_rooms, many=True)

            return Response({
                "available_rooms": room_serializer.data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='add-to-selection')
    def add_to_selection(self, request):
        # data = request.data
        # print(f"Received data: {data}")  # Log dữ liệu nhận được
        #
        # try:
        #     # Kiểm tra kiểu dữ liệu và đảm bảo dữ liệu được cung cấp đúng định dạng
        #     room_selection = {}
        #     room_selection[str(data['id'])] = {
        #         'branch_id': data['branch'],  # Sử dụng branch_id
        #         'branch_name': Branch.objects.get(id=data['branch']).name,  # Lấy tên chi nhánh từ database
        #         'price': data['price'],
        #         'number_of_beds': data['number_of_beds'],
        #         'room_number': data['room_number'],
        #         'room_type': RoomType.objects.get(id=data['room_type']).type,  # Lấy loại phòng từ database
        #         'room_id': data['room_id'],
        #         'checkout': data['checkout'],
        #         'checkin': data['checkin'],
        #     }
        # except TypeError as e:
        #     print(f"TypeError: {e}")  # Log lỗi nếu có
        #
        # if 'selection_data_obj' in request.session:
        #     selection_data = request.session['selection_data_obj']
        #     if str(data['id']) in selection_data:
        #         pass
        #     else:
        #         selection_data = request.session['selection_data_obj']
        #         selection_data.update(room_selection)
        #         request.session['selection_data_obj'] = selection_data
        # else:
        #     request.session['selection_data_obj'] = room_selection
        #
        # response_data = {
        #     "data": request.session['selection_data_obj'],
        #     "fruit": "banana",
        #     "name": "Thanh Lam",
        #     "total_selected_items": len(request.session['selection_data_obj'])
        # }
        #
        # return Response(response_data)
        data = request.data
        print(f"Received data: {data}")  # Log dữ liệu nhận được

        try:
            # Khởi tạo đối tượng chứa dữ liệu phòng được chọn
            room_selection = {}

            # Lấy đối tượng Branch từ ID
            branch = Branch.objects.get(id=data['branch'])
            # Lấy đối tượng RoomType từ ID
            room_type = RoomType.objects.get(id=data['room_type'])

            # Tạo dữ liệu phòng được chọn
            room_selection[str(data['id'])] = {
                'branch_id': branch.id,
                'branch_name': branch.name,
                'price': data['price'],
                'number_of_beds': data['number_of_beds'],
                'room_number': data['room_number'],
                'room_type': room_type.type,
                'room_id': data['room_id'],
                'checkout': data['checkout'],
                'checkin': data['checkin'],
            }
        except Branch.DoesNotExist:
            return Response({"error": "Branch not found"}, status=404)
        except RoomType.DoesNotExist:
            return Response({"error": "RoomType not found"}, status=404)
        except TypeError as e:
            print(f"TypeError: {e}")  # Log lỗi nếu có
            return Response({"error": "Invalid data type"}, status=400)

        # Log dữ liệu trước khi cập nhật
        print(f"Before update: {request.session.get('selection_data_obj', {})}")

        # Cập nhật dữ liệu trong session
        if 'selection_data_obj' in request.session:
            selection_data = request.session['selection_data_obj']
            selection_data.update(room_selection)
            request.session['selection_data_obj'] = selection_data
        else:
            request.session['selection_data_obj'] = room_selection

        # Log dữ liệu sau khi cập nhật
        print(f"After update: {request.session.get('selection_data_obj', {})}")

        response_data = {
            "data": request.session['selection_data_obj'],
            "fruit": "banana",
            "name": "Thanh Lam",
            "total_selected_items": len(request.session['selection_data_obj'])
        }

        return Response(response_data)
