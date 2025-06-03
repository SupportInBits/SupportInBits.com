document.addEventListener("DOMContentLoaded", function () {
  const accBtn = document.getElementById("accessibility-btn");
  const accPanel = document.getElementById("accessibility-panel");
  const highContrast = document.getElementById("high-contrast");
  const resetContrast = document.getElementById("reset-contrast");

  // Toggle del panel
  accBtn.addEventListener("click", function () {
    accPanel.classList.toggle("hidden");
  });

  // Alto contraste
  highContrast.addEventListener("click", function () {
    console.log("ejecutando-alto-contraste");
    document.body.classList.add("high-contrast");
    localStorage.setItem("highContrast", "true");
  });

  // Contraste normal
  resetContrast.addEventListener("click", function () {
    document.body.classList.remove("high-contrast");
    localStorage.removeItem("highContrast");
  });

  // Cargar preferencias guardadas
  function loadPreferences() {
    // Contraste
    if (localStorage.getItem("highContrast") === "true") {
      document.body.classList.add("high-contrast");
    }

    // Espaciado accesible
    const savedSpacing = parseInt(localStorage.getItem("spacingLevel")) || 0;
    applySpacingLevel(savedSpacing);
  }  

  // Cambiar espaciado
  const toggleSpacing = document.getElementById("toggle-spacing");
  const MAX_SPACING_LEVEL = 4;

  function updateSpacingButtonText(level) {
    toggleSpacing.textContent = `Nivel espaciado (${level})`;
  }

  function applySpacingLevel(level) {
    // Quita todas las clases anteriores
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

  toggleSpacing.addEventListener("click", function () {
    let currentLevel = parseInt(localStorage.getItem("spacingLevel")) || 0;
    let nextLevel = (currentLevel + 1) % (MAX_SPACING_LEVEL + 1);
    applySpacingLevel(nextLevel);
  });

  // Cargar preferencias al iniciar
  loadPreferences();
});

/**
 * cambiar tamaño de fuente
 */
const fontSizes = ["font-size-small", "font-size-medium", "font-size-large"];
let currentSizeIndex = 0;

function applyFontSize(className) {
  const contenido = document.getElementById("contenido");
  const nav = document.getElementById("navegador");
  const header = document.querySelector("header");
  const html = document.documentElement;
  const btn = document.getElementById("accessibility-btn");

  if (!contenido || !btn) return;

  // Remover clases anteriores
  fontSizes.forEach((cls) => {
    document.body.classList.remove(cls);
    contenido.classList.remove(cls);
    nav.classList.remove(cls);
    header.classList.remove(cls);
    html.classList.remove(cls);
    btn.classList.remove(cls); 
  });

  // Aplicar nueva clase
  document.body.classList.add(className);
  contenido.classList.add(className);
  nav.classList.add(className);
  header.classList.add(className);
  // html.classList.add(className);

  // Guardar
  localStorage.setItem("fontSizeClass", className);
}

function changeFontSize(direction) {
  currentSizeIndex += direction;
  currentSizeIndex = Math.max(
    0,
    Math.min(currentSizeIndex, fontSizes.length - 1)
  );
  applyFontSize(fontSizes[currentSizeIndex]);
}

function resetFontSize() {
  currentSizeIndex = 0; 
  applyFontSize(fontSizes[currentSizeIndex]);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedClass = localStorage.getItem("fontSizeClass");
  if (savedClass && fontSizes.includes(savedClass)) {
    currentSizeIndex = fontSizes.indexOf(savedClass);
    applyFontSize(savedClass);
  } else {
    applyFontSize(fontSizes[currentSizeIndex]);
  }
});

/**
 *función lupa
 */
document.addEventListener("DOMContentLoaded", function () {
  const lupa = document.getElementById("lupa");
  const lupaContent = document.getElementById("lupa-content");
  let lupaActiva = false;
  let mouseY = window.innerHeight / 2;
  const zoomLevel = 2;
  let lastTimestamp = 0;
  const updateInterval = 16; // ~60fps

  // Versión ultra optimizada de cloneNode
  function fastClone(element) {
    const clone = element.cloneNode(false);
    const children = element.childNodes;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (["SCRIPT", "STYLE", "LINK"].includes(child.tagName)) {
          continue;
        }
        if (child.id === "lupa") continue;
        clone.appendChild(fastClone(child));
      } else if (child.nodeType === Node.TEXT_NODE) {
        clone.appendChild(child.cloneNode());
      }
    }

    return clone;
  }

  function updateLupa(timestamp) {
    if (!lupaActiva) return;

    // Limitar a ~60fps para mejor rendimiento
    if (timestamp - lastTimestamp < updateInterval) {
      requestAnimationFrame(updateLupa);
      return;
    }
    lastTimestamp = timestamp;

    // Posición vertical centrada
    const lupaTop = Math.max(
      0,
      Math.min(
        mouseY - lupa.offsetHeight / 2,
        window.innerHeight - lupa.offsetHeight
      )
    );

    lupa.style.top = `${lupaTop}px`;

    // Calcular área visible a clonar
    const visibleTop = lupaTop / zoomLevel;
    const visibleHeight = lupa.offsetHeight / zoomLevel;

    // Crear clon optimizado
    const viewportClone = fastClone(document.body);
    viewportClone.className = "lupa-clone";
    viewportClone.style.transform = `scale(${zoomLevel})`;
    viewportClone.style.top = `-${visibleTop}px`;
    viewportClone.style.left = "0";

    // Actualización eficiente del contenido
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

    if (lupaActiva) {
      requestAnimationFrame(updateLupa);
    }
  }

  // Event listeners optimizados
  const handleMouseMove = (e) => {
    mouseY = e.clientY;
  };

  document.addEventListener("mousemove", handleMouseMove, { passive: true });
  document.getElementById("toggle-lupa").addEventListener("click", toggleLupa);

  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.key.toLowerCase() === "z") {
      toggleLupa();
    }
  });

  // Optimización para resize
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
});
