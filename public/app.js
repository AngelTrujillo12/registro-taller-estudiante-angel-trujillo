const formulario = document.querySelector("#formulario-registro");
const lista = document.querySelector("#lista-inscripciones");
const mensaje = document.querySelector("#mensaje");
let idEnEdicion = null;

async function cargarInscripciones() {
  try {
    const respuesta = await fetch("/api/inscripciones");
    const filas = await respuesta.json();
    
    lista.replaceChildren();

    if (filas.length === 0) {
      lista.innerHTML = "<p>Todavía no hay inscripciones para reportar.</p>";
      return;
    }

    filas.forEach((fila) => {
      const item = document.createElement("div");
      item.className = "item-inscripcion";

      const texto = document.createElement("div");
      texto.innerHTML = `<strong>${fila.nombre}</strong> — ${fila.taller}<br>
        <small>${fila.modalidad} | Horario: ${fila.horario} | Nivel: ${fila.nivel_experiencia} | ${fila.correo}</small>`;

      const acciones = document.createElement("div");
      
      const editar = document.createElement("button");
      editar.type = "button";
      editar.textContent = "Editar";
      editar.className = "btn-editar";
      editar.addEventListener("click", () => prepararEdicion(fila));

      const borrar = document.createElement("button");
      borrar.type = "button";
      borrar.textContent = "Eliminar";
      borrar.className = "btn-eliminar";
      borrar.addEventListener("click", () => eliminarInscripcion(fila.id));

      acciones.append(editar, borrar);
      item.append(texto, acciones);
      lista.append(item);
    });
  } catch (error) {
    console.error("Error al cargar:", error);
  }
}

function prepararEdicion(fila) {
  idEnEdicion = fila.id;
  Object.entries(fila).forEach(([campo, valor]) => {
    const control = formulario.elements.namedItem(campo);
    if (control) control.value = valor;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function eliminarInscripcion(id) {
  const respuesta = await fetch(`/api/inscripciones/${id}`, { method: "DELETE" });
  const resultado = await respuesta.json();
  mensaje.textContent = resultado.mensaje || resultado.error;
  if (respuesta.ok) {
    await cargarInscripciones();
    await cargarReportes();
  }
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  const datos = Object.fromEntries(new FormData(formulario));
  const metodo = idEnEdicion ? "PUT" : "POST";
  const ruta = idEnEdicion ? `/api/inscripciones/${idEnEdicion}` : "/api/inscripciones";

  const respuesta = await fetch(ruta, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });

  const resultado = await respuesta.json();

  if (respuesta.ok) {
    formulario.reset();
    idEnEdicion = null;
    mensaje.textContent = resultado.mensaje;
    await cargarInscripciones();
    await cargarReportes();
  } else {
    mensaje.textContent = resultado.error;
  }
});

async function cargarReportes() {
  try {
    const respuesta = await fetch("/api/reportes/resumen");
    const datos = await respuesta.json();

    document.querySelector("#total").textContent = datos.total;

    renderizarBarra("#reporte-talleres", datos.porTaller, "taller");
    renderizarBarra("#reporte-horarios", datos.porHorario, "horario");
    renderizarBarra("#reporte-modalidades", datos.porModalidad, "modalidad");
  } catch (error) {
    console.error("Error al cargar reportes:", error);
  }
}

function renderizarBarra(selector, arrDatos, campoClave) {
  const contenedor = document.querySelector(selector);
  contenedor.replaceChildren();

  if (arrDatos.length === 0) {
    contenedor.innerHTML = "<li>Sin registros</li>";
    return;
  }

  const mayor = Math.max(...arrDatos.map((fila) => Number(fila.cantidad)), 1);

  arrDatos.forEach((fila) => {
    const item = document.createElement("li");
    const etiqueta = document.createElement("p");
    etiqueta.textContent = `${fila[campoClave]}: ${fila.cantidad}`;

    const fondo = document.createElement("div");
    fondo.className = "barra-fondo";

    const barra = document.createElement("div");
    barra.className = "barra";
    barra.style.width = `${(Number(fila.cantidad) / mayor) * 100}%`;

    fondo.append(barra);
    item.append(etiqueta, fondo);
    contenedor.append(item);
  });
}

cargarInscripciones();
cargarReportes();