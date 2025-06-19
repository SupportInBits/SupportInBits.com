from django.contrib.auth.models import AbstractUser
from django.db import models
from user.managers import UsuarioManager
from PIL import Image
import os

"""
Modelo usuario que hereda de AbstractUser.
Incluye campos adicionales como rol, avatar, biografía y sitio web.
Además, define propiedades para verificar roles de usuario.
"""
class Usuario(AbstractUser):
    ROLES = (
        ('visitante', 'Visitante'),
        ('registrado', 'Usuario Registrado'),
        ('moderador', 'Moderador'),
        ('administrador', 'Administrador'),
    )
    
    rol = models.CharField(max_length=15, choices=ROLES, default='registrado')
    avatar = models.ImageField(upload_to='avatares/', blank=True, null=True)
    biografia = models.TextField(blank=True)
    sitio_web = models.URLField(blank=True)
    
    objects = UsuarioManager()  # Asigna el manager personalizado
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.avatar:
            img_path = self.avatar.path
            img = Image.open(img_path)

            # Construir ruta con .webp
            webp_path = os.path.splitext(img_path)[0] + ".webp"

            # Convertir y guardar en webp
            img.save(webp_path, "WEBP", quality=85)

            # Eliminar la imagen original si no es webp
            if not img_path.endswith('.webp'):
                os.remove(img_path)

            # Cambiar el campo avatar para que apunte al .webp
            self.avatar.name = os.path.splitext(self.avatar.name)[0] + ".webp"
            super().save(update_fields=['avatar'])


    @property
    def es_administrador(self):
        return self.rol == 'administrador' or self.is_superuser
    
    @property
    def es_moderador(self):
        return self.rol == 'moderador' or self.es_administrador
    
    @property
    def es_registrado(self):
        return self.rol == 'registrado' or self.es_moderador
    
    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"