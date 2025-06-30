from django.contrib import admin
from django.apps import apps
apps.all_models['users']

admin.site.register(apps.all_models['users'].values())