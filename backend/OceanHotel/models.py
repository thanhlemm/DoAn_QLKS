from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from userauths.models import User


class BaseModel(models.Model):
    created_date = models.DateTimeField(default=timezone.now, editable=False)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


HOTEL_STATUS = (
    ("Draft", "Draft"),  # Đang được tạo, chưa công khai
    ("Disabled", "Disabled"),  # Bị vô hiệu hoá, không thể đặt phòng
    ("Rejected", "Rejected"),  # Bị báo cáo vi phạm
    ("In Review", "In Review"),  # Đang kiểm duyệt trước khi được công khai
    ("Live", "Live"),)  # Đang hoạt


class Branch(BaseModel):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    email = models.EmailField(max_length=100)
    image = CloudinaryField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=HOTEL_STATUS, default="Live")
    tags = models.CharField(max_length=200, help_text="Seperate tags with comma")
    views = models.IntegerField(default=0)  # Số lượt xem chi nhánh
    featured = models.BooleanField(default=False)  # chi nhánh có được đánh dấu nổi bật

    def __str__(self):
        return self.name


class RoomType(BaseModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    type = models.CharField(max_length=10)
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    number_of_beds = models.PositiveIntegerField(default=0)
    room_capacity = models.PositiveIntegerField(default=0)
    image = CloudinaryField(null=True)

    def __str__(self):
        return f"{self.type} - {self.branch.name} - {self.price}"

    class Meta:
        verbose_name_plural = "Room Types"

    def rooms_count(self):
        return Room.objects.filter(room_type=self).count()


class Room(BaseModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE)
    room_number = models.CharField(max_length=1000)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.room_type.type} - {self.branch.name} - {self.room_type.price}"

    class Meta:
        verbose_name_plural = "Rooms"

    def price(self):
        return self.room_type.price

    def number_of_beds(self):
        return self.room_type.number_of_beds


PAYMENT_STATUS = (
    ("paid", "Paid"),
    ("pending", "Pending"),
    ("processing", "Processing"),
    ("cancelled", "Cancelled"),
    ("failed", "Failed"),
    ("refunding", "Refunding"),
    ("refunded", "Refunded"),
    ("unpaid", "Unpaid"),
    ("expired", "Expired"),
)


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    payment_status = models.CharField(max_length=100, choices=PAYMENT_STATUS)
    full_name = models.CharField(max_length=1000)
    email = models.EmailField(max_length=1000)
    phone = models.CharField(max_length=1988)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    room_type = models.ForeignKey(RoomType, on_delete=models.SET_NULL, null=True, blank=True)
    room = models.ManyToManyField(Room)
    before_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    saved = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    total_days = models.PositiveIntegerField(default=0)
    checked_in = models.BooleanField(default=False)
    checked_out = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    checked_in_tracker = models.BooleanField(default=False)
    checked_out_tracker = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking ID: {self.id}"


class StaffBooking(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    staff_id = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Staff ID: {self.staff_id} for Booking ID: {self.booking.id}"
# class Service(BaseModel):
#     nameService = models.CharField(max_length=200, null=True)
#     price = models.FloatField()
#
#     def __str__(self):
#         return str(self.nameService)
#
#
# class Promotion(BaseModel):
#     code = models.CharField(max_length=20, unique=True)
#     description = models.TextField()
#     discount = models.FloatField()
#     branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
#
#     def __str__(self):
#         return self.code
#
#
# class Reservation(BaseModel):
#     guest = models.ForeignKey(Account, on_delete=models.CASCADE)
#     room = models.ManyToManyField(Room, related_name='rooms')
#     services = models.ManyToManyField(Service, through='ReservationService')
#     branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
#     promotion = models.ForeignKey(Promotion, on_delete=models.SET_NULL, null=True, blank=True)
#     bookDate = models.DateTimeField()
#     checkin = models.DateField()
#     checkout = models.DateField()
#     active = models.BooleanField(default=True)
#     deposit = models.FloatField(default=0)
#     deposit_paid = models.BooleanField(default=False)
#
#     def clean(self):
#         super().clean()
#         if self.guest.role.name != 'Khách hàng':
#             raise ValidationError('Người dùng phải có vai trò Khách hàng.')
#
#     def calculate_deposit(self):
#         room_cost = sum(float(room.roomType.price) for room in self.room.all())
#         service_cost = sum(rs.service.price * rs.quantity for rs in self.reservationservice_set.all())
#         total_cost = room_cost + service_cost
#         discount = self.promotion.discount if self.promotion else 0
#         self.deposit = (total_cost - discount) * 0.5
#
#     def save(self, *args, **kwargs):
#         self.calculate_deposit()
#         super().save(*args, **kwargs)
#
#     def __str__(self):
#         room_names = ", ".join(self.room.values_list('nameRoom', flat=True))
#         return f"{room_names} - Guest: {self.guest.name} - Branch: {self.branch.name} - Promotion: {self.promotion.code if self.promotion else 'None'}"
#
#
# class CheckinReceipt(BaseModel):
#     reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE)
#     checkin_date = models.DateTimeField()
#     received_by = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='checkin_receipts')
#
#     def __str__(self):
#         return f"Check-in Receipt for Reservation {self.reservation.id} - Checked in on {self.checkin_date}"
#
#
# class ReservationService(models.Model):
#     reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
#     service = models.ForeignKey(Service, on_delete=models.CASCADE)
#     createdDate = models.DateTimeField(auto_now_add=True)
#     quantity = models.PositiveIntegerField(default=1)
#
#     def __str__(self):
#         return f"{self.service.nameService} - Reservation: {self.reservation.guest.name}"
#
#
# class Bill(BaseModel):
#     reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, null=True)
#     totalAmount = models.FloatField()
#     summary = models.TextField()
#     active = models.BooleanField(default=True)
#
#     def calculate_total_amount(self):
#         room_cost = sum(float(room.roomType.price) for room in self.reservation.room.all())
#         service_cost = sum(rs.service.price * rs.quantity for rs in self.reservation.reservationservice_set.all())
#         discount = self.reservation.promotion.discount if self.reservation.promotion else 0
#         self.totalAmount = room_cost + service_cost - discount
#         self.save()
#
#     def __str__(self):
#         return str(self.reservation.guest) + " " + str(self.summary) + " " + str(self.totalAmount)
#
#
# class Refund(models.Model):
#     guest = models.ForeignKey(Account, null=True, on_delete=models.CASCADE)
#     reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
#     reason = models.TextField()
#
#     def clean(self):
#         super().clean()
#         if self.guest.role.name != 'Khách hàng':
#             raise ValidationError('Người dùng phải có vai trò Khách hàng.')
#
#     def __str__(self):
#         return str(self.guest)
#
#
# class Review(BaseModel):
#     reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
#     rating = models.PositiveIntegerField()
#     comment = models.TextField()
#
#     def __str__(self):
#         return f"{self.reservation.guest.name} - Rating: {self.rating}"
#
#
# class ChatbotMessage(BaseModel):
#     user = models.ForeignKey(Account, on_delete=models.CASCADE)
#     message = models.TextField()
#     response = models.TextField()
#
#     def __str__(self):
#         return f"Message from {self.user.name}"
#
#
# class Notification(BaseModel):
#     recipient = models.ForeignKey(Account, on_delete=models.CASCADE)
#     title = models.CharField(max_length=200)
#     message = models.TextField()
#     read = models.BooleanField(default=False)
#
#     def __str__(self):
#         return f"Notification to {self.recipient.name} - {self.title}"
