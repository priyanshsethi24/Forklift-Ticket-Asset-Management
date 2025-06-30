from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # Admin and app URLs
    path('admin/', admin.site.urls),
    path('', include('users.urls')),
    path('tickets/', include('ticket_system.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


