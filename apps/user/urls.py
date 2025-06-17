from django.urls import path
from apps.user.views import editar_comentario
from apps.user import views
urlpatterns = [
    path('', views.perfil_registrado, name='perfil_registrado'),
    path('registrate/', views.registro, name='registro'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('perfil/', views.perfil_registrado, name='perfil_registrado'),
    path('perfil/editar/', views.editar_perfil, name='editar_perfil'),
    path('perfil/eliminar/', views.eliminar_perfil, name='eliminar_perfil'),
    path('comentario/editar/<int:comentario_id>/', editar_comentario, name='editar_comentario'),
    path('check-username/', views.check_username, name='check_username'),
    path('check-email/', views.check_email, name='check_email'),
    path('check-superuser/', views.check_superuser, name='check-superuser'),
    path('admin/', views.perfil_admin, name='perfil_admin'),
    path('admin/paginas/', views.gestionar_paginas, name='gestionar_paginas'),
    path('admin/paginas/crear/', views.crear_pagina, name='crear_pagina'),
    path('admin/paginas/<int:pagina_id>/editar/', views.editar_pagina, name='editar_pagina'),
    path('admin/usuarios/', views.gestionar_usuarios, name='gestionar_usuarios'),
    path('admin/usuarios/<int:user_id>/cambiar-estado/', views.cambiar_estado_usuario, name='cambiar_estado_usuario'),
    path('admin/usuarios/<int:user_id>/cambiar-rol/', views.cambiar_rol_usuario, name='cambiar_rol_usuario'),
    path('admin/usuarios/<int:user_id>/eliminar/', views.eliminar_usuario, name='eliminar_usuario'),
    
]