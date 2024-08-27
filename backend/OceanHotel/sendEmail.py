from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import viewsets
from rest_framework.response import Response


def send_confirmation_email(booking):
    subject = 'Booking Confirmation'
    html_message = render_to_string('booking_confirmation_email.html', {'booking': booking})
    plain_message = strip_tags(html_message)
    recipient_list = [booking.email]
    sender = settings.EMAIL_HOST_USER
    send_mail(subject, plain_message, sender, [recipient_list], html_message=html_message)
