from django.urls import resolve, Resolver404, reverse
from apps.blog.models import Entrada  # Ajusta el import según tu app

def breadcrumbs(request):
    breadcrumbs = [{'name': 'Inicio', 'url': '/'}]
    
    if request.path.startswith('/login') or request.path.startswith('/usuario/login') or request.path.startswith('/accounts/google/login'):
        breadcrumbs.append({'name': 'Login', 'url': None})
        return {'breadcrumbs': breadcrumbs, 'user': request.user}
    
    if request.path.startswith('/registrate') or request.path.startswith('/usuario/registrate'):
        breadcrumbs.append({'name': 'Registrate', 'url': None})
        return {'breadcrumbs': breadcrumbs, 'user': request.user}
    
    if request.path.startswith('/usuario') or request.path.startswith('/usuario/perfil'):
        breadcrumbs.append({'name': 'Perfil', 'url': None})
        return {'breadcrumbs': breadcrumbs, 'user': request.user}
    
    if request.path.startswith('/accounts/password/reset/done/') or request.path.startswith('/accounts/password/reset/'):
        breadcrumbs.append({'name': 'Restablecer Contraseña', 'url': None})
        return {'breadcrumbs': breadcrumbs, 'user': request.user}
    
    
    try:
        resolved = resolve(request.path_info)
        url_name = resolved.url_name
        path_parts = [p for p in request.path.split('/') if p]

        # Si estás viendo una entrada específica
        if url_name == 'detalle_entrada' and 'slug' in resolved.kwargs:
            entrada_slug = resolved.kwargs['slug']
            try:
                entrada = Entrada.objects.select_related('categoria__seccion').get(slug=entrada_slug)
                seccion = entrada.categoria.seccion
                if seccion:
                    breadcrumbs.append({
                        'name': 'Blog',
                        'url': reverse('home_blog')
                    })
                    breadcrumbs.append({
                        'name': seccion.nombre.title(),
                        'url': reverse('entradas_por_seccion', kwargs={'slug_seccion': seccion.slug})
                    })
                    breadcrumbs.append({
                        'name': entrada.categoria.nombre.title(),
                        'url': reverse('entradas_por_categoria', 
                        kwargs={
                            'slug_seccion': entrada.categoria.seccion.slug,
                            'slug_categoria': entrada.categoria.slug
                        })
                    })
                    breadcrumbs.append({
                        'name': entrada.titulo,
                        'url': None
                    })
                    return {'breadcrumbs': breadcrumbs, 'user': request.user}
            except Entrada.DoesNotExist:
                pass

        # Ignorar ciertas rutas (como /usuario/)
        ignore_paths = ['/usuario/','accounts/']  # Añade aquí las rutas que quieres ignorar
        if not any(part in ignore_paths for part in path_parts):
            current_url = ''
            for i, part in enumerate(path_parts):
                current_url += f'/{part}'
                breadcrumbs.append({
                    'name': part.replace('-', ' ').title(),
                    'url': current_url if i < len(path_parts)-1 else None
                })

    except Resolver404:
        pass

    return {'breadcrumbs': breadcrumbs, 'user': request.user}