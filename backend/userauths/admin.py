from django.contrib import admin
from userauths.models import User, Role


# Register your models here.
class UserAdmin(admin.ModelAdmin):
    search_fields = ['username']
    list_display = ['username',  'email', 'phone', 'sex']


admin.site.register(User, UserAdmin)
admin.site.register(Role)
