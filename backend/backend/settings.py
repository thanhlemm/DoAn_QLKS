"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-vo%o6ll8zsnlvr6k+4f$w)dwczr#2*^h*j(#f*nuxsv2t*-p)_'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['oceanhotel.pythonanywhere.com']
CORS_ALLOW_ALL_ORIGINS = True


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 600  # 10 phut
# Session sẽ hết hạn khi trình duyệt được đóng
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Lưu lại session trên mỗi yêu cầu
SESSION_SAVE_EVERY_REQUEST = True
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

import cloudinary


# Cloudinary configuration
cloudinary.config(
    cloud_name='thanhlem',
    api_key='791132312397797',
    api_secret='_m9UIrPJn3_6VrSV3y9NiCvALng',
    api_proxy = "http://proxy.server:3128",
)
import cloudinary.uploader
import cloudinary.api

AUTH_USER_MODEL = 'userauths.User'

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"

FACEBOOK_CLIENT_ID = os.environ.get("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.environ.get("FACEBOOK_CLIENT_SECRET")
FACEBOOK_REDIRECT_URI = "http://127.0.0.1:8000/oauth/facebook/callback/"

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")

VNPAY_TMN_CODE = os.environ.get("VNPAY_TMN_CODE")
VNPAY_HASH_SECRET_KEY = os.environ.get("VNPAY_HASH_SECRET_KEY")
VNPAY_PAYMENT_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
VNPAY_RETURN_URL = 'https://oceanhotel.vercel.app/payment-result'


# Application definition

INSTALLED_APPS = [
    'jazzmin',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',

    # Google
    "sslserver",
    "rest_framework.authtoken",
    # "userauths.apps.UserauthsConfig",

    # Custom
    'userauths',
    'user_dashboard',
    'OceanHotel',
    'addon',
    'oauth2_provider',
    'drf_yasg',
    'corsheaders',

]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

]

import pymysql

pymysql.install_as_MySQLdb()

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  # Thư mục template chính
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'oceanhoteldb',
        'USER': 'root',
        'PASSWORD': 'Abcd1234',  # mk mysql
        'HOST': 'localhost',  # máy chủ cơ sở dữ liệu (mặc định là localhost)
        'PORT': '3306',
    }
}
# PYTHONANYWHERE
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'oceanhotel$oceanhoteldb',
#         'USER': 'oceanhotel',
#         'PASSWORD': 'Abcd@1234',
#         'HOST': 'oceanhotel.mysql.pythonanywhere-services.com',
#     }
# }

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    )
}
# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

JAZZMIN_SETTINGS = {
    'site_header': "OceanHotel",
    'site_brand': "Welcome to OceanHotel.",
    'site_logo': "/images/logo.png",
    'copyright': "All Right Reserved 2023",
    "welcome_sign": "Welcome to OceanHotel, Login Now.",
    "topmenu_links": [

        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Company", "url": "/admin/addons/company/"},
        {"name": "Users", "url": "/admin/userauths/user/"},

        {"model": "AUTH_USER_MODEL.User"},
    ],

    "order_with_respect_to": [
        "OceanHotel",
        "OceanHotel.Hotel",
        "OceanHotel.Room",
        "OceanHotel.Booking",
        "OceanHotel.BookingDetail",
        "OceanHotel.Guest",
        "OceanHotel.RoomServices",
        "userauths"
        "addons",
    ],

    "icons": {
        "admin.LogEntry": "fas fa-file",

        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",

        "userauths.User": "fas fa-user",
        "userauths.Role": "fas fa-user-cog",
        "userauths.Profile": "fas fa-address-card",

        "OceanHotel.Branch": "fas fa-th",
        "OceanHotel.Booking": "fas fa-calendar-week",
        "OceanHotel.BookingDetail": "fas fa-calendar-alt",
        "OceanHotel.Guest": "fas fa-user",
        "OceanHotel.Room": "fas fa-bed",
        "OceanHotel.RoomServices": "fas fa-user-cog",
        "OceanHotel.Notification": "fas fa-bell",
        "OceanHotel.Coupon": "fas fa-tag",
        "OceanHotel.Bookmark": "fas fa-heart",
    },

    "show_ui_builder": True
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": True,
    "brand_small_text": False,
    "brand_colour": "navbar-indigo",
    "accent": "accent-olive",
    "navbar": "navbar-indigo navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar": "sidebar-dark-indigo",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "cyborg",
    "dark_mode_theme": "cyborg",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}
