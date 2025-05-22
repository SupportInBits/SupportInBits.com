from django import forms
from django.utils.text import slugify
from .models import Entrada, Categoria
from .models import Comentario
from tinymce.widgets import TinyMCE

from django.core.exceptions import ValidationError
from django.utils.text import get_valid_filename
import os

class EntradaForm(forms.ModelForm):
    class Meta:
        model = Entrada
        fields = ['titulo', 'contenido', 'resumen', 'categoria', 'publicado', 'imagen_portada']
        widgets = {
            'titulo': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Título de la entrada'
            }),
            'contenido': TinyMCE(attrs={
                'cols': 80, 
                'rows': 40
            }),
            'resumen': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Resumen breve (opcional)'
            }),
            'categoria': forms.Select(attrs={
                'class': 'form-select'
            }),
            'publicado': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'imagen_portada': forms.ClearableFileInput(attrs={
                'class': 'form-control',
                'accept': 'image/*'  # Acepta solo imágenes
            }),
        }
        labels = {
            'publicado': 'Publicar entrada',
            'imagen_portada': 'Imagen de portada (recomendado 1200x630px)'
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super(EntradaForm, self).__init__(*args, **kwargs)
        self.fields['categoria'].queryset = Categoria.objects.all()
        
        # Mejora la presentación del campo de imagen
        self.fields['imagen_portada'].widget.attrs.update({
            'class': 'form-control',
            'accept': 'image/*'
        })

    def clean_imagen_portada(self):
        imagen = self.cleaned_data.get('imagen_portada')
        
        if imagen:
            # Validación de tamaño (5MB máximo)
            max_size = 5 * 1024 * 1024  # 5MB
            if imagen.size > max_size:
                raise ValidationError(f"La imagen es demasiado grande. Tamaño máximo permitido: {max_size/1024/1024}MB")
            
            # Validación de formato
            valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
            ext = os.path.splitext(imagen.name)[1].lower()
            if ext not in valid_extensions:
                raise ValidationError("Formato no soportado. Use JPG, PNG o WEBP")
            
            # Renombrar el archivo para evitar problemas con caracteres especiales
            filename = get_valid_filename(imagen.name)
            imagen.name = f"{slugify(self.cleaned_data.get('titulo', 'imagen'))[:100]}{ext}"
            
        return imagen

    def save(self, commit=True):
        instance = super().save(commit=False)
        if self.user:
            instance.autor = self.user
        if not instance.slug:
            instance.slug = slugify(instance.titulo)
        
        # Manejo especial para cuando se actualiza una imagen
        if 'imagen_portada' in self.changed_data and instance.imagen_portada:
            # Elimina la imagen anterior si existe
            try:
                old_instance = Entrada.objects.get(pk=instance.pk)
                if old_instance.imagen_portada:
                    old_instance.imagen_portada.delete(save=False)
            except Entrada.DoesNotExist:
                pass
        
        if commit:
            instance.save()
            self.save_m2m()
        return instance
    

class ComentarioForm(forms.ModelForm):
    class Meta:
        model = Comentario
        fields = ['contenido']
        widgets = {
            'contenido': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Escribe tu comentario aquí...'
            })
        }
        labels = {
            'contenido': ''
        }

class EditarComentarioForm(forms.ModelForm):
    class Meta:
        model = Comentario
        fields = ['contenido']
        widgets = {
            'contenido': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Escribe tu comentario aquí...'
            }),
        }
        labels = {
            'contenido': 'Editar comentario'
        }