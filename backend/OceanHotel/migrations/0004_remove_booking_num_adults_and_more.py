# Generated by Django 5.0.7 on 2024-08-05 08:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('OceanHotel', '0003_remove_booking_stripe_payment_intent_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='booking',
            name='num_adults',
        ),
        migrations.RemoveField(
            model_name='booking',
            name='num_children',
        ),
    ]
