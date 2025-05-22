FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
<<<<<<< HEAD
ENV PYTHONPATH="${PYTHONPATH}:/app/apps"
=======
>>>>>>> a36964bd04a4e4a5cff9b82c96b9b463ede2e774

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["bash", "-c", "python /app/manage.py migrate && python /app/manage.py runserver 0.0.0.0:8000"]
