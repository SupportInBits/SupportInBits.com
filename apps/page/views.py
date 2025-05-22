from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login
from django.http import JsonResponse, HttpResponseForbidden
from apps.page.models import Page
from apps.user.forms import RegistroForm
from django.core.exceptions import PermissionDenied

def home(request):
    pagina = Page.objects.get(id=1)
    return render(
        request,
        'home.html',
        context={'page': pagina}  # Enviar la lista de objetos a la plantilla
    )
def cookies(request):
    pagina = Page.objects.get(id=2)
    return render(
        request,
        'cookies.html',
        context={'page': pagina}
    )
def about(request):
    pagina = Page.objects.get(id=3) 
    return render(
        request,
        'about.html',
        context={'page': pagina}
    )
def politicas(request):
    pagina = Page.objects.get(id=4)
    return render(
        request,
        'politicas_privacidad.html',
        context={'page': pagina}
    )

def faq(request): 
    pagina = Page.objects.get(id=5)
    return render(
        request,
        'faq.html',
        context={'page': pagina}
    )

def acceso_denegado(request,exception=None):
    pagina = Page.objects.get(id=11)

    return render(
        request, 
        'templates/403.html', 
        status=403,
        context={'page': pagina}
    )

def csrf_failure(request,exception=None):
    return HttpResponseForbidden


def plantillas(request):
    return render(
        request,
        'plantillas.html',
    )


def test(request):
    return render(
        request,
        'test.html',
    )

def getAllPages(request):
    paginas = Page.objects.all().values('id','titulo','m_descri','m_robots','m_handF','m_mobileOp')
    return JsonResponse(list(paginas), safe=False,  content_type="application/json")