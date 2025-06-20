document.addEventListener("DOMContentLoaded", function () {
  // --- obtener los elementos necesarios ---
  const accBtn = document.getElementById("accessibility-btn");
  const accPanel = document.getElementById("accessibility-panel");
  const highContrast = document.getElementById("high-contrast");
  const resetContrast = document.getElementById("reset-contrast");
  const toggleSpacing = document.getElementById("toggle-spacing");
  const MAX_SPACING_LEVEL = 3;

  
  // --- evento click sobre el botón de acceesibilidad ---
  accBtn?.addEventListener("click", () => {
    if (accPanel) {
      accPanel.classList.toggle("hidden");
    }
    if (!accPanel.classList.contains("hidden")) {
      // Espera un "tick" para que el panel se muestre y tenga ancho real
      setTimeout(() => {
        const btnRect = accBtn.getBoundingClientRect();
        accPanel.style.top = `${btnRect.top + window.scrollY}px`;
        accPanel.style.left = `${
          btnRect.left + window.scrollX - accPanel.offsetWidth
        }px`;
        accPanel.style.position = "absolute";
      }, 0);
    }
  });

  // --- eventos de alto contraste y reiniciar contraste ---
  highContrast?.addEventListener("click", () => setHighContrast(true));
  resetContrast?.addEventListener("click", () => setHighContrast(false));
  
  /**
   * @description Función que aplica o reinicia el contraste
   * @param {*} enable 
   */
  function setHighContrast(enable) {
    document.body.classList.toggle("high-contrast", enable);
    if (enable) {
      localStorage.setItem("highContrast", "true");
    } else {
      localStorage.removeItem("highContrast");
    }
  }

  // --- evento sobre el botón de espaciado ---
  toggleSpacing?.addEventListener("click", () => {
    let currentLevel = parseInt(localStorage.getItem("spacingLevel")) || 0;
    let nextLevel = (currentLevel + 1) % (MAX_SPACING_LEVEL + 1);
    applySpacingLevel(nextLevel);
  });

  /**
   * @description Función que aplica el nivel de espaciado
   * @param {*} level 
   */
  function applySpacingLevel(level) {
    for (let i = 1; i <= MAX_SPACING_LEVEL; i++) {
      document.body.classList.remove(`accessible-spacing-${i}`);
    }
    if (level > 0) {
      document.body.classList.add(`accessible-spacing-${level}`);
      localStorage.setItem("spacingLevel", level);
    } else {
      localStorage.removeItem("spacingLevel");
    }
    updateSpacingButtonText(level);
  }

  /**
   * @description Función que actualiza el texto del botón de espaciado
   * @param {*} level 
   */
  function updateSpacingButtonText(level) {
    if (toggleSpacing) toggleSpacing.textContent = `Espaciado (${level})`;
  }

  /**
   * @description función que carga las preferencias del usuario
   * y las almacena en localstorage
   */
  function loadPreferences() {
    setHighContrast(localStorage.getItem("highContrast") === "true");
    const savedSpacing = parseInt(localStorage.getItem("spacingLevel")) || 0;
    applySpacingLevel(savedSpacing);
  }
  loadPreferences();

  // --- clases que se aplican para el tamaño de fuente ---
  const fontSizes = ["font-size-small", "font-size-medium", "font-size-large"];
  let currentSizeIndex = 0;

  /**
   * función que aplica una clase con un tamaño de fuente definido
   * a los difentes contenedores
   * @param {*} className font-size-small font-size-medium font-size-large
   * @returns 
   */
  function applyFontSize(className) {
    const contenido = document.getElementById("contenido");
    const nav = document.getElementById("navegador");
    const header = document.querySelector("header");
    const html = document.documentElement;
    const formBusqueda = document.getElementById("form-busqueda");
    const accorSecciones = document.getElementById("acco-secciones");
    const resultadosBusqueda = document.getElementById("resultados-busqueda");
    const searchContainer = document.querySelector(".search-container");
    const userDropdownBtns = document.querySelectorAll(".dropdown-toggle");
    const botones = document.querySelectorAll(".btn");
    const userDropdownBtnsitem = document.querySelectorAll(".dropdown-item");
    if (!contenido) return;
    fontSizes.forEach((cls) => {
      document.body.classList.remove(cls);
      contenido.classList.remove(cls);
      nav?.classList.remove(cls);
      header?.classList.remove(cls);
      html.classList.remove(cls);
      formBusqueda?.classList.remove(cls);
      accorSecciones?.classList.remove(cls);
      resultadosBusqueda?.classList.remove(cls);
      searchContainer?.classList.remove(cls);
      userDropdownBtns.forEach((b) => b.classList.remove(cls));
      botones.forEach((b) => b.classList.remove(cls));
      userDropdownBtnsitem.forEach((b) => b.classList.remove(cls));
    });
    document.body.classList.add(className);
    contenido.classList.add(className);
    nav?.classList.add(className);
    formBusqueda?.classList.add(className);
    accorSecciones?.classList.add(className);
    resultadosBusqueda?.classList.add(className);
    searchContainer?.classList.add(className);
    header?.classList.add(className);
    userDropdownBtns.forEach((b) => b.classList.add(className));
    userDropdownBtnsitem.forEach((b) => b.classList.add(className));
    botones.forEach((b) => b.classList.add(className));
    localStorage.setItem("fontSizeClass", className);
  }

  /**
   * @description función que aplica el tamaño y comprueba que está dentro los limites válidos
   * @param {*} direction entero +1 o -1
   */
  function changeFontSize(direction) {
    currentSizeIndex += direction;
    currentSizeIndex = Math.max(
      0,
      Math.min(currentSizeIndex, fontSizes.length - 1)
    );
    applyFontSize(fontSizes[currentSizeIndex]);
  }

  /**
   * @description función para reiniciar el tamaño de letra
   */
  function resetFontSize() {
    currentSizeIndex = 0;
    applyFontSize(fontSizes[currentSizeIndex]);
  }

  /**
   * @description comprueba si se ha guardado un tamaño de fuente y lo aplica
   */
  (function initFontSize() {
    const savedClass = localStorage.getItem("fontSizeClass");
    if (savedClass && fontSizes.includes(savedClass)) {
      currentSizeIndex = fontSizes.indexOf(savedClass);
      applyFontSize(savedClass);
    } else {
      applyFontSize(fontSizes[currentSizeIndex]);
    }
  })();

  // --- variables para la lupa ---
  const lupa = document.getElementById("lupa");
  const lupaContent = document.getElementById("lupa-content");
  let lupaActiva = false;
  const zoomLevel = 1.01;
  let lastTimestamp = 0;
  const updateInterval = 16;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // listener para mousemove
  document.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    },
    { passive: true }
  );

  function fastClone(element) {
    const clone = element.cloneNode(false);
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (
          ["SCRIPT", "STYLE", "LINK"].includes(child.tagName) ||
          child.id === "lupa"||
          child.id === "accessibility-panel"
        )
          return;
        clone.appendChild(fastClone(child));
      } else if (child.nodeType === Node.TEXT_NODE) {
        clone.appendChild(child.cloneNode());
      }
    });
    return clone;
  }

  function updateLupa(timestamp) {
    if (!lupaActiva) return;
    if (timestamp - lastTimestamp < updateInterval) {
      requestAnimationFrame(updateLupa);
      return;
    }
    lastTimestamp = timestamp;

    // Tamaño total de la página
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const pageWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth
    );

    // NUEVO: límites máximos considerando el zoom
    const maxLupaTop = pageHeight - lupa.offsetHeight / zoomLevel;
    const maxLupaLeft = pageWidth - lupa.offsetWidth / zoomLevel;

    const lupaTop = Math.max(
      0,
      Math.min(mouseY + window.scrollY - lupa.offsetHeight / 2, maxLupaTop)
    );
    const lupaLeft = Math.max(
      0,
      Math.min(mouseX + window.scrollX - lupa.offsetWidth / 2, maxLupaLeft)
    );
    // Posiciona la lupa en la ventana (viewport)
    lupa.style.top = `${mouseY - lupa.offsetHeight / 2}px`;
    lupa.style.left = `${mouseX - lupa.offsetWidth / 2}px`;

    // Calcula el desplazamiento visible teniendo en cuenta el zoom
    const visibleTop = lupaTop / zoomLevel;
    const visibleLeft = lupaLeft / zoomLevel;

    // Clona el DOM y aplica el desplazamiento
    const viewportClone = fastClone(document.body);
    viewportClone.className = "lupa-clone";
    viewportClone.style.width = `${pageWidth}px`;
    viewportClone.style.height = `${pageHeight}px`;
    viewportClone.style.transform = `scale(${zoomLevel})`;
    viewportClone.style.transformOrigin = "top left";
    viewportClone.style.position = "absolute";
    viewportClone.style.top = `-${visibleTop}px`;
    viewportClone.style.left = `-${visibleLeft}px`;

    // Reemplaza el contenido de la lupa
    if (lupaContent.firstChild) {
      lupaContent.replaceChild(viewportClone, lupaContent.firstChild);
    } else {
      lupaContent.appendChild(viewportClone);
    }
    requestAnimationFrame(updateLupa);
  }

  function toggleLupa() {
    lupaActiva = !lupaActiva;
    lupa.style.display = lupaActiva ? "block" : "none";
    if (lupaActiva) requestAnimationFrame(updateLupa);
  }

  // Evento para activar/desactivar la lupa
  document.getElementById("toggle-lupa")?.addEventListener("click", toggleLupa);
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "z") toggleLupa();
  });

  // Ajuste en resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (lupaActiva) {
        lupa.style.top = `${Math.max(
          0,
          Math.min(
            mouseY - lupa.offsetHeight / 2,
            window.innerHeight - lupa.offsetHeight
          )
        )}px`;
      }
    }, 100);
  });

  // Exponer funciones globales si necesitas usarlas desde HTML
  window.changeFontSize = changeFontSize;
  window.resetFontSize = resetFontSize;
});


document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "f") {
    console.log("Tecla presionada:", e.key);
    const accBtn = document.getElementById("accessibility-btn");
    const accPanel = document.getElementById("accessibility-panel");
    if (accPanel) {
      accPanel.classList.toggle("hidden");
      if (!accPanel.classList.contains("hidden")) {
        setTimeout(() => {
          const btnRect = accBtn.getBoundingClientRect();
          accPanel.style.top = `${btnRect.top + window.scrollY}px`;
          accPanel.style.left = `${btnRect.left + window.scrollX - accPanel.offsetWidth}px`;
          accPanel.style.position = "absolute";
        }, 0);
      }
      e.preventDefault();
    }
  }
});