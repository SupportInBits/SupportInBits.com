from django import forms
from .models import Page

class PageForm(forms.ModelForm):
    class Meta:
        model = Page
        fields = ['titulo', 'm_descri', 'm_robots', 'm_handF', 'm_mobileOp']