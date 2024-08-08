from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin
from OceanHotel.models import Branch, Booking, Room, RoomType, StaffBooking


class HotelAdmin(admin.ModelAdmin):
    list_display = ['name', 'manager', 'status']


#
#
# # Inline admin cho ReservationService
# class ReservationServiceInline(admin.TabularInline):
#     model = ReservationService
#     extra = 1
#
#
# # Inline admin cho Service trong Reservation
# class ServiceInline(admin.TabularInline):
#     model = Reservation.services.through
#     extra = 1
#
#
# # Admin tùy chỉnh cho Reservation
# class ReservationAdmin(admin.ModelAdmin):
#     inlines = [ReservationServiceInline, ServiceInline]
#     list_display = ('guest', 'bookDate', 'checkin', 'checkout', 'branch', 'active')
#     list_filter = ('branch', 'active')
#     search_fields = ('guest__username', 'branch__name')
#
#
# # Admin tùy chỉnh cho Account
# class AccountAdmin(UserAdmin):
#     model = Account
#     list_display = ('username', 'name', 'email', 'role', 'is_staff')
#     list_filter = ('is_staff', 'is_superuser', 'role')
#     fieldsets = (
#         (None, {'fields': ('username', 'password')}),
#         ('Thông tin cá nhân', {'fields': ('name', 'email', 'DOB', 'avatar', 'Address', 'phone', 'sex', 'role')}),
#         ('Quyền hạn', {'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions', 'groups')}),
#         ('Ngày quan trọng', {'fields': ('last_login', 'date_joined')}),
#     )
#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': ('username', 'name', 'email', 'password1', 'password2', 'role'),
#         }),
#     )
#     search_fields = ('username', 'name', 'email')
#     ordering = ('username',)
#
#
# # Đăng ký các mô hình với trang admin
# admin.site.register(Role)
# admin.site.register(Account, AccountAdmin)
admin.site.register(Branch, HotelAdmin)
admin.site.register(Room)
admin.site.register(Booking)
admin.site.register(RoomType)
admin.site.register(StaffBooking)
# admin.site.register(Service)
# admin.site.register(ReservationService)
# admin.site.register(Refund)
# admin.site.register(CheckinReceipt)
# admin.site.register(Promotion)
# admin.site.register(Bill)
# admin.site.register(ChatbotMessage)
# admin.site.register(Notification)
# admin.site.register(Review)
#
