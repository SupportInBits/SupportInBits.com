FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="${PYTHONPATH}:/app/apps"

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/media && chmod -R 755 /app/media

COPY . .

EXPOSE 8000

CMD ["bash", "-c", "python /app/manage.py makemigrations && python /app/manage.py migrate && python /app/manage.py load_initial_data && python /app/manage.py collectstatic --no-input && python /app/manage.py runserver 0.0.0.0:8000"]
