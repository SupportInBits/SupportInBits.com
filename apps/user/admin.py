from django.contrib import admin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_superuser', 'is_staff', 'is_active')
    search_fields = ('username', 'email')