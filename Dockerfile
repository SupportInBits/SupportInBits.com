FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/apps

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libpq-dev gcc curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Crear carpetas necesarias
RUN mkdir -p /app/media /app/staticfiles && chmod -R 755 /app/media /app/staticfiles

# Copiar el proyecto
COPY . .

# Exponer puerto interno (usado por Gunicorn)
EXPOSE 8000

# Comando de inicio con Gunicorn
CMD ["bash", "-c", "python manage.py collectstatic --no-input && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3"]
