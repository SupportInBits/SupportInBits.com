from django import forms
from django.forms.widgets import ClearableFileInput
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from apps.user.models import Usuario

class RegistroForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Correo electrónico',
            'autocomplete': 'email'
        }),
        error_messages={
            'required': 'El email es obligatorio',
            'invalid': 'Introduce un email válido'
        }
    )
    
    terms = forms.BooleanField(
        required=True,
        label="Acepto los términos y condiciones",
        error_messages={
            'required': 'Debes aceptar los términos y condiciones para registrarte'
        }
    )
    
    class Meta:
        model = Usuario
        fields = ('username', 'email', 'password1', 'password2', 'terms')
        
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre de usuario',
                'autocomplete': 'username'
            }),
        }
        
        error_messages = {
            'username': {
                'required': 'El nombre de usuario es obligatorio',
                'max_length': 'El nombre de usuario es demasiado largo',
            },
            'password1': {
                'required': 'Debes introducir una contraseña',
            },
            'password2': {
                'required': 'Debes confirmar tu contraseña',
            },
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Configurar mensajes de ayuda y placeholders
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Contraseña',
            'autocomplete': 'new-password'
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Confirmar contraseña',
            'autocomplete': 'new-password'
        })

class LoginForm(AuthenticationForm):
    username = forms.CharField(label='Usuario o Email')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Usuario o Email'})
        self.fields['password'].widget.attrs.update({'class': 'form-control', 'placeholder': 'Contraseña'})

class CustomClearableFileInput(ClearableFileInput):
    initial_text = "Imagen actual"
    input_text = "Cambiar"
    clear_checkbox_label = "Eliminar"

class EditarPerfilForm(forms.ModelForm):
    class Meta:
        model = Usuario
        fields = ['username', 'email', 'first_name', 'last_name', 'avatar', 'biografia', 'sitio_web']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control','readonly': 'readonly'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'avatar': CustomClearableFileInput(attrs={'class': 'form-control'}),
            'biografia': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'sitio_web': forms.URLInput(attrs={'class': 'form-control'}),
        }
        labels = {
            'username': 'Nombre de usuario',
            'email': 'Correo electrónico',
            'first_name': 'Nombre',
            'last_name': 'Apellidos',
            'avatar': 'Avatar',
            'biografia': 'Biografía',
            'sitio_web': 'Sitio web',
        }
        error_messages = {
            'username': {
                'required': 'El nombre de usuario es obligatorio.',
                'max_length': 'El nombre de usuario es demasiado largo.',
                'unique': 'Este nombre de usuario ya está en uso.',
                'invalid': 'Solo se permiten letras, números y @/./+/-/_',
            },
            'email': {
                'required': 'El correo electrónico es obligatorio.',
                'invalid': 'Introduce un correo electrónico válido.',
                'unique': 'Este correo electrónico ya está registrado.',
            },
        }
        help_texts = {
            'username': 'Obligatorio. 150 caracteres o menos. Solo letras, números y @/./+/-/_',
            'email': 'El correro eletrónico no se puede cambiar una vez registrado.',
            
        }