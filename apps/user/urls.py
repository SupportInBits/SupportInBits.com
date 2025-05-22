from django.urls import path
from apps.user.views import editar_comentario
from apps.user import views

urlpatterns = [
    path('', views.perfil_registrado, name='perfil_registrado'),
    # path('registrate/', views.registro, name='registro'),
    # path('login/', views.user_login, name='login'),
    # path('logout/', views.logout_view, name='logout'),
    # path('admin', views.perfil_admin, name='perfil_admin'),
    # path('admin/comentarios/', views.gestion_comentarios, name='gestion_comentarios'),
    path('registrate/', views.registro, name='registro'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('perfil/', views.perfil_registrado, name='perfil_registrado'),
    path('perfil/admin', views.perfil_admin, name='perfil_admin'),
    path('comentario/editar/<int:comentario_id>/', editar_comentario, name='editar_comentario'),
    path('lista/', views.lista_usuarios, name='lista-usuarios'),
    path('check-username/', views.check_username, name='check_username'),
    path('check-email/', views.check_email, name='check_email'),
    path('check-superuser/', views.check_superuser, name='check-superuser'),
]