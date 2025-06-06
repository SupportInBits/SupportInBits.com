// Configuración de velocidad
let currentRate = 1;
const minRate = 0.5;
const maxRate = 2;

// Actualizar display de velocidad
function updateSpeedDisplay() {
    document.getElementById('speedValue').textContent = currentRate.toFixed(1) + 'x';
    localStorage.setItem('speechRate', currentRate); // Guardar preferencia
}

// Cargar velocidad guardada
if (localStorage.getItem('speechRate')) {
    currentRate = parseFloat(localStorage.getItem('speechRate'));
    updateSpeedDisplay();
}

// Modificar función leerTexto
function leerTexto(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance();
        utterance.text = texto;
        utterance.lang = 'es-ES';
        utterance.rate = currentRate; // Usar velocidad actual

        window.speechSynthesis.speak(utterance);
    } else {
        alert('Lo siento, tu navegador no soporta la función de lectura de voz.');
    }
}

// Eventos para controles de velocidad
document.getElementById('increaseSpeed').addEventListener('click', function () {
    if (currentRate < maxRate) {
        currentRate += 0.1;
        updateSpeedDisplay();
    }
});

document.getElementById('decreaseSpeed').addEventListener('click', function () {
    if (currentRate > minRate) {
        currentRate -= 0.1;
        updateSpeedDisplay();
    }
});


// Leer todo el menú
document.getElementById('readAll').addEventListener('click', function () {
    const menuText = document.getElementById('menu-Restaurante').innerText;
    leerTexto(menuText);
});

// Detener la lectura
document.getElementById('stopReading').addEventListener('click', function () {
    window.speechSynthesis.cancel();
});