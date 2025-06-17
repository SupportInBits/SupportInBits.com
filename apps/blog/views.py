from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, UpdateView, DeleteView
from django.db.models import Q, Count
from django.contrib import messages
from django.template.loader import render_to_string
from apps.page.models import Page
from apps.user.decorators import rol_requerido
from apps.blog.models import Entrada, Seccion, Categoria, Comentario
from apps.blog.forms import EntradaForm, ComentarioForm
from django.http import JsonResponse

"""
Lista de comentarios del usuario autenticado.
Solo usuarios con rol 'registrado' pueden acceder.
Muestra los comentarios del usuario, con conteos por estado.
"""
@method_decorator(rol_requerido('registrado'), name='dispatch')
class MisComentariosView(ListView):
    model = Comentario
    template_name = 'blog/mis_comentarios.html'
    context_object_name = 'comentarios'
    paginate_by = 10

    def get_queryset(self):
        
        return Comentario.objects.filter(
            autor=self.request.user
        ).order_by('-fecha_creacion')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Agregar conteo de comentarios por estado
        context['total_comentarios'] = self.get_queryset().count()
        context['comentarios_aprobados'] = self.get_queryset().filter(aprobado=True).count()
        context['comentarios_pendientes'] = self.get_queryset().filter(aprobado=False).count()
        return context

"""
Vista para crear una nueva entrada de blog.
Solo accesible para usuarios con rol 'administrador'.
Muestra y procesa el formulario de creación.
"""
@rol_requerido('administrador')
def crear_entrada(request):
    if request.method == 'POST':

        form = EntradaForm(request.POST, request.FILES)
        if form.is_valid():
            entrada = form.save()
            messages.success(request, f'Entrada "{entrada.titulo}" creada exitosamente!')
            return redirect(entrada.get_absolute_url())
    else:

        form = EntradaForm()
    
    return render(request, 'blog/crear_entrada.html', {'form': form})

"""
Vista para crear un comentario en una entrada.
Solo accesible para usuarios autenticados.
Si el usuario es moderador o admin, el comentario se aprueba automáticamente.
"""
@login_required
@require_POST
def crear_comentario(request, slug):
    entrada = get_object_or_404(Entrada, slug=slug)
    form = ComentarioForm(request.POST)
    
    if form.is_valid():
        comentario = form.save(commit=False)
        comentario.entrada = entrada
        comentario.autor = request.user
        
        # Si es moderador o admin, aprobar automáticamente
        if request.user.is_superuser or request.user.rol == 'moderador':
            comentario.aprobado = True
        
        comentario.save()
        messages.success(request, '¡Comentario enviado!')
    else:
        messages.error(request, 'Error al enviar el comentario')
    
    return redirect('detalle_entrada', slug=entrada.slug)

"""
Vista de lista de entradas para administración.
Solo accesible para usuarios con rol 'administrador'.
Permite buscar y paginar entradas.
"""
@method_decorator(rol_requerido('administrador'), name='dispatch')
class ListaEntradasView(ListView):
    model = Entrada
    template_name = 'blog/lista_entradas_admin.html'
    context_object_name = 'entradas'
    paginate_by = 10  # Opcional para paginación del lado del servidor

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '').strip()
        
        if search_query:
            queryset = queryset.filter(
                Q(titulo__icontains=search_query) |
                Q(contenido__icontains=search_query) |
                Q(resumen__icontains=search_query) |
                Q(categoria__nombre__icontains=search_query)
            ).distinct()
        
        return queryset.order_by('-fecha_publicacion')

"""
Vista para eliminar una entrada.
Solo accesible para administradores.
Solo el autor o el superusuario pueden eliminar.
"""
@method_decorator(rol_requerido('administrador'), name='dispatch')
class EliminarEntradaView(DeleteView):
    model = Entrada
    template_name = 'blog/confirmar_eliminar_entrada.html'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    success_url = reverse_lazy('lista_entradas_admin')
    roles_requeridos = ['administrador']

    def delete(self, request, *args, **kwargs):
        entrada = self.get_object()
        messages.success(request, f'Entrada "{entrada.titulo}" eliminada correctamente')
        return super().delete(request, *args, **kwargs)

    def dispatch(self, request, *args, **kwargs):
        entrada = self.get_object()
        if not (request.user == entrada.autor or request.user.is_superuser):
            messages.error(request, "No tienes permiso para eliminar esta entrada")
            return redirect(entrada.get_absolute_url())
        return super().dispatch(request, *args, **kwargs)
         
"""
Vista para editar una entrada.
Solo accesible para administradores o editores.
"""
@method_decorator(rol_requerido('administrador'), name='dispatch')
class EditarEntradaView(UpdateView):
    model = Entrada
    form_class = EntradaForm
    template_name = 'blog/editar_entrada.html'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    success_url = reverse_lazy('lista_entradas_admin')
    roles_requeridos = ['administrador', 'editor']  # Requiere rol admin o editor

    def form_valid(self, form):
        messages.success(self.request, f'Entrada "{form.instance.titulo}" actualizada correctamente')
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page'] = Page.objects.get(id=6)  # Ajusta el ID según tu configuración
        return context
    
"""
Vista de lista de comentarios para administración.
Permite filtrar por búsqueda y estado de aprobación.
Solo accesible para administradores.
"""
@method_decorator(rol_requerido('administrador'), name='dispatch') 
class ListaComentariosView(ListView):
    model = Comentario
    template_name = 'blog/lista_comentarios_admin.html'
    context_object_name = 'comentarios'
    paginate_by = 20

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '').strip()
        filtro_aprobacion = self.request.GET.get('aprobacion', '').strip()
        
        # Filtro por búsqueda
        if search_query:
            queryset = queryset.filter(
                Q(contenido__icontains=search_query) |
                Q(autor__username__icontains=search_query) |
                Q(entrada__titulo__icontains=search_query)
            ).distinct()
        
        # Filtro por estado de aprobación
        if filtro_aprobacion.lower() == 'aprobados':
            queryset = queryset.filter(aprobado=True)
        elif filtro_aprobacion.lower() == 'pendientes':
            queryset = queryset.filter(aprobado=False)
        
        return queryset.order_by('-fecha_creacion')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Agregamos el filtro actual al contexto para usarlo en la plantilla
        context['filtro_aprobacion'] = self.request.GET.get('aprobacion', '')
        return context    

"""
Vista para alternar la aprobación de un comentario.
Solo accesible para administradores.
"""
rol_requerido('administrador')
def toggle_aprobacion_comentario(request, pk):
    comentario = get_object_or_404(Comentario, pk=pk)
    comentario.aprobado = not comentario.aprobado
    comentario.save()
    
    messages.success(request, f'Comentario {"aprobado" if comentario.aprobado else "desaprobado"} correctamente.')
    return redirect('lista_comentarios')

"""
Vista para eliminar un comentario.
Solo accesible para administradores.
Muestra confirmación si es GET, elimina si es POST.
"""
rol_requerido('administrador')
def eliminar_comentario(request, pk):
    comentario = get_object_or_404(Comentario, pk=pk)
    
    if request.method == 'POST':
        comentario.delete()
        messages.success(request, 'Comentario eliminado correctamente.')
        return redirect('lista_comentarios')
    
    # Si es GET, mostrar confirmación (esto se manejaría con una plantilla modal)
    return redirect('lista_comentarios')

"""
Vista principal del blog.
Muestra todas las entradas publicadas y las secciones para el sidebar.
"""
def home_blog(request):
    pagina = Page.objects.get(id=6)
    
    entradas = Entrada.objects.filter(publicado=True).order_by('-fecha_publicacion')
    
    secciones = Seccion.objects.prefetch_related('categorias').all()
    
    return render(
        request,
        'blog/home_blog.html', 
        context={
            'page': pagina,
            'entradas': entradas,
            'secciones': secciones
        }
    )

"""
Vista AJAX para buscar entradas por título o contenido.
Devuelve HTML renderizado con los resultados.
"""
def buscar_entradas_ajax(request):
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        consulta = request.GET.get('q', '')
        # filtra por titulo y entrada
        resultados = Entrada.objects.filter(
            Q(titulo__icontains=consulta) |
            Q(contenido__icontains=consulta),
            publicado=True
        )
        html = render_to_string('blog/resultados_ajax.html',{
            'resultados': resultados,
            'consulta': consulta
        })

        return JsonResponse({'html': html})
    
    return JsonResponse({'error': 'Peticion no valida'}, status=400)

"""
Vista de entradas filtradas por categoría y sección.
"""
class EntradasPorCategoria(ListView):
    model = Entrada
    template_name = 'blog/entradas_por_categoria.html'
    context_object_name = 'entradas'

    def get_queryset(self):
        slug_seccion = self.kwargs['slug_seccion']
        slug_categoria = self.kwargs['slug_categoria']
        return Entrada.objects.filter(
            categoria__slug=slug_categoria,
            categoria__seccion__slug=slug_seccion,
            publicado=True
        )

"""
Vista de entradas filtradas por sección.
Incluye paginación y conteo de entradas por categoría.
"""
class EntradasPorSeccion(ListView):
    template_name = 'blog/entradas_por_seccion.html'
    context_object_name = 'entradas'
    paginate_by = 10
    
    def get_queryset(self):
        self.seccion = get_object_or_404(Seccion, slug=self.kwargs['slug_seccion'])
        categorias = self.seccion.categorias.all()
        return Entrada.objects.filter(
            categoria__in=categorias, 
            publicado=True
        ).select_related('categoria', 'autor').order_by('-fecha_publicacion')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['seccion'] = self.seccion
        # Categorías de la sección con conteo de entradas publicadas
        context['categorias'] = self.seccion.categorias.annotate(
            num_entradas=Count(  # Usa Count directamente (sin models.)
                'entradas',
                filter=Q(entradas__publicado=True)  # Usa Q directamente
            )
        )
        return context

"""
Vista de detalle de una entrada.
Muestra la entrada, comentarios aprobados y formulario para comentar.
Si el usuario es staff, muestra también comentarios pendientes.
"""
class DetalleEntrada(DetailView):
    model = Entrada
    template_name = 'blog/detalle_entrada.html'
    context_object_name = 'entrada'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
                
        context['page'] = Page.objects.get(id=6)
        context['page'].titulo = self.object.meta_titulo
        context['page'].m_descri = self.object.meta_descripcion
        context['page'].m_robots = self.object.meta_robots
                
        comentarios_aprobados = self.object.comentarios.filter(aprobado=True)
        context['total_comentarios_aprobados'] = comentarios_aprobados.count()
        # muestra los comentarios del usuario autenticado si los tienes aprobados
        if self.request.user.is_authenticated:
            mis_comentarios = self.object.comentarios.filter(autor=self.request.user, aprobado=True)
            comentarios = comentarios_aprobados | mis_comentarios
        else: # sino muestra solo los aprobados
            comentarios = comentarios_aprobados
        # si es usuario administrador muestra los pendientes
        if self.request.user.is_staff:
            comentarios_no_aprobados = self.object.comentarios.filter(aprobado=False)
            context['comentarios_pendientes'] = comentarios_no_aprobados.order_by('fecha_creacion')

        context['comentarios'] = comentarios.order_by('fecha_creacion')
        context['form_comentario'] = ComentarioForm()
                
        for comentario in context['comentarios']:
            comentario.current_user = self.request.user
        
        return context