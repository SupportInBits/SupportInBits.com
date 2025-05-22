const toggleBtn = document.getElementById("toggle-mode");
const body = document.body;

// toggleBtn.addEventListener("click", () => {
//   body.classList.toggle("dark-mode");
// 
//   // Cambiar el texto del botón según el modo actual
//   if (body.classList.contains("dark-mode")) {
//     toggleBtn.innerHTML = '<i class="bi bi-sun-fill p-2"></i>';
//   } else {
//     toggleBtn.innerHTML = '<i class="bi bi-moon-fill p-2"></i>';
//   }
// });

// botón para ir arriba
const botonUp = document.getElementById("boton-up");

// Mostrar u ocultar el botón al hacer scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    botonUp.style.display = "block";
  } else {
    botonUp.style.display = "none";
  }
});

// Al hacer clic, subir al principio con animación
botonUp.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// validar formulario de registro
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const usernameInput = document.getElementById('id_username');
    const emailInput = document.getElementById('id_email');
    const password1Input = document.getElementById('id_password1');
    const password2Input = document.getElementById('id_password2');
    const termsCheckbox = document.getElementById('id_terms');
    const form = document.querySelector('form');
    
    // Expresiones regulares para validación
    const USERNAME_REGEX = /^[\w.@+-]{8,}$/; // Mínimo 8 caracteres, letras, dígitos y @/./+/-/_
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validación básica de email
    const PASSWORD_MIN_LENGTH = 8;
    
    // Validación en tiempo real
    usernameInput.addEventListener('input', validateUsername);
    emailInput.addEventListener('input', validateEmail);
    password1Input.addEventListener('input', validatePassword1);
    password2Input.addEventListener('input', validatePassword2);
    termsCheckbox.addEventListener('change', validateTerms);
    
    // Validación al perder foco (para campos que podrían necesitar verificación con el servidor)
    usernameInput.addEventListener('blur', checkUsernameAvailability);
    emailInput.addEventListener('blur', checkEmailAvailability);
    
    // Validación antes de enviar el formulario
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
    });
    
    // Funciones de validación
    function validateUsername() {
        const value = usernameInput.value.trim();
        const isValid = USERNAME_REGEX.test(value);
        
        if (value.length === 0) {
            showError(usernameInput, 'El nombre de usuario es requerido');
            return false;
        }
        
        if (!isValid) {
            showError(usernameInput, 'Mínimo 8 caracteres. Letras, dígitos y @/./+/-/_ solamente.');
            return false;
        }
        
        showSuccess(usernameInput);
        return true;
    }
    
    function validateEmail() {
        const value = emailInput.value.trim();
        const isValid = EMAIL_REGEX.test(value);
        
        if (value.length === 0) {
            showError(emailInput, 'El correo electrónico es requerido');
            return false;
        }
        
        if (!isValid) {
            showError(emailInput, 'Por favor ingresa un correo electrónico válido');
            return false;
        }
        
        showSuccess(emailInput);
        return true;
    }
    
    function validatePassword1() {
        const value = password1Input.value;
        
        if (value.length === 0) {
            showError(password1Input, 'La contraseña es requerida');
            return false;
        }
        
        if (value.length < PASSWORD_MIN_LENGTH) {
            showError(password1Input, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
            return false;
        }
        
        if (/^\d+$/.test(value)) {
            showError(password1Input, 'La contraseña no puede ser enteramente numérica');
            return false;
        }
        
        // Validar si es similar al username (si ya está ingresado)
        const usernameValue = usernameInput.value.trim();
        if (usernameValue && value.toLowerCase().includes(usernameValue.toLowerCase())) {
            showError(password1Input, 'La contraseña no puede ser similar a tu nombre de usuario');
            return false;
        }
        
        showSuccess(password1Input);
        
        // Si hay algo en password2, validar de nuevo la coincidencia
        if (password2Input.value) {
            validatePassword2();
        }
        
        return true;
    }
    
    function validatePassword2() {
        const value = password2Input.value;
        const password1Value = password1Input.value;
        
        if (value.length === 0) {
            showError(password2Input, 'Por favor confirma tu contraseña');
            return false;
        }
        
        if (value !== password1Value) {
            showError(password2Input, 'Las contraseñas no coinciden');
            return false;
        }
        
        showSuccess(password2Input);
        return true;
    }
    
    function validateTerms() {
        if (!termsCheckbox.checked) {
            showError(termsCheckbox, 'Debes aceptar los términos y condiciones');
            return false;
        }
        
        showSuccess(termsCheckbox);
        return true;
    }
    
    // Función para verificar disponibilidad del username (AJAX)
    function checkUsernameAvailability() {
        if (!validateUsername()) return;
        
        const username = usernameInput.value.trim();
        
        // Aquí harías una petición AJAX a tu backend Django
        fetch(`/check-username/?username=${encodeURIComponent(username)}`)
            .then(response => response.json())
            .then(data => {
                if (data.available) {
                    showSuccess(usernameInput);
                } else {
                    showError(usernameInput, 'Este nombre de usuario ya está en uso');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    // Función para verificar disponibilidad del email (AJAX)
    function checkEmailAvailability() {
        if (!validateEmail()) return;
        
        const email = emailInput.value.trim();
        
        // Aquí harías una petición AJAX a tu backend Django
        fetch(`/check-email/?email=${encodeURIComponent(email)}`)
            .then(response => response.json())
            .then(data => {
                if (data.available) {
                    showSuccess(emailInput);
                } else {
                    showError(emailInput, 'Este correo electrónico ya está registrado');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    
    // Función para validar todo el formulario
    function validateForm() {
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPassword1Valid = validatePassword1();
        const isPassword2Valid = validatePassword2();
        const isTermsValid = validateTerms();
        
        return isUsernameValid && isEmailValid && isPassword1Valid && isPassword2Valid && isTermsValid;
    }
    
    // Funciones auxiliares para mostrar errores/éxito
    function showError(input, message) {
        const formControl = input.closest('.form-floating, .form-check');
        if (!formControl) return;
        
        // Remover clases de éxito
        input.classList.remove('is-valid');
        formControl.querySelector('.valid-feedback')?.remove();
        
        // Agregar clases de error
        input.classList.add('is-invalid');
        
        // Mostrar mensaje de error
        let errorElement = formControl.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            formControl.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    function showSuccess(input) {
        const formControl = input.closest('.form-floating, .form-check');
        if (!formControl) return;
        
        // Remover clases de error
        input.classList.remove('is-invalid');
        formControl.querySelector('.invalid-feedback')?.remove();
        
        // Agregar clases de éxito
        input.classList.add('is-valid');
        
        // Mostrar mensaje de éxito (opcional)
        let successElement = formControl.querySelector('.valid-feedback');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'valid-feedback';
            formControl.appendChild(successElement);
        }
        successElement.textContent = '✓ Correcto';
    }
});