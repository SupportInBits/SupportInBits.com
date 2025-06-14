// Configuración de velocidad
  let currentRate = 1;
  const minRate = 0.9;
  const maxRate = 3;

  /**
   * @description Actualiza el display de la velocidad de reproducción
   */
  function updateSpeedDisplay() {
    document.getElementById("speedValue").textContent =
      currentRate.toFixed(1) + "x";
    localStorage.setItem("speechRate", currentRate); // Guardar preferencia
  }

  // Cargar velocidad guardada
  if (localStorage.getItem("speechRate")) {
    currentRate = parseFloat(localStorage.getItem("speechRate"));
    updateSpeedDisplay();
  }

  /**
   * @description Lee un texto usando WebSpeechAPI
   * @param {*} texto = cadena que se va a leer
   */
  function leerTexto(texto) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance();
      utterance.text = texto;
      utterance.lang = "es-ES";
      utterance.rate = currentRate; // Usar velocidad actual

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Lo siento, tu navegador no soporta la función de lectura de voz.");
    }
  }

  // Eventos para controles de velocidad
  document
    .getElementById("increaseSpeed")
    .addEventListener("click", function () {
      if (currentRate < maxRate) {
        currentRate += 0.1;
        updateSpeedDisplay();
      }
    });

  document
    .getElementById("decreaseSpeed")
    .addEventListener("click", function () {
      if (currentRate > minRate) {
        currentRate -= 0.1;
        updateSpeedDisplay();
      }
    });
  
  /**
   * @description Extrae todos los elentos hijos del elemento incluyendo imágenes ingresado como parámetro
   * @param {*} element El elemnto del cual se va a extraer el texto
   * @returns = String con todo el texto obtenido
   */
  function extraerTextoOrdenado(element) {
    let texto = "";
    for (const node of element.childNodes) {
      // Si el nodo es texto lo añade a la variable texto
      if (node.nodeType === Node.TEXT_NODE) {
        texto += node.textContent.trim() + " ";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "IMG" && node.alt) {
          texto += node.alt + " ";
        } else {
          texto += extraerTextoOrdenado(node);
        }
      }
    }
    texto = texto.replace(/\s+/g, ' ');
    return texto ? texto + '.' : '';;
  }
  // Leer todo el menú
  document.getElementById("readAll").addEventListener("click", function () {
    const menu = document.getElementById("menu-Restaurante");
    const menuText = extraerTextoOrdenado(menu).replace(/\s+/g, " ").trim();
    console.log(menuText); // Para depuración
  leerTexto(menuText);
  });

  // Detener la lectura
  document.getElementById("stopReading").addEventListener("click", function () {
    window.speechSynthesis.cancel();
  });