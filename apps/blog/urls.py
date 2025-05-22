from django.urls import path, include
from .views import DetalleEntrada, EntradasPorCategoria, EntradasPorSeccion, ListaEntradasView, EditarEntradaView, EliminarEntradaView
from apps.blog.views import  buscar_entradas_ajax, crear_entrada, crear_comentario, home_blog, ListaComentariosView, toggle_aprobacion_comentario, eliminar_comentario

urlpatterns = [
    path('', home_blog, name='home_blog'),
    # path('buscar/', buscar_entradas, name='buscar_entradas'),
    
    # comentarios admin
    path('entradas-admin/', ListaEntradasView.as_view(), name='lista_entradas_admin'),
    path('comentarios-admin/', ListaComentariosView.as_view(), name='lista_comentarios'),
    path('comentario/<int:pk>/toggle-aprobacion/', toggle_aprobacion_comentario, name='toggle_aprobacion_comentario'),
    path('comentario/<int:pk>/eliminar/', eliminar_comentario, name='eliminar_comentario'),
    # comentarios
    path('entrada-nueva/', crear_entrada, name='crear_entrada'),
    path('entradas/editar/<slug:slug>/', EditarEntradaView.as_view(), name='editar_entrada'),
    path('entradas/<slug:slug>/comentar/', crear_comentario, name='crear_comentario'),
    path('entradas/eliminar/<slug:slug>/', EliminarEntradaView.as_view(), name='eliminar_entrada'),
    path('entrada/<slug:slug>/', DetalleEntrada.as_view(), name='detalle_entrada'),
    path('<slug:slug_seccion>/<slug:slug_categoria>/', EntradasPorCategoria.as_view(), name='entradas_por_categoria'),
    path('<slug:slug_seccion>/', EntradasPorSeccion.as_view(), name='entradas_por_seccion'),
    path('tinymce/', include('tinymce.urls')),

]
