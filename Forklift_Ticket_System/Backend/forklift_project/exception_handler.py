from rest_framework.views import exception_handler
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken, AuthenticationFailed as JWTAuthenticationFailed

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, (InvalidToken, TokenError, JWTAuthenticationFailed)):
        return Response(
            {"detail": "Your session has expired due to inactivity or a new login."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if isinstance(exc, AuthenticationFailed):
        return Response(
            {"detail": "Authentication credentials were not provided or are invalid."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return response
