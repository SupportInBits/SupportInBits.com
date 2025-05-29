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

document.addEventListener("DOMContentLoaded", () => {
  // Configuración centralizada
  const config = {
    username: {
      minLength: 8,
      regex: /^[\w.@+-]{8,}$/,
      errorMessages: {
        required: "El nombre de usuario es requerido",
        invalid: "Mínimo 8 caracteres. Letras, dígitos y @/./+/-/_ solamente.",
        notAvailable: "Este nombre de usuario ya está en uso",
      },
    },
    email: {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessages: {
        required: "El correo electrónico es requerido",
        invalid: "Por favor ingresa un correo electrónico válido",
        notAvailable: "Este correo electrónico ya está registrado",
      },
    },
    password: {
      minLength: 8,
      errorMessages: {
        required: "La contraseña es requerida",
        tooShort: (length) =>
          `La contraseña debe tener al menos ${length} caracteres`,
        allNumeric: "La contraseña no puede ser enteramente numérica",
        similarUsername:
          "La contraseña no puede ser similar a tu nombre de usuario",
        mismatch: "Las contraseñas no coinciden",
        confirmation: "Por favor confirma tu contraseña",
      },
    },
    terms: {
      errorMessage: "Debes aceptar los términos y condiciones",
    },
    endpoints: {
      username: "/check-username/",
      email: "/check-email/",
    },
  };

  // Referencias a elementos del DOM
  const elements = {
    username: document.getElementById("id_username"),
    email: document.getElementById("id_email"),
    password1: document.getElementById("id_password1"),
    password2: document.getElementById("id_password2"),
    terms: document.getElementById("id_terms"),
    form: document.querySelector("form"),
  };

  // Inicialización de eventos
  function initEventListeners() {
    elements.username.addEventListener("input", validateUsername);
    elements.email.addEventListener("input", validateEmail);
    elements.password1.addEventListener("input", validatePassword1);
    elements.password2.addEventListener("input", validatePassword2);
    elements.terms.addEventListener("change", validateTerms);

    elements.username.addEventListener("blur", () =>
      checkAvailability("username")
    );
    elements.email.addEventListener("blur", () => checkAvailability("email"));

    elements.form.addEventListener("submit", handleSubmit);
  }

  // Manejador de envío de formulario
  function handleSubmit(e) {
    if (!validateForm()) {
      e.preventDefault();
    }
  }

  // Validación general del formulario
  function validateForm() {
    return [
      validateUsername(),
      validateEmail(),
      validatePassword1(),
      validatePassword2(),
      validateTerms(),
    ].every((valid) => valid);
  }

  // Validación de nombre de usuario
  function validateUsername() {
    const value = elements.username.value.trim();

    if (!value) {
      showError(elements.username, config.username.errorMessages.required);
      return false;
    }

    if (!config.username.regex.test(value)) {
      showError(elements.username, config.username.errorMessages.invalid);
      return false;
    }

    showSuccess(elements.username);
    return true;
  }

  // Validación de email
  function validateEmail() {
    const value = elements.email.value.trim();

    if (!value) {
      showError(elements.email, config.email.errorMessages.required);
      return false;
    }

    if (!config.email.regex.test(value)) {
      showError(elements.email, config.email.errorMessages.invalid);
      return false;
    }

    showSuccess(elements.email);
    return true;
  }

  // Validación de contraseña principal
  function validatePassword1() {
    const value = elements.password1.value;
    const usernameValue = elements.username.value.trim();

    if (!value) {
      showError(elements.password1, config.password.errorMessages.required);
      return false;
    }

    if (value.length < config.password.minLength) {
      showError(
        elements.password1,
        config.password.errorMessages.tooShort(config.password.minLength)
      );
      return false;
    }

    if (/^\d+$/.test(value)) {
      showError(elements.password1, config.password.errorMessages.allNumeric);
      return false;
    }

    if (
      usernameValue &&
      value.toLowerCase().includes(usernameValue.toLowerCase())
    ) {
      showError(
        elements.password1,
        config.password.errorMessages.similarUsername
      );
      return false;
    }

    showSuccess(elements.password1);
    if (elements.password2.value) validatePassword2();

    return true;
  }

  // Validación de confirmación de contraseña
  function validatePassword2() {
    const value = elements.password2.value;

    if (!value) {
      showError(elements.password2, config.password.errorMessages.confirmation);
      return false;
    }

    if (value !== elements.password1.value) {
      showError(elements.password2, config.password.errorMessages.mismatch);
      return false;
    }

    showSuccess(elements.password2);
    return true;
  }

  // Validación de términos y condiciones
  function validateTerms() {
    if (!elements.terms.checked) {
      showError(elements.terms, config.terms.errorMessage);
      return false;
    }

    showSuccess(elements.terms);
    return true;
  }

  // Verificación de disponibilidad (AJAX)
  function checkAvailability(field) {
    const inputElement = elements[field];
    const value = inputElement.value.trim();
    const endpoint = config.endpoints[field];

    if (!validateField(field)) return;

    // Construir URL con el parámetro correcto según el tipo de campo
    const urlParams = new URLSearchParams();
    if (field === "username") {
      urlParams.append("username", value);
    } else if (field === "email") {
      urlParams.append("email", value);
    }

    // Usar URL absoluta con prefijo /usuario/
    const url = `/usuario${endpoint}?${urlParams.toString()}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data.available) {
          showError(inputElement, config[field].errorMessages.notAvailable);
        } else {
          showSuccess(inputElement);
        }
      })
      .catch((error) => {
        console.error("Error en la verificación:", error);
        showError(inputElement, "Error al verificar disponibilidad");
      });
  }

  // Función auxiliar para validar campos específicos
  function validateField(field) {
    switch (field) {
      case "username":
        return validateUsername();
      case "email":
        return validateEmail();
      default:
        return false;
    }
  }

  // Mostrar mensaje de error
  function showError(input, message) {
    const formControl = input.closest(".form-floating, .form-check");
    if (!formControl) return;

    clearFeedback(input);

    input.classList.add("is-invalid");
    const errorElement = document.createElement("div");
    errorElement.className = "invalid-feedback";
    errorElement.textContent = message;
    formControl.appendChild(errorElement);
  }

  // Mostrar indicación de éxito
  function showSuccess(input) {
    const formControl = input.closest(".form-floating, .form-check");
    if (!formControl) return;

    clearFeedback(input);

    input.classList.add("is-valid");
    const successElement = document.createElement("div");
    successElement.className = "valid-feedback";
    successElement.textContent = "✓ Correcto";
    formControl.appendChild(successElement);
  }

  // Limpiar estados anteriores
  function clearFeedback(input) {
    const formControl = input.closest(".form-floating, .form-check");
    if (!formControl) return;

    input.classList.remove("is-invalid", "is-valid");

    const existingFeedback = formControl.querySelector(
      ".invalid-feedback, .valid-feedback"
    );
    if (existingFeedback) existingFeedback.remove();
  }

  // Inicializar la aplicación
  initEventListeners();
});
