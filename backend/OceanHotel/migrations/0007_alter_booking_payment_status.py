# Generated by Django 5.1 on 2024-08-17 16:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('OceanHotel', '0006_remove_booking_full_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='payment_status',
            field=models.CharField(blank=True, choices=[('paid', 'Paid'), ('pending', 'Pending'), ('processing', 'Processing'), ('cancelled', 'Cancelled'), ('failed', 'Failed'), ('refunding', 'Refunding'), ('refunded', 'Refunded'), ('unpaid', 'Unpaid'), ('expired', 'Expired')], max_length=100, null=True),
        ),
    ]
