document.addEventListener("DOMContentLoaded", function () {
  // Estilos CSS para la visualización de errores
  const style = document.createElement("style");
  style.textContent = `
        .axe-error-panel {
            position: fixed;
            top: 0;
            right: 0;
            width: 350px;
            height: 100vh;
            background: white;
            box-shadow: -2px 0 10px rgba(0,0,0,0.1);
            z-index: 10000;
            overflow-y: auto;
            padding: 15px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            color: #000000;
        }
        .axe-error-panel.visible {
            transform: translateX(0);
        }
        .axe-error-item {
            margin-bottom: 15px;
            border-left: 4px solid #e74c3c;
            padding-left: 10px;
        }
        .axe-error-highlight {
            outline: 6px solid #e74c3c;
            background: rgba(231, 76, 60, 0.1);
        }
        .axe-error-title {
            font-weight: bold;
            color: #e74c3c;
            cursor: pointer;
        }
        .axe-error-details {
            margin-top: 5px;
            font-size: 0.9em;
            display: none;
            color: #000000;
        }
        .axe-error-item.expanded .axe-error-details {
            display: block;
        }
        #axe-close-panel {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
        }
        .generate-report-btn {
            background-color: #186329;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 15px;
            width: 100%;
            font-weight: bold;
        }
        .generate-report-btn:hover {
            background-color: #218838;
        }
        .btn-danger {
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 5px;
        }
        .btn-danger:hover {
            background-color: #c82333;
        }
        .p-1 {
            padding: 0.25rem;
        }
        .fs-3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }
    `;
  document.head.appendChild(style);

  // Variables para almacenar elementos resaltados y resultados
  let highlightedElements = [];
  let auditResults = null;

  // Crear panel de errores
  const errorPanel = document.createElement("div");
  errorPanel.className = "axe-error-panel";
  errorPanel.innerHTML = `
      <button id="axe-close-panel" aria-label="botón para cerrar el panel de auditar accesibilidad"  aria-hidden="true">×</button>
      <p role="region" class="fs-3">Errores de Accesibilidad</p>
      <div id="axe-errors-container"></div>
      <button id="generate-report-btn" class="generate-report-btn" aria-label="botón para generar el informe PDF"  aria-hidden="true">Generar Informe PDF</button>
  `;
  document.body.appendChild(errorPanel);

  // Botón de auditoría (flotante)
  const auditBtn = document.createElement("button");
  auditBtn.id = "accessibility-audit-btn";
  auditBtn.textContent = "Auditar Accesibilidad";
  auditBtn.style.position = "fixed";
  // posición del botón
  auditBtn.style.bottom = "20px";
  auditBtn.style.right = "20px";
  auditBtn.style.zIndex = "9999";
  auditBtn.style.padding = "10px 15px";
  auditBtn.style.backgroundColor = "#6f009e";
  auditBtn.style.color = "#faff24";
  auditBtn.style.border = "none";
  auditBtn.style.borderRadius = "4px";
  auditBtn.style.cursor = "pointer";
  document.body.appendChild(auditBtn);

  /**
   * @description Carga axe-core si no está disponible y configura la auditoría de accesibilidad.
   */
  if (typeof axe === "undefined") {
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js"
    )
      .then(setupAudit)
      .catch(console.error);
  } else {
    setupAudit();
  }
  /**
   * @description Configura los eventos de los botones para la auditoría de accesibilidad.
   */
  function setupAudit() {
      const auditBtn = document.getElementById('accessibility-audit-btn');
      const closePanelBtn = document.getElementById('axe-close-panel');
      const reportBtn = document.getElementById('generate-report-btn');

      if (auditBtn) auditBtn.addEventListener('click', runAudit);
      if (closePanelBtn) closePanelBtn.addEventListener('click', () => {
          errorPanel.classList.remove('visible');
          clearHighlights();
      });
      if (reportBtn) reportBtn.addEventListener('click', generatePDFFromResults);
  }

  /**
   * @description Ejecuta la auditoría de accesibilidad utilizando axe-core.
   */
  async function runAudit() {
    const btn = document.getElementById("accessibility-audit-btn");
    btn.textContent = "Analizando...";
    btn.disabled = true;
    try {
      // Limpiar resultados anteriores
      clearHighlights();
      document.getElementById("axe-errors-container").innerHTML = "";

      // Ejecutar análisis
      auditResults = await axe.run();

      // Mostrar resultados en el panel
      displayResultsInPanel(auditResults);

      // Mostrar panel
      errorPanel.classList.add("visible");
    } catch (error) {
      console.error("Error en la auditoría:", error);
      alert("Error al realizar la auditoría: " + error.message);
    } finally {
      btn.textContent = "Auditar Accesibilidad";
      btn.disabled = false;
    }
  }
  /**
   * @param {*} str cadena a formatear
   * @description Esta función reemplaza caracteres especiales como &, <, >, ", y ' por sus entidades HTML correspondientes.
   * @returns 
   */
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  }
  /**
   * @param {*} results Resultados de la auditoría obtenidos de axe-core
   * @description Esta función recorre los errores encontrados por axe-core y las muestra en el panel de errores.
   * @returns 
   */
  function displayResultsInPanel(results) {
    const container = document.getElementById("axe-errors-container");

    if (results.violations.length === 0) {
        container.innerHTML = "<p>No se encontraron errores de accesibilidad.</p>";
        return;
    }

    results.violations.forEach(violation => {
      const help = violation.help || "Sin descripción";
      const impact = violation.impact || "sin impacto";
      const description = violation.description || "Sin detalles";
      const helpUrl = violation.helpUrl || "#";
      const nodesCount = violation.nodes ? violation.nodes.length : 0;
      
      let detailsHtml = `
          <p><strong>Descripción:</strong> ${description}</p>
          <p><strong>Elementos afectados:</strong> ${nodesCount}</p>
          <p><strong>Cómo solucionarlo:</strong> <a href="${helpUrl}" target="blank">${helpUrl}</a></p>
      `;

      // Solo agrega el botón si hay nodos afectados
      if (nodesCount > 0) {
          detailsHtml += `<button class="btn-danger show-elements-btn p-1" data-violation-id="${violation.id}">Mostrar elementos</button>`;
      }

      const violationItem = document.createElement('div');
      violationItem.className = 'axe-error-item';
      violationItem.innerHTML = `
          <div class="axe-error-title">${escapeHTML(help)}  <span style="font-size:0.9em;color:#888;">(${impact})</span></div>
          <div class="axe-error-details">
              <p><strong>Regla:</strong> ${violation.id}</p>
              <p><strong>Descripción:</strong> ${description}</p>
              <p><strong>Elementos afectados:</strong> ${nodesCount}</p>
              <p><strong>Cómo solucionarlo:</strong> <a href="${helpUrl}" target="blank">${helpUrl}</a></p>
              ${nodesCount > 0 ? `<button class="btn-danger show-elements-btn p-1" data-violation-id="${violation.id}">Mostrar elementos</button>` : ""}
          </div>
      `;

      // Mostrar/ocultar detalles al hacer clic
      violationItem.querySelector('.axe-error-title').addEventListener('click', () => {
          violationItem.classList.toggle('expanded');
      });

      // Mostrar elementos afectados (con comprobación)
      const showBtn = violationItem.querySelector('.show-elements-btn');
      if (showBtn) {
          showBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              showAffectedElements(violation.id, violation.nodes);
          });
      }

      container.appendChild(violationItem);
    });
  }

  /**
   * @returns Genera un informe en PDF a partir de los resultados de la auditoría.
   * @description Esta función utiliza la librería jsPDF para crear un informe PDF con los resultados de la auditoría de accesibilidad.
   */
  async function generatePDFFromResults() {
    if (!auditResults) {
      alert("Primero debes ejecutar la auditoría");
      return;
    }

    const btn = document.getElementById("generate-report-btn");
    btn.textContent = "Generando PDF...";
    btn.disabled = true;

    try {
      await generatePDFReport(auditResults);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el informe: " + error.message);
    } finally {
      btn.textContent = "Generar Informe PDF";
      btn.disabled = false;
    }
  }

  /**
   * @description Resalta los elementos afectados por una error de accesibilidad.
   * @param {*} violationId Id del error de accesibilidad
   * @param {*} nodes datos de los nodos afectados
   */
  function showAffectedElements(violationId, nodes) {
    // Limpiar resaltados anteriores
    clearHighlights();

    // Resaltar nuevos elementos
    nodes.forEach((node) => {
      const elements = document.querySelectorAll(node.target.join(", "));
      elements.forEach((el) => {
        el.classList.add("axe-error-highlight");
        highlightedElements.push(el);

        // Scroll al elemento si es necesario
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }

  /**
   * @description Limpia el borde rojo de los elementos afectados por errores de accesibilidad.
   */
  function clearHighlights() {
    highlightedElements.forEach((el) => {
      el.classList.remove("axe-error-highlight");
    });
    highlightedElements = [];
  }

  /**
   * @description Carga un script externo y devuelve una promesa que se resuelve cuando el script se ha cargado correctamente.
   * @param {*} src 
   * @returns  {Promise} 
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error(`Error al cargar script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * @description Genera un informe PDF con los resultados de la auditoría de accesibilidad.
   * @param {*} results 
   */
  async function generatePDFReport(results) {
    try {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      );
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      let y = 20;

      // Encabezado
      doc.setFontSize(20);
      doc.text("Informe de Accesibilidad", 105, y, { align: "center" });
      y += 15;

      doc.setFontSize(12);
      doc.text(`URL: ${window.location.href}`, 14, y);
      
      // establece el nombre del archivo
      var url = window.location.href;
      var partes = url.split("/").filter(Boolean); // elimina vacíos
      var nombre_archivo = "";
      console.log(partes);
      // Si la URL termina en el puerto (inicio)
      if (partes.length === 2 && partes[1].includes(":")) {
        nombre_archivo = "inicio";
      } else {
        // Toma el último segmento (por ejemplo: "herramientas")
        nombre_archivo = partes[partes.length - 1];
      }

      console.log(nombre_archivo);
      
      y += 7;
      doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, y);
      y += 15;

      // Resumen
      doc.setFontSize(16);
      doc.text("Resumen de Resultados", 14, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`Total de violaciones: ${results.violations.length}`, 20, y);
      y += 7;
      doc.text(
        `Críticas: ${
          results.violations.filter((v) => v.impact === "critical").length
        }`,
        20,
        y
      );
      y += 7;
      doc.text(
        `Graves: ${
          results.violations.filter((v) => v.impact === "serious").length
        }`,
        20,
        y
      );
      y += 7;
      doc.text(
        `Moderadas: ${
          results.violations.filter((v) => v.impact === "moderate").length
        }`,
        20,
        y
      );
      y += 7;
      doc.text(
        `Menores: ${
          results.violations.filter((v) => v.impact === "minor").length
        }`,
        20,
        y
      );
      y += 15;

      // Detalles
      doc.setFontSize(16);
      doc.text("Detalles de Errores", 14, y);
      y += 10;

      doc.setFontSize(12);
      results.violations.forEach((violation) => {
        // Violación
        doc.setFont(undefined, "bold");
        doc.text(`${violation.help} (${violation.impact})`, 14, y);
        doc.setFont(undefined, "normal");
        y += 7;

        // Descripción
        const descLines = doc.splitTextToSize(violation.description, 180);
        descLines.forEach((line) => {
          doc.text(line, 20, y);
          y += 7;
        });

        // Elementos afectados
        doc.text(`Elementos afectados: ${violation.nodes.length}`, 20, y);
        y += 7;

        // Solución
        doc.text(`Cómo solucionarlo: ${violation.helpUrl}`, 20, y);
        y += 7;

        // Ejemplo de HTML
        if (violation.nodes.length > 0) {
          doc.text(
            `Ejemplo: ${violation.nodes[0].html.substring(0, 80)}...`,
            20,
            y
          );
          y += 7;
        }

        y += 10;

        // Nueva página si es necesario
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });

      // Guardar PDF
      doc.save(`auditoria-accesibilidad-${nombre_archivo}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      throw error;
    }
  }
});
