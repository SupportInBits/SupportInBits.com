from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='inicio'),
    path('politicas-de-privacidad/', views.politicas, name='politica-privacidad'),
    path('contacto/', views.about, name='about'),
    path('preguntas-frecuentes/', views.faq, name='faq'),
    path('politica-de-cookies/', views.cookies, name='politica-cookies'),
    path('herramientas/', views.plantillas, name='plantillas'),
    path('test/', views.test, name='tests'),
    path('pages/', views.getAllPages, name='lista_pages'),
    path('contactanos/', views.contacto_vista, name='contactanos'),
]