from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from userauths.models import User
import uuid
from django.db.models import Avg


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
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_branches')
    status = models.CharField(max_length=20, choices=HOTEL_STATUS, default="Live")
    tags = models.CharField(max_length=200, help_text="Seperate tags with comma")
    views = models.IntegerField(default=0)  # Số lượt xem chi nhánh
    featured = models.BooleanField(default=False)  # chi nhánh có được đánh dấu nổi bật

    def __str__(self):
        return self.name

    def average_rating(self):
        return self.feedbacks.aggregate(Avg('rating'))['rating__avg'] or 0


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
    ("paid", "Paid"),  # Đã thanh toán
    ("pending", "Pending"),  # Đang chờ xử lý
    ("failed", "Failed"),  # Thất bại
    ("cancelled", "Cancelled"),  # Đã hủy
    ("refunded", "Refunded"),  # Đã hoàn tiền
    ("unpaid", "Unpaid"),  # Chưa thanh toán
)


class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    payment_status = models.CharField(max_length=100, choices=PAYMENT_STATUS, null=True, blank=True)
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
    confirmationCode = models.CharField(max_length=36, unique=True, blank=True, null=True)
    invoice = models.OneToOneField('Invoice', on_delete=models.CASCADE, related_name='booking_invoice', null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.confirmationCode:
            self.confirmationCode = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def update_status_to_paid(self):
        self.payment_status = 'paid'
        self.save()

    def __str__(self):
        return f"Booking ID: {self.id}"


class StaffBooking(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    staff_id = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Staff ID: {self.staff_id} for Booking ID: {self.booking.id}"


COUPON_TYPE = (
    ("percentage", "Percentage"),
    ("fixed", "Fixed"),
)


class Coupon(BaseModel):
    code = models.CharField(max_length=50, unique=True)
    type = models.CharField(max_length=20, choices=COUPON_TYPE, default="percentage")
    discount = models.IntegerField(default=1, help_text="Discount value (percentage or fixed amount)")
    redemptions = models.IntegerField(default=0)  # Số lần mã đã được sử dụng
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    date = models.DateTimeField(auto_now_add=True)  # Ngày tạo mã
    max_redemptions = models.IntegerField(default=100, null=True)  # Giới hạn số lần sử dụng

    def __str__(self):
        return f"{self.code} - {self.discount}{'%' if self.type == 'percentage' else ''}"

    def is_valid(self):
        """Check if coupon is valid based on current date."""
        return self.valid_from <= timezone.now() <= self.valid_to


class Feedback(BaseModel):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="feedbacks")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="feedbacks")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.PositiveIntegerField(default=5)  # Rating out of 5 stars
    comment = models.TextField()
    feedback_date = models.DateTimeField(auto_now_add=True)
    response = models.TextField(null=True, blank=True, help_text="Optional response from the branch")

    def __str__(self):
        return f"Feedback for Booking {self.booking.id} by {self.user.username if self.user else 'Anonymous'} - Rating: {self.rating}/5"

    class Meta:
        verbose_name_plural = "Feedbacks"


NOTIFICATION_TYPE = (
    ("Booking Confirmed", "Booking Confirmed"),
    ("Booking Cancelled", "Booking Cancelled"),
    ("Coupon Issued", "Coupon Issued"),
    ("Coupon Expired", "Coupon Expired")
)


class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.CharField(max_length=100, choices=NOTIFICATION_TYPE)
    seen = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)
    content = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.date}"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link invoice to a user
    # booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, related_name='invoice')
    booking = models.OneToOneField('Booking', on_delete=models.CASCADE, related_name='invoice_booking', null=True)
    order_id = models.CharField(max_length=255)  # VNPay order ID
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Amount paid
    description = models.CharField(max_length=255)  # Order description
    payment_method = models.CharField(max_length=50)  # VNPay or other methods
    transaction_date = models.DateTimeField(default=timezone.now)  # Date of payment
    bank_code = models.CharField(max_length=50, blank=True, null=True)  # Bank code used for payment
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')  # Payment status
    vnp_response_code = models.CharField(max_length=10, blank=True, null=True)  # VNPay response code

    def __str__(self):
        return f"Invoice {self.order_id} - {self.user.username} - {self.booking.confirmationCode}"
