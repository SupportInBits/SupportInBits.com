// static/js/accessibility-audit-enhanced.js

document.addEventListener('DOMContentLoaded', function() {
    // Estilos CSS para la visualización de errores
    const style = document.createElement('style');
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
    const errorPanel = document.createElement('div');
    errorPanel.className = 'axe-error-panel';
    errorPanel.innerHTML = `
        <button id="axe-close-panel">×</button>
        <p role="region" class="fs-3">Errores de Accesibilidad</p>
        <div id="axe-errors-container"></div>
        <button id="generate-report-btn" class="generate-report-btn">Generar Informe PDF</button>
    `;
    document.body.appendChild(errorPanel);

    // Botón de auditoría (flotante)
    const auditBtn = document.createElement('button');
    auditBtn.id = 'accessibility-audit-btn';
    auditBtn.textContent = 'Auditar Accesibilidad';
    auditBtn.style.position = 'fixed';
    auditBtn.style.bottom = '20px';
    auditBtn.style.right = '20px';
    auditBtn.style.zIndex = '9999';
    auditBtn.style.padding = '10px 15px';
    auditBtn.style.backgroundColor = '#6f009e';
    auditBtn.style.color = '#faff24';
    auditBtn.style.border = 'none';
    auditBtn.style.borderRadius = '4px';
    auditBtn.style.cursor = 'pointer';
    document.body.appendChild(auditBtn);

    // Cargar axe-core
    if (typeof axe === 'undefined') {
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js')
            .then(setupAudit)
            .catch(console.error);
    } else {
        setupAudit();
    }

    function setupAudit() {
        document.getElementById('accessibility-audit-btn').addEventListener('click', runAudit);
        document.getElementById('axe-close-panel').addEventListener('click', () => {
            errorPanel.classList.remove('visible');
            clearHighlights();
        });
        document.getElementById('generate-report-btn').addEventListener('click', generatePDFFromResults);
    }

    async function runAudit() {
        const btn = document.getElementById('accessibility-audit-btn');
        btn.textContent = 'Analizando...';
        btn.disabled = true;
        
        try {
            // Limpiar resultados anteriores
            clearHighlights();
            document.getElementById('axe-errors-container').innerHTML = '';
            
            // Ejecutar análisis
            auditResults = await axe.run();
            
            // Mostrar resultados en el panel
            displayResultsInPanel(auditResults);
            
            // Mostrar panel
            errorPanel.classList.add('visible');
            
        } catch (error) {
            console.error('Error en la auditoría:', error);
            alert('Error al realizar la auditoría: ' + error.message);
        } finally {
            btn.textContent = 'Auditar Accesibilidad';
            btn.disabled = false;
        }
    }

    function displayResultsInPanel(results) {
        const container = document.getElementById('axe-errors-container');
        
        if (results.violations.length === 0) {
            container.innerHTML = '<p>No se encontraron errores de accesibilidad.</p>';
            return;
        }
        
        results.violations.forEach(violation => {
            const violationItem = document.createElement('div');
            violationItem.className = 'axe-error-item';
            violationItem.innerHTML = `
                <div class="axe-error-title">${violation.help} (${violation.impact})</div>
                <div class="axe-error-details">
                    <p><strong>Descripción:</strong> ${violation.description}</p>
                    <p><strong>Elementos afectados:</strong> ${violation.nodes.length}</p>
                    <p><strong>Cómo solucionarlo:</strong> <a href="${violation.helpUrl}" target="blank">${violation.helpUrl}</a></p>
                    <button class="btn-danger show-elements-btn p-1" data-violation-id="${violation.id}">Mostrar elementos</button>
                </div>
            `;
            
            // Mostrar/ocultar detalles al hacer clic
            violationItem.querySelector('.axe-error-title').addEventListener('click', () => {
                violationItem.classList.toggle('expanded');
            });
            
            // Mostrar elementos afectados
            violationItem.querySelector('.show-elements-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                showAffectedElements(violation.id, violation.nodes);
            });
            
            container.appendChild(violationItem);
        });
    }

    async function generatePDFFromResults() {
        if (!auditResults) {
            alert('Primero debes ejecutar la auditoría');
            return;
        }
        
        const btn = document.getElementById('generate-report-btn');
        btn.textContent = 'Generando PDF...';
        btn.disabled = true;
        
        try {
            await generatePDFReport(auditResults);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el informe: ' + error.message);
        } finally {
            btn.textContent = 'Generar Informe PDF';
            btn.disabled = false;
        }
    }

    function showAffectedElements(violationId, nodes) {
        // Limpiar resaltados anteriores
        clearHighlights();
        
        // Resaltar nuevos elementos
        nodes.forEach(node => {
            const elements = document.querySelectorAll(node.target.join(', '));
            elements.forEach(el => {
                el.classList.add('axe-error-highlight');
                highlightedElements.push(el);
                
                // Scroll al elemento si es necesario
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });
    }

    function clearHighlights() {
        highlightedElements.forEach(el => {
            el.classList.remove('axe-error-highlight');
        });
        highlightedElements = [];
    }

    // Función para cargar scripts
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Error al cargar script: ${src}`));
            document.head.appendChild(script);
        });
    }

    // Función para generar PDF
    async function generatePDFReport(results) {
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            let y = 20;
            
            // Encabezado
            doc.setFontSize(20);
            doc.text('Informe de Accesibilidad', 105, y, { align: 'center' });
            y += 15;
            
            doc.setFontSize(12);
            doc.text(`URL: ${window.location.href}`, 14, y);
            y += 7;
            doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, y);
            y += 15;
            
            // Resumen
            doc.setFontSize(16);
            doc.text('Resumen de Resultados', 14, y);
            y += 10;
            
            doc.setFontSize(12);
            doc.text(`Total de violaciones: ${results.violations.length}`, 20, y);
            y += 7;
            doc.text(`Críticas: ${results.violations.filter(v => v.impact === 'critical').length}`, 20, y);
            y += 7;
            doc.text(`Graves: ${results.violations.filter(v => v.impact === 'serious').length}`, 20, y);
            y += 7;
            doc.text(`Moderadas: ${results.violations.filter(v => v.impact === 'moderate').length}`, 20, y);
            y += 7;
            doc.text(`Menores: ${results.violations.filter(v => v.impact === 'minor').length}`, 20, y);
            y += 15;
            
            // Detalles
            doc.setFontSize(16);
            doc.text('Detalles de Violaciones', 14, y);
            y += 10;
            
            doc.setFontSize(12);
            results.violations.forEach(violation => {
                // Violación
                doc.setFont(undefined, 'bold');
                doc.text(`${violation.help} (${violation.impact})`, 14, y);
                doc.setFont(undefined, 'normal');
                y += 7;
                
                // Descripción
                const descLines = doc.splitTextToSize(violation.description, 180);
                descLines.forEach(line => {
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
                    doc.text(`Ejemplo: ${violation.nodes[0].html.substring(0, 80)}...`, 20, y);
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
            doc.save(`auditoria-accesibilidad-${new Date().toISOString().slice(0, 10)}.pdf`);
            
        } catch (error) {
            console.error('Error al generar PDF:', error);
            throw error;
        }
    }
});