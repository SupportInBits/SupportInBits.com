from django.db import models

# Create your models here.

class Page (models.Model):
    titulo = models.CharField(max_length=255,null=False)
    m_descri = models.CharField(max_length=255,null=False)
    m_robots = models.CharField(max_length=255,null=False)
    m_handF = models.CharField(max_length=255, null=True)
    m_mobileOp = models.CharField(max_length=255, null=True)
    
    
    def __str__(self):
        return self.titulo
    
class Contacto(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField()
    asunto = models.CharField(max_length=150)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.asunto}"