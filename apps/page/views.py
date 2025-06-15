from django.shortcuts import render, redirect
from django.http import JsonResponse
from apps.page.models import Page
from django.core.mail import send_mail
from django.conf import settings
from apps.page.forms import ContactoForm

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

def contacto_vista(request):
    success = False
    if request.method == 'POST':
        form = ContactoForm(request.POST)
        if form.is_valid():
            form.save()
            success = True
            return redirect('inicio')  # Asegúrate de tener esta URL configurada
    else:
        form = ContactoForm()
    return render(request, 'contacto.html', {'form': form, 'success': success})