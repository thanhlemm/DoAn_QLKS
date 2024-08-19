from django.conf import settings
from requests_oauthlib import OAuth2Session
import requests
import cloudinary.uploader
from io import BytesIO


def google_callback(redirect_uri: str, auth_uri: str):
    session = OAuth2Session(
        settings.GOOGLE_CLIENT_ID,
        redirect_uri=redirect_uri,
        scope=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
    )
    session.fetch_token(
        settings.GOOGLE_TOKEN_URL,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        authorization_response=auth_uri,
    )

    user_data = session.get("https://www.googleapis.com/oauth2/v1/userinfo").json()
    return user_data


def facebook_callback(redirect_uri: str, auth_uri: str):
    session = OAuth2Session(
        settings.FACEBOOK_CLIENT_ID,
        redirect_uri=redirect_uri,
        scope=["email", "public_profile"],
    )

    # Trao đổi mã xác thực lấy access token từ Facebook
    session.fetch_token(
        "https://graph.facebook.com/v9.0/oauth/access_token",
        client_secret=settings.FACEBOOK_CLIENT_SECRET,
        authorization_response=auth_uri,
    )

    # Lấy thông tin người dùng từ Facebook
    user_data = session.get("https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture").json()

    return user_data


def upload_image_from_url(imageURL):
    response = requests.get(imageURL)
    if response.status_code == 200:
        image_data = BytesIO(response.content)
        upload_response = cloudinary.uploader.upload(image_data, use_filename=True, unique_filename=False)
        return upload_response['secure_url']
    return None


