from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout, authenticate, login as auth_login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.http import JsonResponse
from apps.blog.models import Entrada, Comentario, Seccion, Categoria
from apps.blog.forms import ComentarioForm
from apps.page.models import Page
from apps.user.decorators import rol_requerido
from apps.user.forms import RegistroForm, LoginForm, EditarPerfilForm
from apps.user.models import Usuario

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
            
            #if next_param:
            #    return redirect(next_param)

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
                elif user.rol == 'moderador':  
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
    if request.user.is_superuser:
        return redirect('perfil_admin')

    pagina = Page.objects.get(id=10)
    usuario = request.user     

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

@login_required
def eliminar_perfil(request):
    if request.method == 'POST':
        usuario = request.user
        logout(request)
        usuario.delete()
        messages.success(request, "Tu perfil ha sido eliminado correctamente.")
        return redirect('inicio')
    return render(request, 'user/eliminar_perfil_confirmar.html')

def perfil_admin(request):
    if not request.user.is_superuser:
        raise PermissionDenied
    pagina = Page.objects.get(id=10)
    usuario = request.user   
    # debug
    # print(f"Usuario es superuser?: {request.user.is_superuser}")
    # if not request.user.is_superuser:
    #     print(f"DEBUG - Usuario NO es superuser: {request.user}")  # Debug
    #     raise PermissionDenied
    # else:
    #     print(f"DEBUG - Usuario SÍ es superuser: {request.user}")  # Debug
    return render(
            request,
            'user/perfil_admin.html', 
            context = {
            'page': pagina,
            'user': usuario,
            'is_admin' : True        
    })

@login_required
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

@login_required
def editar_perfil(request):
    usuario = request.user
    if request.method == 'POST':
        form = EditarPerfilForm(request.POST, request.FILES, instance=usuario)
        if form.is_valid():
            form.save()
            messages.success(request, "Perfil actualizado correctamente.")
            return redirect('perfil_registrado')
    else:
        form = EditarPerfilForm(instance=usuario)
    return render(request, 'user/editar_perfil.html', {'form': form})

@rol_requerido('administrador')
def lista_usuarios(request):
    return render(
        request, 
        'user/lista_usuarios.html',
        context={
        'request': request  # Asegúrate de pasar el request al contexto 
    })

@rol_requerido('administrador') 
def gestionar_usuarios(request):
    usuarios = Usuario.objects.all().exclude(id=request.user.id).order_by('username')
    pagina = Page.objects.get(id=11)  

    return render(request, 'user/gestionar_usuarios.html', {
        'usuarios': usuarios,
        'page': pagina
    })

@rol_requerido('administrador')  
def crear_pagina(request):
    from apps.page.forms import PageForm
    if request.method == 'POST':
        form = PageForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('gestionar_paginas')
    else:
        form = PageForm()
    return render(request, 'user/crear_pagina.html', {'form': form})

@rol_requerido('administrador')  
def gestionar_paginas(request):
    paginas = Page.objects.all()
    return render(request, 'user/gestionar_paginas.html', {'paginas': paginas})

@rol_requerido('administrador')  
def editar_pagina(request, pagina_id):
    from apps.page.forms import PageForm
    pagina = get_object_or_404(Page, id=pagina_id)
    if request.method == 'POST':
        form = PageForm(request.POST, instance=pagina)
        if form.is_valid():
            form.save()
            return redirect('gestionar_paginas')
    else:
        form = PageForm(instance=pagina)
    return render(request, 'user/editar_pagina.html', {'form': form, 'pagina': pagina})

@require_POST
@rol_requerido('administrador')
def cambiar_estado_usuario(request, user_id):
    usuario = get_object_or_404(Usuario, id=user_id)
    usuario.is_active = not usuario.is_active
    usuario.save()
    messages.success(request, f"El estado del usuario {usuario.username} ha sido actualizado.")
    return redirect('gestionar_usuarios')

@require_POST
@rol_requerido('administrador')
def cambiar_rol_usuario(request, user_id):
    nuevo_rol = request.POST.get('rol')
    usuario = get_object_or_404(Usuario, id=user_id)
    if nuevo_rol in ['registrado', 'moderador', 'administrador']:
        usuario.rol = nuevo_rol
        usuario.save()
        messages.success(request, f"El rol de {usuario.username} ha sido cambiado a {nuevo_rol}.")
    else:
        messages.error(request, "Rol inválido.")
    return redirect('gestionar_usuarios')

@require_POST
@rol_requerido('administrador')
def eliminar_usuario(request, user_id):
    usuario = get_object_or_404(Usuario, id=user_id)
    usuario.delete()
    messages.success(request, f"El usuario {usuario.username} ha sido eliminado.")
    return redirect('gestionar_usuarios')