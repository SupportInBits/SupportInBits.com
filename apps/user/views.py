from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, logout
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.http import JsonResponse
from apps.blog.models import Entrada, Comentario, Seccion, Categoria
from apps.blog.forms import ComentarioForm
from apps.page.models import Page
from apps.user.decorators import rol_requerido
from apps.user.forms import RegistroForm, LoginForm
from apps.user.models import Usuario
# from .api.serializers import UsuarioSerializer
# from rest_framework.decorators import action
# from rest_framework import viewsets


def check_username(request):
    username = request.GET.get('username', '')
    exists = Usuario.objects.filter(username__iexact=username).exists()
    return JsonResponse({'available': not exists})

def check_email(request):
    email = request.GET.get('email', '')
    exists = Usuario.objects.filter(email__iexact=email).exists()
    return JsonResponse({'available': not exists})


# Vista de registro
def registro(request):
    pagina = Page.objects.get(id=9)
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Iniciar sesión automáticamente después del registro
            auth_login(request,user)
            
            # Redirección basada en el rol
            if user.is_superuser:
                return redirect('perfil_admin')
            elif user.rol == 'moderador':
                return redirect('tests')
            else:
                return redirect('perfil_registrado')
    else:
        form = RegistroForm()
    
    # Manejar el parámetro 'next' para redirección post-registro
    next_param = request.GET.get('next', '')
    
    return render(
        request,
        'user/registro.html', 
        context={
        'form': form,
        'next': next_param,
        'page': pagina,
    })



def user_login(request):
    pagina = Page.objects.get(id=8)
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                auth_login(request, user)
                messages.success(request, f'¡Bienvenido {username}!')
                
                # Redirección basada en el rol (corregí "moderador" a "moderador")
                next_url = request.GET.get('next', None)
                if next_url:
                    return redirect(next_url)
                elif user.is_superuser:
                    return redirect('perfil_admin')
                elif user.rol == 'moderador':  # Corregido el typo aquí
                    return redirect('tests')
                else:
                    return redirect('perfil_registrado')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"Error en {field}: {error}")
    else:
        form = AuthenticationForm()
    
    return render(request, 'user/login.html', {
        'form': form,
        'page': pagina,
    })

@login_required
def perfil_registrado(request):
    pagina = Page.objects.get(id=10)

    usuario = request.user     
    
    if request.user.is_superuser:
        raise PermissionDenied

    # Obtener comentarios del usuario, ordenados por fecha descendente
    comentarios = Comentario.objects.filter(
        autor=usuario
    ).select_related('entrada').order_by('-fecha_creacion')
    
    context = {
        'user': usuario,
        'comentarios': comentarios,
        'page': pagina,
        'total_comentarios': comentarios.count()
    }
    # debug
    # print(f"Usuario es superuser?: {request.user.is_superuser}")

    return render(
        request, 
        'user/perfil_registrado.html', 
        context
    )

@login_required
def editar_comentario(request, comentario_id):
    comentario = get_object_or_404(Comentario, id=comentario_id, autor=request.user)
    
    if request.method == 'POST':
        form = ComentarioForm(request.POST, instance=comentario)
        if form.is_valid():
            form.save()
            return redirect('perfil_registrado')
    else:
        form = ComentarioForm(instance=comentario)
    
    return render(request, 'user/editar_comentario.html', {'form': form, 'comentario': comentario})

def perfil_admin(request):
    if not request.user.is_superuser:
        raise PermissionDenied
    pagina = Page.objects.get(id=10)
    usuario = request.user   
    # debug
    # print(f"Usuario es superuser?: {request.user.is_superuser}")
    if not request.user.is_superuser:
        print(f"DEBUG - Usuario NO es superuser: {request.user}")  # Debug
        raise PermissionDenied
    else:
        print(f"DEBUG - Usuario SÍ es superuser: {request.user}")  # Debug
    return render(
            request,
            'user/perfil_admin.html', 
            context = {
            'page': pagina,
            'user': usuario,
            'is_admin' : True        
    })
def check_superuser(request):
    return JsonResponse({
        'is_superuser': request.user.is_superuser
    })
    
# Vista de logout
@login_required
def logout_view(request):
    logout(request)
    messages.info(request, 'Has cerrado sesión correctamente.')
    return redirect('inicio')


# Vista para gestionar comentarios (solo moderadores/admins)
@login_required
def gestion_comentarios(request):
    if not request.user.es_moderador:
        return redirect('home')
    
    comentarios = Comentario.objects.all().order_by('-fecha_creacion')
    if not request.user.es_administrador:
        comentarios = comentarios.filter(entrada__autor=request.user)
    
    return render(request, 'blog/gestion_comentarios.html', {
        'comentarios': comentarios
    })

# Vista para aprobar/rechazar comentarios
@login_required
def moderar_comentario(request, pk, accion):
    if not request.user.es_moderador:
        return redirect('home')
    
    comentario = get_object_or_404(Comentario, pk=pk)
    
    if accion == 'aprobar':
        comentario.aprobado = True
        comentario.save()
        messages.success(request, 'Comentario aprobado.')
    elif accion == 'rechazar':
        comentario.delete()
        messages.success(request, 'Comentario eliminado.')
    
    return redirect('gestion_comentarios')

def is_superuser(user):
    return user.is_superuser or (hasattr(user, 'rol') and user.rol == 'administrador')

@rol_requerido('administrador')
def lista_usuarios(request):
    return render(
        request, 
        'user/lista_usuarios.html',
        context={
        'request': request  # Asegúrate de pasar el request al contexto 
    })
