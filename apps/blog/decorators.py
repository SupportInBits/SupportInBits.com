from django.contrib.auth.decorators import user_passes_test
from django.core.exceptions import PermissionDenied

def rol_requerido(*roles):
    def check_roles(user):
        if not user.is_authenticated:
            return False
        if user.profile.rol in roles or user.is_superuser:
            return True
        raise PermissionDenied
    return user_passes_test(check_roles)