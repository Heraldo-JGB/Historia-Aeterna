
//, TEMAS: Pergamino → Noche → (ciclo)

// Una lista en la que podríamos añadir más temas fácilmente
const TEMAS = [
  { clase: "tema-pergamino", nombre: "Noche" },
  { clase: "tema-noche", nombre: "Pergamino"}
];

const boton = document.getElementById("cambiar-tema");

// Devuelve el índice del tema activo
function temaActual() {
  for(let i = 0; i < TEMAS.length; i++)
    if(document.body.classList.contains(TEMAS[i].clase))
      return i;
  return 0;
}

// Aplica el tema del índice dado y actualiza el texto del botón
function aplicarTema(nuevo) {
  TEMAS.forEach(actual => document.body.classList.remove(actual.clase));
  document.body.classList.add(TEMAS[nuevo].clase);
  // El botón muestra el nombre del siguiente tema
  boton.textContent = TEMAS[nuevo].nombre;
}

// Inicializa con el tema predeterminado
aplicarTema(0);

boton.addEventListener("click", () => {
  const siguiente = (temaActual() + 1) % TEMAS.length;    // " % TEMAS.length" para volver al principio al superar el último tema
  aplicarTema(siguiente);
});


// Seleccionamos todos los enlaces del menú y todas las secciones
const enlaces = document.querySelectorAll('a[href^="#"]');    // Selecciona todos los 'a' (enlaces) que empiecen por '#'
const secciones = document.querySelectorAll("main section");

enlaces.forEach(enlace => {
  enlace.addEventListener("click", (evento) => {
    evento.preventDefault();    // Evita que la página cambie bruscamente con el '#'

    // Obtenemos la sección a la que apunta el "href"
    const idObjetivo = enlace.getAttribute("href").substring(1);
    const seccionAMostrar = document.getElementById(idObjetivo);
    const seccionActual = document.querySelector("section.activa");

    // Si pulsa la misma sección que ya está visible, no hacer nada
    if (!seccionAMostrar || seccionActual === seccionAMostrar)
      return;

    if (seccionActual) {
      // Animamos la salida de la sección actual
      seccionActual.classList.remove("activa");
      seccionActual.classList.add("saliendo");

      // Al terminar la animación de salida, mostramos la nueva
      seccionActual.addEventListener("animationend", () => {
        seccionActual.classList.remove("saliendo");
        seccionAMostrar.classList.add("activa");
      }, { once: true });   // "once" para que se ejecute solo una vez y se elimine automáticamente
    } else {
      // Si no hay ninguna sección activa, mostrar directamente
      seccionAMostrar.classList.add("activa");
    }
  });
});


//, VISOR: zoom y arrastre
(() => {
  const visor = document.getElementById("visor");
  const visorImagen = document.getElementById("visor-imagen");
  const visorContenedor = document.getElementById("visor-contenedor");
  const visorDescargar = document.getElementById("visor-descargar");
  const visorCerrar = document.getElementById("visor-boton-cerrar");

  // Estado del zoom
  let escala  = 1;
  let posX = 0;
  let posY = 0;
  let arrastrando = false;
  let inicioX = 0;
  let inicioY = 0;

  const ESCALA_MIN = 0.5;
  const ESCALA_MAX = 12;
  const CAMBIO_ZOOM  = 0.15;

  // Aplica el movimiento o zoom
  function mover() {
    visorImagen.style.transform = `translate(${posX}px, ${posY}px) scale(${escala})`;
  }

  function reiniciarZoom() {
    escala = 1;
    posX = 0;
    posY = 0;
    mover();
  }

  // Abrir visor al clicar cualquier imagen dentro de .cuadro-imagen
  document.querySelectorAll(".cuadro-imagen img").forEach(img => {
    img.addEventListener("click", () => {
      const src = img.src;      // Imagen clicada
      visorImagen.src = src;   // Pone la imagen clicada en el visor
      visorImagen.alt = img.alt || "";   // Copia el "alt" a la vista en el visor

      // Botón de descarga o enlace de Wikimedia
      const paginaExterna = img.dataset.pagina;     // Enlace la página del archivo (si está)
      if(paginaExterna){
        visorDescargar.href = paginaExterna;
        visorDescargar.removeAttribute("download"); // Quitamos "download": se abre como enlace normal en nueva pestaña
        visorDescargar.target = "_blank";           // Abrir enlace
        visorDescargar.rel = "noopener noreferrer"; // Seguridad
        visorDescargar.textContent = "🔗 Ver en Wikimedia";
      } else {
        visorDescargar.href = img.getAttribute("src");
        const nombreArchivo = img.alt || "imagen";  // Como nombre de archivo para la descarga usamos el "alt" del HTML
        visorDescargar.download = nombreArchivo;    // Preparar la descarga por si se pulsa el botón
        visorDescargar.removeAttribute("target");
        visorDescargar.removeAttribute("rel");
        visorDescargar.textContent = "⬇ Descargar";
      }

      // Reiniciar zoom por si se había movido una imagen anteriormente (el visor es el mismo aunque la imagen cambie)
      reiniciarZoom();
      visor.classList.add("abierto");
      visor.setAttribute("aria-hidden", "false");
    });
  });

  // Cerrar
  function cerrarVisor() {
    visor.classList.remove("abierto");
    visor.setAttribute("aria-hidden", "true");
    visorImagen.src = "";
  }

  visorCerrar.addEventListener("click", cerrarVisor);

  // Cerrar al clicar fuera de la imagen (el fondo del contenedor)
  visorContenedor.addEventListener("click", (e) => {
    if (e.target === visorContenedor)
      cerrarVisor();
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && visor.classList.contains("abierto")) {
      cerrarVisor();
    }
  });

  // Zoom con rueda del ratón
  visorContenedor.addEventListener("wheel", (e) => {
    e.preventDefault();

    // Posición del puntero respecto al contenedor
    const rect = visorContenedor.getBoundingClientRect();
    const punteroX = e.clientX - rect.left;
    const punteroY = e.clientY - rect.top;

    // Punto de la imagen bajo el puntero antes del zoom
    // Fórmula para calcular las coordenadas usada comunmente
    const imgX = (punteroX - posX) / escala;
    const imgY = (punteroY - posY) / escala;

    // Nueva escala
    const delta = e.deltaY > 0 ? -CAMBIO_ZOOM : CAMBIO_ZOOM;    // "e.deltaY" es la rudea del ratón. "CAMBIO_ZOOM" amplía y "-CAMBIO_ZOOM" aleja
    escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escala * (1 + delta)));  // Límites para que la imagen no se haga demasiado pequeña o demasiado grande

    // Ajustar posición desde el cursor
    posX = punteroX - imgX * escala;
    posY = punteroY - imgY * escala;

    mover();
  }, { passive: false });     // "passive: false" para que al mover la rueda solo se mueva el zoom de la imagen y no la sección

  // Arrastre con ratón
  visorContenedor.addEventListener("mousedown", (e) => {
    if(e.button !== 0)
      return;             // Mover solo con pulsando el botón izquierdo del ratón
    arrastrando = true;   // Para no mover si no ha pulsado el botón izquierdo
    inicioX = e.clientX - posX;
    inicioY = e.clientY - posY;
  });

  // "window" para que pueda arrastrarse el ratón fuera de lo que sería el contenedor
  window.addEventListener("mousemove", (e) => {
    if(!arrastrando)
      return;
    posX = e.clientX - inicioX;
    posY = e.clientY - inicioY;
    mover();
  });

  // Al dejar de pulsar el ratón "arrastrando" se vuelve "false" para dejar de mover la imagen
  window.addEventListener("mouseup", () => { arrastrando = false; });

  //' Para dispositivos táctiles
  let distanciaAnterior = 0;

  function distanciaEntreToques(toques) {
    const dx = toques[0].clientX - toques[1].clientX;
    const dy = toques[0].clientY - toques[1].clientY;
    return Math.hypot(dx, dy);
  }

  visorContenedor.addEventListener("touchstart", (e) => {
    if(e.touches.length === 1){
      arrastrando = true;
      inicioX = e.touches[0].clientX - posX;
      inicioY = e.touches[0].clientY - posY;
    }else if(e.touches.length === 2){
      arrastrando = false;
      distanciaAnterior = distanciaEntreToques(e.touches);
    }
  }, { passive: true });

  visorContenedor.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && arrastrando) {
      posX = e.touches[0].clientX - inicioX;
      posY = e.touches[0].clientY - inicioY;
      mover();
    } else if (e.touches.length === 2) {
      const distNueva = distanciaEntreToques(e.touches);
      const factor = distNueva / distanciaAnterior;

      // Centro entre ambos toques
      const rect = visorContenedor.getBoundingClientRect();
      const centroX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - rect.left;
      const centroY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - rect.top;

      const imgX = (centroX - posX) / escala;
      const imgY = (centroY - posY) / escala;

      escala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, escala * factor));

      posX = centroX - imgX * escala;
      posY = centroY - imgY * escala;

      distanciaAnterior = distNueva;
      mover();
    }
  }, { passive: false });

  visorContenedor.addEventListener("touchend", () => { arrastrando = false; });
})();