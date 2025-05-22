import os
from pathlib import Path
<<<<<<< HEAD
=======
from dotenv import load_dotenv

load_dotenv()
>>>>>>> a36964bd04a4e4a5cff9b82c96b9b463ede2e774

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dummy-secret-key")

DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
<<<<<<< HEAD
    'bootstrap5',
    'rest_framework',
    'cookie_consent',
    'allauth',
    'apps.blog',
    'apps.user',
    'apps.page'
=======
    'rest_framework',
    # tus apps
>>>>>>> a36964bd04a4e4a5cff9b82c96b9b463ede2e774
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'config.urls'

<<<<<<< HEAD
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
=======
TEMPLATES = [ ... ]
>>>>>>> a36964bd04a4e4a5cff9b82c96b9b463ede2e774

WSGI_APPLICATION = 'config.wsgi.application'

# Base de datos común a todos los entornos
DATABASES = {
    'default': {
<<<<<<< HEAD
        'ENGINE': os.getenv('DB_ENGINE'),
        'NAME': os.getenv("DB_NAME"),
        'USER': os.getenv("DB_USER"),
        'PASSWORD': os.getenv("DB_PASSWORD"),
        'HOST': os.getenv("DB_HOST"),
        'PORT': os.getenv("DB_PORT"),
    }
}
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

AUTH_USER_MODEL = 'user.Usuario'

=======
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv("POSTGRES_DB"),
        'USER': os.getenv("POSTGRES_USER"),
        'PASSWORD': os.getenv("POSTGRES_PASSWORD"),
        'HOST': os.getenv("POSTGRES_HOST", "db"),
        'PORT': os.getenv("POSTGRES_PORT", 5432),
    }
}

STATIC_URL = '/static/'
>>>>>>> a36964bd04a4e4a5cff9b82c96b9b463ede2e774
