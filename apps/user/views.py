from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout, authenticate, login as auth_login
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.http import JsonResponse
from apps.blog.models import Comentario
from apps.blog.forms import ComentarioForm
from apps.page.models import Page
from apps.user.decorators import rol_requerido
from apps.user.forms import RegistroForm,  EditarPerfilForm
from apps.user.models import Usuario


"""
Verifica si el nombre de usuario proporcionado ya está registrado.
Si el nombre de usuario ya existe, devuelve un JSON con 'available': False.
Si el nombre de usuario no existe, devuelve 'available': True."""
def check_username(request):
    username = request.GET.get('username', '')
    exists = Usuario.objects.filter(username__iexact=username).exists()
    return JsonResponse({'available': not exists})

"""
Verifica si el email proporcionado ya está registrado.
Si el email ya existe, devuelve un JSON con 'available': False.
Si el email no existe, devuelve 'available': True.
"""
def check_email(request):
    email = request.GET.get('email', '')
    exists = Usuario.objects.filter(email__iexact=email).exists()
    return JsonResponse({'available': not exists})

"""
Comprueba que request method sea POST.
Si es POST, crea un nuevo usuario con los datos del formulario RegistroForm.
Si el formulario es válido, guarda el usuario e inicia sesión automáticamente.
Redirige dependiendo del rol del usuario:
- Superusuario: redirige a perfil_admin
- Moderador: redirige a tests
- Usuario registrado: redirige a perfil_registrado
Si no es POST, muestra el formulario de registro vacío.
"""
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
    
    # parámetro 'next' para redirección post-registro
    next_param = request.GET.get('next', '')
    
    return render(
        request,
        'user/registro.html', 
        context={
        'form': form,
        'next': next_param,
        'page': pagina,
    })

"""
Vista para inicio de sesión de los usuarios registrados.
Si es POST, valida el formulario de autenticación.
Si el formulario es válido, autentica al usuario y lo inicia sesión.
Si el usuario es autenticado, muestra un mensaje de bienvenida y redirige según su rol.
Si el formulario no es válido, muestra los errores.
Si no es POST, muestra el formulario de autenticación vacío.
"""
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
                
                # Redirección basada en el rol 
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

"""
Si el usuario es superusuario, redirige al perfil de administrador.
Si no es superusuario, obtiene los comentarios del usuario ordenadors por fecha descendente.
Muestra el perfil del usuario registrado con sus comentarios en la plantilla perfil_registrado.html.
"""
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

"""
Obtiene un comentario específico del usuario autenticado.
Si el método es POST, actualiza el comentario con los datos del formulario.
Si el formulario es válido, guarda los cambios y redirige al perfil registrado.
Si el método no es POST, muestra el formulario con los datos del comentario."""
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

"""
Elimina el perfil del usuario autenticado.
Si el método es POST, cierra la sesión del usuario, elimina su perfil y redirige al inicio.
Si el método no es POST, muestra una confirmación de eliminación."""
@login_required
def eliminar_perfil(request):
    if request.method == 'POST':
        usuario = request.user
        logout(request)
        usuario.delete()
        messages.success(request, "Tu perfil ha sido eliminado correctamente.")
        return redirect('inicio')
    return render(request, 'user/eliminar_perfil_confirmar.html')

"""
Comprueba si el usuario autenticado es superusuario.
Si es superusuario, devuelve la plantilla perfil_admin.html con los datos del usuario.
Si no es superusuario, lanza una excepción PermissionDenied.
"""
def perfil_admin(request):
    if not request.user.is_superuser:
        raise PermissionDenied
    pagina = Page.objects.get(id=10)
    usuario = request.user   

    return render(
            request,
            'user/perfil_admin.html', 
            context = {
            'page': pagina,
            'user': usuario,
            'is_admin' : True        
    })

"""
Verifica si el usuario autenticado es superusuario.
Devuelve un JSON con True o False según corresponda.
"""
@login_required
def check_superuser(request):
    return JsonResponse({
        'is_superuser': request.user.is_superuser
    })
    
"""
Ejecuta la función logout de Django, cierra la sesión del usuario actual.
Redirige al inicio. 
"""
@login_required
def logout_view(request):
    logout(request)
    messages.info(request, 'Has cerrado sesión correctamente.')
    return redirect('inicio')

"""
Obtiene el perfil del usuario autenticado
Rellena el formulario EditarPerfilForm con los datos del usuario obtenido
Si el formulario es válido, guarda los cambios y redirige al perfil registrado
Sino muestra el formulario con los datos del usuario
"""
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

"""
Obtiene todos los usuarios registrados, excluyendo al usuario actual
Obtiene la página con id 11 y la devuelve junto con los usuarios
Solo disponible para administradores
"""
@rol_requerido('administrador') 
def gestionar_usuarios(request):
    usuarios = Usuario.objects.all().exclude(id=request.user.id).order_by('username')
    pagina = Page.objects.get(id=11)  

    return render(request, 'user/gestionar_usuarios.html', {
        'usuarios': usuarios,
        'page': pagina
    })

"""
Importa el formular PageForm. Si el formulario es válido, guarda la nueva página.
Devuelve la plantilla crear_pagina.html con un formulario para crear una nueva página
Solo disponible para administradores
"""
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

""" 
Devuelve la plantilla gestionar_paginas.html con todas las páginas existentes
"""
@rol_requerido('administrador')  
def gestionar_paginas(request):
    paginas = Page.objects.all()
    return render(request, 'user/gestionar_paginas.html', {'paginas': paginas})

"""
Devuelve la plantilla editar_pagina.html con un formulario para editar una página
Solo disponible para administradores
"""
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
    return render(
            request, 
            'user/editar_pagina.html', {
                'form': form,
                'pagina': pagina
            }
        )

"""
Comprueba si el usuario existe, cambia su estado (activo/inactivo)
 y redirige a la lista de usuarios
"""
@require_POST
@rol_requerido('administrador')
def cambiar_estado_usuario(request, user_id):
    usuario = get_object_or_404(Usuario, id=user_id)
    usuario.is_active = not usuario.is_active
    usuario.save()
    messages.success(request, f"El estado del usuario {usuario.username} ha sido actualizado.")
    return redirect('gestionar_usuarios')

"""
Comprueba si el usuario existe, cambia su rol (registrado/moderador/administrador) 
y redirige a la lista de usuarios
"""
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

"""
Compueba si el usuario existe. Si existe lo elimina de la base de datos, sino lanza un error 404
"""
@require_POST
@rol_requerido('administrador')
def eliminar_usuario(request, user_id):
    usuario = get_object_or_404(Usuario, id=user_id)
    usuario.delete()
    messages.success(request, f"El usuario {usuario.username} ha sido eliminado.")
    return redirect('gestionar_usuarios')