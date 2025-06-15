from django import forms
from .models import Page, Contacto

class PageForm(forms.ModelForm):
    class Meta:
        model = Page
        fields = ['titulo', 'm_descri', 'm_robots', 'm_handF', 'm_mobileOp']


class ContactoForm(forms.ModelForm):
    class Meta:
        model = Contacto
        fields = ['nombre', 'correo', 'asunto', 'mensaje']
