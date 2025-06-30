from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketView,
    TicketDetailView,
    RelatedTicketsView,
    TicketsByDepartmentView,
    TranslateView,
    TicketCommentView,
    ThirdPartyRoleTicketView,
)

router = DefaultRouter()
router.register(r'third-party/tickets', ThirdPartyRoleTicketView, basename='third-party-tickets')

urlpatterns = [
    path('', TicketView.as_view(), name='ticket-list-create'),
    path('<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('<int:pk>/related/', RelatedTicketsView.as_view(), name='related-tickets'),
    path('by-department/', TicketsByDepartmentView.as_view(), name='tickets-by-department'),
    path('translate/', TranslateView.as_view(), name='translate-ticket'),
    path('<int:pk>/comments/', TicketCommentView.as_view(), name='ticket-comments'),
    path('third-party/', ThirdPartyRoleTicketView.as_view(), name='third-party-tickets'),
]






















# from django.urls import path
# from .views import RegisterView, LoginView, ProtectedView, LogoutView, RequestPasswordResetView, ResetPasswordView

# urlpatterns = [
#     path('register/', RegisterView.as_view()),
#     path('login/', LoginView.as_view()),
#     path('protected/', ProtectedView.as_view()),
#     path('logout/', LogoutView.as_view()),
#     path('reset-password/', RequestPasswordResetView.as_view()),
#     path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view()),
# ]
