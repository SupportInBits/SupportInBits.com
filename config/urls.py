<<<<<<< HEAD
"""supportinbits URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
=======
"""
URL configuration for supportinbits project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
>>>>>>> a36964bd04a4e4a5cff9b82c96b9b463ede2e774
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
<<<<<<< HEAD
from django.urls import path, include
from apps.blog.views import buscar_entradas_ajax
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = [
    path('', include('page.urls')),
    path('cookies/', include('cookie_consent.urls')),
    path('accounts/', include('allauth.urls')),  # rutas de allauth
    path('blog/', include('blog.urls')),
    path('usuario/', include('user.urls')),  # Unificar todas las URLs de usuario bajo /user/
    path('admin/', admin.site.urls),
    path('buscar/ajax/', buscar_entradas_ajax, name='buscar_entradas_ajax'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
=======
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]
>>>>>>> a36964bd04a4e4a5cff9b82c96b9b463ede2e774
