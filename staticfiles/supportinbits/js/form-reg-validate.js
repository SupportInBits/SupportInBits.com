document.addEventListener("DOMContentLoaded", () => {
  // requisitos para validar el formulario
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

  /**
   * @description función que inicializa los eventos sobre los campos del formulario
   * y comprueba la disponibilidad del username y email
   */
  function initEventListeners() {
    // valida los campos
    elements.username.addEventListener("input", validateUsername);
    elements.email.addEventListener("input", validateEmail);
    elements.password1.addEventListener("input", validatePassword1);
    elements.password2.addEventListener("input", validatePassword2);
    elements.terms.addEventListener("change", validateTerms);
    // comprueba que el username existe
    elements.username.addEventListener("blur", () =>
      checkAvailability("username")
    );
    // comprueba que el correo existe
    elements.email.addEventListener("blur", () => 
      checkAvailability("email"));

    elements.form.addEventListener("submit", handleSubmit);
  }

  /**
   * @description maneja que el envío sea válido
   * @param {*} e evento submit
   */
  function handleSubmit(e) {
    if (!validateForm()) {
      e.preventDefault();
    }
  }

  /**
   * @description función que comprueba que todos los campos son válidos
   * @returns True si todos son válidos. False si no lo son
   */
  function validateForm() {
    return [
      validateUsername(),
      validateEmail(),
      validatePassword1(),
      validatePassword2(),
      validateTerms(),
    ].every((valid) => valid);
  }

  /**
   * @description Obtiene el valor del input username sin espacios al inico y al final
   * y comprueba que es válido
   * @returns
   * False en caso de que no exista el valor o no cumpla con la REGEX.
   * True en caso de que pase ambas validaciones
   */
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

  /**
   * @description Obtiene el valor del input email sin espacios en blanco
   * y comprueba que cumple el REFGEX
   * @returns
   * False en caso de que no exista el valor o no cumpla con la REGEX.
   * True en caso de que pase ambas validaciones
   */
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

  /**
   * @description Obtiene el valor del input password1 sin espacios en blanco
   * y comprueba que cumple el REFGEX
   * @returns
   * False en caso de que no exista el valor o no cumpla con la REGEX.
   * True en caso de que pase ambas validaciones
   */
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

  /**
   * @description Obtiene el valor del input password2 sin espacios en blanco
   * y comprueba que cumple el REFGEX
   * @returns
   * False en caso de que no exista el valor o no cumpla con la REGEX.
   * True en caso de que pase ambas validaciones
   */
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

  /**
   * @description Comprueba que el chechbox esté marcado.
   * Si está marcado llama a la función ShowSuccess.
   * Sino está marcado llama a la función ShowError
   * @returns
   * False en caso de que no esté marcado
   * True en caso de que pase ambas validaciones
   */
  function validateTerms() {
    if (!elements.terms.checked) {
      showError(elements.terms, config.terms.errorMessage);
      return false;
    }

    showSuccess(elements.terms);
    return true;
  }

  /**
   * @description Verifica la disponibilidad usando fetch
   * @param {*} field El campo del formulario a verificar
   * @returns 
   * Promesa en formato json
   */
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

  /**
   * @description función que valida expecificamente los campos username y email
   * @param {*} field 
   * @returns 
   * validateUsername() = para validar el campo username
   * validateEmail() = para validar el campo email
   */
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

  /**
   * @description Añade la clase .is-invalid al input en caso de error
   * @param {*} input = input al que se aplica la clase
   * @param {*} message = mensaje que se va a mostrar
   * @returns Sale de la función cuando no existe la clase
   */
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

  /**
   * @description Añade la clase .is-valid en caso de éxito
   * @param {*} input 
   * @returns 
   */
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

  /**
   * @description limpia las clases .is-valid y .is-invalid
   * @param {*} input 
   * @returns 
   */
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
