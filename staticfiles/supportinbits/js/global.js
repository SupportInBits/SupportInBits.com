const toggleBtn = document.getElementById("toggle-mode");
const body = document.body;

// botón para ir arriba
const botonUp = document.getElementById("boton-up");
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    botonUp.style.display = "block";
    botonUp.setAttribute("aria-hidden", "false");
  } else {
    botonUp.style.display = "none";
    botonUp.setAttribute("aria-hidden", "true");
  }
});

// Al hacer clic, subir al principio con animación
botonUp.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});



