# Generated by Django 5.1 on 2024-09-28 08:11

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('OceanHotel', '0010_coupon_alter_booking_payment_status_feedback_invoice_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='invoice',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='booking_invoice', to='OceanHotel.invoice'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='booking',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='invoice_booking', to='OceanHotel.booking'),
        ),
    ]
