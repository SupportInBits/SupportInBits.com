const toggleBtn = document.getElementById("toggle-mode");
const body = document.body;

// toggleBtn.addEventListener("click", () => {
//   body.classList.toggle("dark-mode");
//
//   // Cambiar el texto del botón según el modo actual
//   if (body.classList.contains("dark-mode")) {
//     toggleBtn.innerHTML = '<i class="bi bi-sun-fill p-2"></i>';
//   } else {
//     toggleBtn.innerHTML = '<i class="bi bi-moon-fill p-2"></i>';
//   }
// });

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


