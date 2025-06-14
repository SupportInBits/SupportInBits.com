from django.core.management.base import BaseCommand
from apps.blog.models import Seccion, Categoria
from apps.page.models import Page  # Importar el modelo Page

class Command(BaseCommand):
    help = 'Carga las secciones, categorías y páginas iniciales del blog'
    
    def handle(self, *args, **options):
        # Cargar secciones y categorías (existente)
        secciones_data = [
            {
                'nombre': 'Recursos',
                'categorias': ['Guías oficiales', 'Legislación y Normativas']
            },
            {
                'nombre': 'Accesibilidad',
                'categorias': ['Fundamentos', 'Diseño y Desarrollo','Novedades', 'Herramientas y Tests']
            }
        ]
        
        for seccion_info in secciones_data:
            seccion, created = Seccion.objects.get_or_create(nombre=seccion_info['nombre'])
            if created:
                self.stdout.write(self.style.SUCCESS(f'Sección creada: {seccion.nombre}'))
            
            for categoria_nombre in seccion_info['categorias']:
                categoria, created = Categoria.objects.get_or_create(
                    nombre=categoria_nombre,
                    seccion=seccion
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Categoría creada: {categoria.nombre} en {seccion.nombre}'))
        
        # Cargar páginas 
        pages_data = [
            {
                'titulo': 'Inicio - Support In Bits',
                'm_descri': 'Web desarrollada para fomentar la creación de aplicaciones web usables y accesibles',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'index'
            },
            {
                'titulo': 'Política de cookies - Support In Bits',
                'm_descri': 'Página web con toda la información relacionada sobre qué hacemos con sus datos en Support In Bits',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'noindex'
            },
            {
                'titulo': 'Quién soy - Support In Bits',
                'm_descri': 'En esta página web se describe al creador de la web',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'noindex'
            },
            {
                'titulo': 'Políticas de privacidad - Support In Bits',
                'm_descri': 'En esta página se muestra las políticas de privacidad de Support In Bits',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'noindex'
            },
            {
                'titulo': 'Preguntas frecuentes - Support In Bits',
                'm_descri': 'En esta página encontrarás las respuestas a tus preguntas de cómo desarrollar una web accesible',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'index'
            },
            {
                'titulo': 'Blog - Support In Bits',
                'm_descri': 'En esta página encontrarás todos las entradas publicadas de diversos temas sobre informática y accesibilidad',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'index'
            },
            {
                'titulo': 'Crear entrada - Support In Bits',
                'm_descri': 'En esta página puedes crear tu entrada y comprobar que cumple con los requisitos de accesibilidad',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'noindex'
            },
            {
                'titulo': 'Indentifícate - Support In Bits',
                'm_descri': 'En esta página podrás crear una cuenta o iniciar sesión si ya tienes una',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'noindex'
            },
            {
                'titulo': 'Crear cuenta - Support In Bits',
                'm_descri': 'En esta página podrás crear una cuenta y unirte a nuestra comunidad',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'noindex'
            },
            {
                'titulo': ' - Support In Bits',
                'm_descri': 'Web desarrollada para fomentar la creación de aplicaciones web usables y accesibles',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'noindex'
            },
            {
                'titulo': 'Error 403 - Support In Bits',
                'm_descri': 'Ha ocurrido un error 403. Ponte en contacto con el administrador',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'noindex'
            },{
                'titulo': 'Herramientas - Support In Bits',
                'm_descri': 'En esta página encontrarás herramientas y plantillas para ayudarte en el desarrollo de aplicaciones web accesibles',
                'm_handF': 'true',
                'm_mobileOp': 'width',
                'm_robots': 'index'
            }
        ]
        
        for page_data in pages_data:
            page, created = Page.objects.get_or_create(
                titulo=page_data['titulo'],
                defaults={
                    'm_descri': page_data['m_descri'],
                    'm_handF': page_data['m_handF'],
                    'm_mobileOp': page_data['m_mobileOp'],
                    'm_robots': page_data['m_robots']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Página creada: {page.titulo}'))
            else:
                self.stdout.write(self.style.WARNING(f'Página ya existente: {page.titulo}'))
        
        self.stdout.write(self.style.SUCCESS('Datos iniciales cargados correctamente'))