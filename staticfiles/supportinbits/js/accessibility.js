document.addEventListener('DOMContentLoaded', function() {
    const accBtn = document.getElementById('accessibility-btn');
    const accPanel = document.getElementById('accessibility-panel');
    const increaseFont = document.getElementById('increase-font');
    const decreaseFont = document.getElementById('decrease-font');
    const resetFont = document.getElementById('reset-font');
    const highContrast = document.getElementById('high-contrast');
    const resetContrast = document.getElementById('reset-contrast');
    
    // Toggle del panel
    accBtn.addEventListener('click', function() {
        accPanel.classList.toggle('hidden');
    });
    
    // Aumentar tamaño de fuente
    increaseFont.addEventListener('click', function() {
        changeFontSize(1);
    });
    
    // Disminuir tamaño de fuente
    decreaseFont.addEventListener('click', function() {
        changeFontSize(-1);
    });
    
    // Resetear tamaño de fuente
    resetFont.addEventListener('click', function() {
        document.body.style.fontSize = '';
        localStorage.removeItem('fontSize');
    });
    
    // Alto contraste
    highContrast.addEventListener('click', function() {
        console.log("ejecutando-alto-contraste")
        document.body.classList.add('high-contrast');
        localStorage.setItem('highContrast', 'true');
    });
    
    // Contraste normal
    resetContrast.addEventListener('click', function() {
        document.body.classList.remove('high-contrast');
        localStorage.removeItem('highContrast');
    });
    
    // Cargar preferencias guardadas
    function loadPreferences() {
        // Tamaño de fuente
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            document.body.style.fontSize = savedFontSize;
        }
        
        // Contraste
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
    }
    
    // Cambiar tamaño de fuente
    function changeFontSize(direction) {
        const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
        const newSize = currentSize + (direction * 2);
        document.body.style.fontSize = `${newSize}px`;
        localStorage.setItem('fontSize', `${newSize}px`);
    }
    
    // Cargar preferencias al iniciar
    loadPreferences();
});

/**
 * función lupa
 */
document.addEventListener("DOMContentLoaded", function() {
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
          if (['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) {
            continue;
          }
          if (child.id === 'lupa') continue;
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
      const lupaTop = Math.max(0, Math.min(
        mouseY - lupa.offsetHeight / 2,
        window.innerHeight - lupa.offsetHeight
      ));
      
      lupa.style.top = `${lupaTop}px`;
      
      // Calcular área visible a clonar
      const visibleTop = lupaTop / zoomLevel;
      const visibleHeight = lupa.offsetHeight / zoomLevel;
      
      // Crear clon optimizado
      const viewportClone = fastClone(document.body);
      viewportClone.className = 'lupa-clone';
      viewportClone.style.transform = `scale(${zoomLevel})`;
      viewportClone.style.top = `-${visibleTop}px`;
      viewportClone.style.left = '0';
      
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
    
    document.addEventListener("keydown", function(e) {
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
          lupa.style.top = `${Math.max(0, Math.min(
            mouseY - lupa.offsetHeight / 2,
            window.innerHeight - lupa.offsetHeight
          ))}px`;
        }
      }, 100);
    });
  });