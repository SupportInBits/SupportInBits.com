from .base import *

DEBUG = False
ALLOWED_HOSTS = ["*"]

# Static files (S3)
STATIC_URL = 'https://<tu-distribucion-cloudfront>.cloudfront.net/static/'

STATICFILES_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

AWS_STORAGE_BUCKET_NAME = "<tu-bucket>"
AWS_S3_REGION_NAME = "eu-west-1"
AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
