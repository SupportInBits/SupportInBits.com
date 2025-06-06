document.addEventListener("DOMContentLoaded", function () {
  // --- Variables de accesibilidad ---
  const accBtn = document.getElementById("accessibility-btn");
  const accPanel = document.getElementById("accessibility-panel");
  const highContrast = document.getElementById("high-contrast");
  const resetContrast = document.getElementById("reset-contrast");
  const toggleSpacing = document.getElementById("toggle-spacing");
  const MAX_SPACING_LEVEL = 4;

  // --- Panel de accesibilidad ---
  accBtn?.addEventListener("click", () => accPanel?.classList.toggle("hidden"));

  // --- Contraste alto ---
  highContrast?.addEventListener("click", () => setHighContrast(true));
  resetContrast?.addEventListener("click", () => setHighContrast(false));

  function setHighContrast(enable) {
    document.body.classList.toggle("high-contrast", enable);
    if (enable) {
      localStorage.setItem("highContrast", "true");
    } else {
      localStorage.removeItem("highContrast");
    }
  }

  // --- Espaciado accesible ---
  toggleSpacing?.addEventListener("click", () => {
    let currentLevel = parseInt(localStorage.getItem("spacingLevel")) || 0;
    let nextLevel = (currentLevel + 1) % (MAX_SPACING_LEVEL + 1);
    applySpacingLevel(nextLevel);
  });

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

  function updateSpacingButtonText(level) {
    if (toggleSpacing) toggleSpacing.textContent = `Nivel espaciado (${level})`;
  }

  // --- Preferencias al cargar ---
  function loadPreferences() {
    setHighContrast(localStorage.getItem("highContrast") === "true");
    const savedSpacing = parseInt(localStorage.getItem("spacingLevel")) || 0;
    applySpacingLevel(savedSpacing);
  }
  loadPreferences();

  // --- Tamaño de fuente ---
  const fontSizes = ["font-size-small", "font-size-medium", "font-size-large"];
  let currentSizeIndex = 0;

  function applyFontSize(className) {
    const contenido = document.getElementById("contenido");
    const nav = document.getElementById("navegador");
    const header = document.querySelector("header");
    const html = document.documentElement;
    const btn = document.getElementById("accessibility-btn");
    const userDropdownBtns = document.querySelectorAll('.dropdown-toggle');
    if (!contenido || !btn) return;
    fontSizes.forEach(cls => {
      document.body.classList.remove(cls);
      contenido.classList.remove(cls);
      nav?.classList.remove(cls);
      header?.classList.remove(cls);
      html.classList.remove(cls);
      btn.classList.remove(cls);
      userDropdownBtns.forEach(b => b.classList.remove(cls));
    });
    document.body.classList.add(className);
    contenido.classList.add(className);
    nav?.classList.add(className);
    header?.classList.add(className);
    userDropdownBtns.forEach(b => b.classList.add(className));
    localStorage.setItem("fontSizeClass", className);
  }

  function changeFontSize(direction) {
    currentSizeIndex += direction;
    currentSizeIndex = Math.max(0, Math.min(currentSizeIndex, fontSizes.length - 1));
    applyFontSize(fontSizes[currentSizeIndex]);
  }

  function resetFontSize() {
    currentSizeIndex = 0;
    applyFontSize(fontSizes[currentSizeIndex]);
  }

  // Inicializar tamaño de fuente
  (function initFontSize() {
    const savedClass = localStorage.getItem("fontSizeClass");
    if (savedClass && fontSizes.includes(savedClass)) {
      currentSizeIndex = fontSizes.indexOf(savedClass);
      applyFontSize(savedClass);
    } else {
      applyFontSize(fontSizes[currentSizeIndex]);
    }
  })();

  // --- Lupa ---
  const lupa = document.getElementById("lupa");
  const lupaContent = document.getElementById("lupa-content");
  let lupaActiva = false;
  const zoomLevel = 2;
  let lastTimestamp = 0;
  const updateInterval = 16;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  function fastClone(element) {
    const clone = element.cloneNode(false);
    element.childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (["SCRIPT", "STYLE", "LINK"].includes(child.tagName) || child.id === "lupa") return;
        clone.appendChild(fastClone(child));
      } else if (child.nodeType === Node.TEXT_NODE) {
        clone.appendChild(child.cloneNode());
      }
    });
    return clone;
  }


  // Actualiza mouseX y mouseY en el evento mousemove
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function updateLupa(timestamp) {
    if (!lupaActiva) return;
    if (timestamp - lastTimestamp < updateInterval) {
      requestAnimationFrame(updateLupa);
      return;
    }
    lastTimestamp = timestamp;

    // Calcula la posición de la lupa en la ventana
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );

    const pageWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    );

    const lupaTop = Math.max(
      0,
      Math.min(
        mouseY + window.scrollY - lupa.offsetHeight / 2,
        pageHeight - lupa.offsetHeight
      )
    );

    const lupaLeft = Math.max(
      0,
      Math.min(
        mouseX + window.scrollX - lupa.offsetWidth / 2,
        pageWidth - lupa.offsetWidth
      )
    );

    lupa.style.top = `${lupaTop - window.scrollY}px`;
    lupa.style.left = `${lupaLeft - window.scrollX}px`;

    // El resto igual...
    const visibleTop = lupaTop / zoomLevel;
    const visibleLeft = lupaLeft / zoomLevel;
    // Clona el DOM y aplica el desplazamiento
    const viewportClone = fastClone(document.body);
    viewportClone.className = "lupa-clone";
    viewportClone.style.width = `${document.body.scrollWidth}px`;
    viewportClone.style.height = `${document.body.scrollHeight}px`;
    viewportClone.style.transform = `scale(${zoomLevel})`;
    viewportClone.style.transformOrigin = "top left";
    viewportClone.style.position = "absolute";
    viewportClone.style.top = `-${visibleTop}px`;
    viewportClone.style.left = `-${visibleLeft}px`;

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

  // Eventos lupa
  document.addEventListener("mousemove", e => { mouseY = e.clientY; }, { passive: true });
  document.getElementById("toggle-lupa")?.addEventListener("click", toggleLupa);
  document.addEventListener("keydown", e => {
    if (e.altKey && e.key.toLowerCase() === "z") toggleLupa();
  });

  // Resize para lupa
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (lupaActiva) {
        lupa.style.top = `${Math.max(0, Math.min(mouseY - lupa.offsetHeight / 2, window.innerHeight - lupa.offsetHeight))}px`;
      }
    }, 100);
  });

  // Exponer funciones globales si necesitas usarlas desde HTML
  window.changeFontSize = changeFontSize;
  window.resetFontSize = resetFontSize;
});