"""supportinbits URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/

URL configuration for supportinbits project.

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
from django.urls import path, include
from apps.blog.views import buscar_entradas_ajax
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = [
    path('', include('apps.page.urls')),
    path('cookies/', include('cookie_consent.urls')),
    path('accounts/', include('allauth.urls')),  # rutas de allauth
    path('blog/', include('apps.blog.urls')),
    path('usuario/', include('apps.user.urls')),  # Unificar todas las URLs de usuario bajo /user/
    path('admin/', admin.site.urls),
    path('buscar/ajax/', buscar_entradas_ajax, name='buscar_entradas_ajax'),
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
