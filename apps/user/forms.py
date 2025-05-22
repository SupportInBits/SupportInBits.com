from django import forms
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