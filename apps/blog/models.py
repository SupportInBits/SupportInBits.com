from django.db import models
from django.urls import reverse
from django.utils.text import slugify
from django.conf import settings
from django.core.validators import MinLengthValidator
from tinymce.models import HTMLField

class Comentario(models.Model):
    entrada = models.ForeignKey('Entrada', on_delete=models.CASCADE, related_name='comentarios')
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comentarios_creados'
    )
    contenido = models.TextField(
        validators=[MinLengthValidator(10, "El comentario debe tener al menos 10 caracteres.")]
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    aprobado = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['fecha_creacion']
        verbose_name = "Comentario"
        verbose_name_plural = "Comentarios"
    
    def __str__(self):
        return f"Comentario de {self.autor.username} en {self.entrada.titulo}"
    
    @property
    def puede_editar(self):
        """
        Verifica si el usuario actual puede editar este comentario
        """
        if not hasattr(self, 'current_user'):
            return False
        return self.current_user == self.autor or self.current_user.is_superuser
    
    @property
    def puede_eliminar(self):
        if not hasattr(self, 'current_user'):
            return False
        return self.current_user == self.autor or self.current_user.is_staff

class Seccion(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    descripcion = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Sección"
        verbose_name_plural = "Secciones"
        ordering = ['nombre']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.nombre

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE, related_name='categorias')
    descripcion = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['nombre']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nombre} ({self.seccion.nombre})"

class Entrada(models.Model):
    titulo = models.CharField(max_length=255)
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='entradas_creadas',
        null=True
    )
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    contenido = models.TextField()
    
    #contenido = HTMLField()  # Reemplaza el TextField original
    resumen = models.TextField(max_length=500, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, related_name='entradas')
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    publicado = models.BooleanField(default=False)
    imagen_portada = models.ImageField(upload_to='blog/', blank=True, null=True)
    
    class Meta:
        verbose_name = "Entrada"
        verbose_name_plural = "Entradas"
        ordering = ['-fecha_publicacion']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.titulo)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return reverse('detalle_entrada', kwargs={'slug': self.slug})
    
    def __str__(self):
        return self.titulo
    
    # Propiedades calculadas para los metadatos
    @property
    def meta_titulo(self):
        return f"{self.titulo}"
    
    @property
    def meta_descripcion(self):
        return self.resumen[:255] if self.resumen else self.titulo[:255]
    
    @property
    def meta_robots(self):
        return "index, follow" if self.publicado else "noindex, nofollow"