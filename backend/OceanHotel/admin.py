from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
from OceanHotel.models import Branch, Booking, Room, RoomType, StaffBooking, Coupon, Feedback, Notification, Invoice


class HotelAdmin(admin.ModelAdmin):
    list_display = ['name', 'manager', 'status']


admin.site.register(Branch, HotelAdmin)
admin.site.register(Room)
admin.site.register(Booking)
admin.site.register(RoomType)
admin.site.register(StaffBooking)
admin.site.register(Coupon)
admin.site.register(Feedback)
admin.site.register(Notification)
admin.site.register(Invoice)

