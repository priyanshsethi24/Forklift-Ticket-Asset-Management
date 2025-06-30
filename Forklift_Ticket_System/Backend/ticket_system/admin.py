from django.contrib import admin
from .models import Attachment, Ticket

class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'get_file_type', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('ticket__title', 'ticket__ticket_id')

    def get_file_type(self, obj):
        if obj.image:
            return "Image"
        elif obj.document:
            return "Document"
        return "Unknown"
    get_file_type.short_description = "File Type"

admin.site.register(Attachment, AttachmentAdmin)

class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'title', 'status', 'priority', 'department', 'creator', 'last_updated')
    list_filter = ('status', 'priority', 'department')
    search_fields = ('title', 'customer_name', 'customer_company')

admin.site.register(Ticket, TicketAdmin)
