const toggleBtn = document.getElementById("toggle-mode");
const body = document.body;

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



