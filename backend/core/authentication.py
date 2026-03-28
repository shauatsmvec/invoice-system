from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from .models import User
import uuid
from supabase import create_client, Client

class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    def __init__(self):
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

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

        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            raise exceptions.AuthenticationFailed('Supabase credentials are not configured.')

        try:
            # Use the SDK to verify the token and get the user
            response = self.supabase.auth.get_user(token)
            sb_user = response.user
            
            if not sb_user:
                raise exceptions.AuthenticationFailed('Invalid token or user not found.')

        except Exception as e:
            # print(f"DEBUG: Auth error: {str(e)}")
            raise exceptions.AuthenticationFailed(f'Token verification failed: {str(e)}')

        user_id = sb_user.id
        email = sb_user.email
        full_name = sb_user.user_metadata.get('full_name', 'Unknown User')

        try:
            user_uuid = uuid.UUID(user_id)
            user, created = User.objects.get_or_create(
                id=user_uuid,
                defaults={
                    'email': email, 
                    'full_name': full_name
                }
            )
            # Update user info if it changed
            if not created and (user.email != email or user.full_name != full_name):
                user.email = email
                user.full_name = full_name
                user.save()
                
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'User sync failed: {str(e)}')

        return (user, token)
