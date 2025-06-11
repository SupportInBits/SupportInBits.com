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
from allauth.account import views as allauth_views


urlpatterns = [
    path('', include('apps.page.urls')),
    path('cookies/', include('cookie_consent.urls')),
    path('accounts/', include('allauth.urls')),  # rutas de allauth
    path('accounts/password/reset/', allauth_views.password_reset, name='account_reset_password'),
    #path('accounts/password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    #path('accounts/password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    #path('accounts/reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    #path('accounts/reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('blog/', include('apps.blog.urls')),
    path('api/user/', include('apps.user.urls')),
    path('usuario/', include('apps.user.urls')),  # Unificar todas las URLs de usuario bajo /user/
    path('admin/', admin.site.urls),
    path('buscar/ajax/', buscar_entradas_ajax, name='buscar_entradas_ajax'),
]  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
