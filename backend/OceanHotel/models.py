from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField


class BaseModel(models.Model):
    created_date = models.DateTimeField(default=timezone.now, editable=False)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class Role(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Account(AbstractUser):
    name = models.CharField(max_length=100)
    avatar = CloudinaryField(null=True)
    DOB = models.DateField(null=True)
    Address = models.CharField(max_length=200, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    email = models.CharField(max_length=200, null=True, blank=True)

    class Sex(models.IntegerChoices):
        NAM = 1, 'Nam'
        NU = 2, 'Nữ'

    sex = models.IntegerField(choices=Sex.choices, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.username


class Branch(BaseModel):
    name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    manager = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='managed_branches')

    def __str__(self):
        return self.name


class RoomType(BaseModel):
    nameRoomType = models.CharField(max_length=100)
    price = models.CharField(max_length=100)
    quantity = models.CharField(max_length=10)
    image = CloudinaryField(null=True)

    def __str__(self):
        return self.nameRoomType


class Room(BaseModel):
    nameRoom = models.CharField(max_length=100)
    roomType = models.ForeignKey(RoomType, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)

    class Status(models.IntegerChoices):
        Trong = 0, 'Trống'
        CoNguoi = 1, 'Có người'

    status = models.IntegerField(choices=Status.choices, default=0)

    def __str__(self):
        return self.nameRoom


class Service(BaseModel):
    nameService = models.CharField(max_length=200, null=True)
    price = models.FloatField()

    def __str__(self):
        return str(self.nameService)


class Promotion(BaseModel):
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    discount = models.FloatField()
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)

    def __str__(self):
        return self.code


class Reservation(BaseModel):
    guest = models.ForeignKey(Account, on_delete=models.CASCADE)
    room = models.ManyToManyField(Room, related_name='rooms')
    services = models.ManyToManyField(Service, through='ReservationService')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)
    promotion = models.ForeignKey(Promotion, on_delete=models.SET_NULL, null=True, blank=True)
    bookDate = models.DateTimeField()
    checkin = models.DateField()
    checkout = models.DateField()
    active = models.BooleanField(default=True)
    deposit = models.FloatField(default=0)
    deposit_paid = models.BooleanField(default=False)

    def clean(self):
        super().clean()
        if self.guest.role.name != 'Khách hàng':
            raise ValidationError('Người dùng phải có vai trò Khách hàng.')

    def calculate_deposit(self):
        room_cost = sum(float(room.roomType.price) for room in self.room.all())
        service_cost = sum(rs.service.price * rs.quantity for rs in self.reservationservice_set.all())
        total_cost = room_cost + service_cost
        discount = self.promotion.discount if self.promotion else 0
        self.deposit = (total_cost - discount) * 0.5

    def save(self, *args, **kwargs):
        self.calculate_deposit()
        super().save(*args, **kwargs)

    def __str__(self):
        room_names = ", ".join(self.room.values_list('nameRoom', flat=True))
        return f"{room_names} - Guest: {self.guest.name} - Branch: {self.branch.name} - Promotion: {self.promotion.code if self.promotion else 'None'}"


class CheckinReceipt(BaseModel):
    reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE)
    checkin_date = models.DateTimeField()
    received_by = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='checkin_receipts')

    def __str__(self):
        return f"Check-in Receipt for Reservation {self.reservation.id} - Checked in on {self.checkin_date}"


class ReservationService(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    createdDate = models.DateTimeField(auto_now_add=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.service.nameService} - Reservation: {self.reservation.guest.name}"


class Bill(BaseModel):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, null=True)
    totalAmount = models.FloatField()
    summary = models.TextField()
    active = models.BooleanField(default=True)

    def calculate_total_amount(self):
        room_cost = sum(float(room.roomType.price) for room in self.reservation.room.all())
        service_cost = sum(rs.service.price * rs.quantity for rs in self.reservation.reservationservice_set.all())
        discount = self.reservation.promotion.discount if self.reservation.promotion else 0
        self.totalAmount = room_cost + service_cost - discount
        self.save()

    def __str__(self):
        return str(self.reservation.guest) + " " + str(self.summary) + " " + str(self.totalAmount)


class Refund(models.Model):
    guest = models.ForeignKey(Account, null=True, on_delete=models.CASCADE)
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    reason = models.TextField()

    def clean(self):
        super().clean()
        if self.guest.role.name != 'Khách hàng':
            raise ValidationError('Người dùng phải có vai trò Khách hàng.')

    def __str__(self):
        return str(self.guest)


class Review(BaseModel):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField()
    comment = models.TextField()

    def __str__(self):
        return f"{self.reservation.guest.name} - Rating: {self.rating}"


class ChatbotMessage(BaseModel):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    message = models.TextField()
    response = models.TextField()

    def __str__(self):
        return f"Message from {self.user.name}"


class Notification(BaseModel):
    recipient = models.ForeignKey(Account, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification to {self.recipient.name} - {self.title}"
