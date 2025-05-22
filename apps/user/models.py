from django.contrib.auth.models import AbstractUser
from django.db import models

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