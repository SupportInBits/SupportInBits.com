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
        context={'page': pagina}  
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

def plantillas(request):
    pagina = Page.objects.get(id=12)
    return render(
        request,
        'plantillas.html',
        context={'page': pagina}
    )

def test(request):
    return render(
        request,
        'test.html',
    )

def getAllPages(request):
    paginas = Page.objects.all().values('id','titulo','m_descri','m_robots','m_handF','m_mobileOp')
    return JsonResponse(list(paginas), safe=False,  content_type="application/json")