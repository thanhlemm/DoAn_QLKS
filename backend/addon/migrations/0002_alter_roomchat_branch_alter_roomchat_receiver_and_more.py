# Generated by Django 5.1 on 2024-10-02 10:13

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('OceanHotel', '0011_booking_invoice_alter_invoice_booking'),
        ('addon', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='roomchat',
            name='branch',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_rooms', to='OceanHotel.branch'),
        ),
        migrations.AlterField(
            model_name='roomchat',
            name='receiver',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='receiver_rooms', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='roomchat',
            name='sender',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sender_rooms', to=settings.AUTH_USER_MODEL),
        ),
    ]
