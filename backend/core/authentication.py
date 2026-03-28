import jwt
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from .models import User
import uuid

class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
        except ValueError:
            return None

        if not settings.SUPABASE_JWT_SECRET:
            raise exceptions.AuthenticationFailed('SUPABASE_JWT_SECRET is not configured.')

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated'
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')

        user_id = payload.get('sub')
        if not user_id:
            raise exceptions.AuthenticationFailed('Token contains no user ID')

        try:
            user_uuid = uuid.UUID(user_id)
            # Retrieve or create user based on token to keep Django DB synced with Supabase Auth
            user, created = User.objects.get_or_create(
                id=user_uuid,
                defaults={
                    'email': payload.get('email', f"{user_id}@example.com"), 
                    'full_name': payload.get('user_metadata', {}).get('full_name', 'Unknown User')
                }
            )
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'User lookup failed: {str(e)}')

        return (user, token)