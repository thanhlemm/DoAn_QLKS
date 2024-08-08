# Generated by Django 5.0.7 on 2024-08-03 17:32

import cloudinary.models
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Branch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_date', models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('active', models.BooleanField(default=True)),
                ('name', models.CharField(max_length=100)),
                ('address', models.CharField(max_length=200)),
                ('phone', models.CharField(max_length=15)),
                ('email', models.EmailField(max_length=100)),
                ('image', cloudinary.models.CloudinaryField(max_length=255)),
                ('status', models.CharField(choices=[('Draft', 'Draft'), ('Disabled', 'Disabled'), ('Rejected', 'Rejected'), ('In Review', 'Draft'), ('Live', 'Live')], default='Live', max_length=20)),
                ('tags', models.CharField(help_text='Seperate tags with comma', max_length=200)),
                ('views', models.IntegerField(default=0)),
                ('featured', models.BooleanField(default=False)),
                ('manager', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
