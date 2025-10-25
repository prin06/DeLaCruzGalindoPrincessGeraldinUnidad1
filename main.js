// main.js - versión segura con cifrado AES y verificación SHA-256

document.addEventListener("DOMContentLoaded", () => {
  // --- CAMBIO: Content Security Policy para proteger scripts externos ---
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com;";
  document.head.appendChild(meta);

  // Elementos comunes
  const btnCifrar = document.getElementById("btnCifrar");
  const btnNuevo = document.getElementById("btnNuevo");
  const btnCopiar = document.getElementById("btnCopiar");
  const mensajeInput = document.getElementById("mensaje");
  const claveInput = document.getElementById("clave");
  const enlaceCifradoCont = document.getElementById("enlaceCifrado");
  const formulario = document.getElementById("formulario");
  const resultado = document.getElementById("resultado");

  // Funciones auxiliares
  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // --- CAMBIO: construcción segura de la URL ---
  function construirUrlRecibir(hashTexto) {
    const base = window.location.origin + window.location.pathname.replace("index.html", "");
    const url = base + "recibir.html#" + encodeURIComponent(hashTexto);
    return url;
  }

  // Hash SHA-256 como firma digital
  function generarFirmaDigital(mensaje, clave) {
    const data = mensaje + clave;
    return CryptoJS.SHA256(data).toString();
  }

  function verificarFirmaDigital(mensaje, clave, firmaOriginal) {
    return generarFirmaDigital(mensaje, clave) === firmaOriginal;
  }

  // Cifrado (index.html)
  if (btnCifrar) {
    btnCifrar.addEventListener("click", () => {
      const mensaje = mensajeInput.value.trim();
      const clave = claveInput.value.trim();

      if (!mensaje || !clave) {
        alert("Por favor, completa el mensaje y la clave.");
        return;
      }

      // --- CAMBIO: validación de longitud de clave ---
      if (clave.length < 6) {
        alert("La clave debe tener al menos 6 caracteres para mayor seguridad.");
        return;
      }

      const cifrado = CryptoJS.AES.encrypt(mensaje, clave).toString();
      const firma = generarFirmaDigital(mensaje, clave);

      const paqueteSeguro = JSON.stringify({ data: cifrado, firma });
      const enlaceHref = construirUrlRecibir(btoa(paqueteSeguro));

      enlaceCifradoCont.innerHTML = "";
      const a = document.createElement("a");
      a.href = enlaceHref;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = enlaceHref;
      a.style.wordBreak = "break-all";
      enlaceCifradoCont.appendChild(a);

      formulario.style.display = "none";
      resultado.style.display = "block";
    });
  }

  // Copiar enlace
  if (btnCopiar) {
    btnCopiar.addEventListener("click", async () => {
      try {
        const a = enlaceCifradoCont.querySelector("a");
        const texto = a ? a.href : enlaceCifradoCont.textContent || "";
        if (!texto) return;

        await navigator.clipboard.writeText(texto);
        btnCopiar.textContent = "¡Copiado!";
        setTimeout(() => (btnCopiar.textContent = "Copiar enlace"), 1500);
      } catch {
        alert("No se pudo copiar automáticamente. Copia manualmente el enlace.");
      }
    });
  }

  // Nuevo mensaje
  if (btnNuevo) {
    btnNuevo.addEventListener("click", () => {
      mensajeInput.value = "";
      claveInput.value = "";
      resultado.style.display = "none";
      formulario.style.display = "block";
      enlaceCifradoCont.innerHTML = "";
      btnCopiar.textContent = "Copiar enlace";
    });
  }

  // Descifrado (recibir.html)
  const btnDescifrar = document.getElementById("btnDescifrar");
  const resultadoTexto = document.getElementById("resultado");
  const claveDescifrar = document.getElementById("claveDescifrar");
  const hashFragment = decodeURIComponent(window.location.hash.substring(1));

  if (btnDescifrar) {
    btnDescifrar.addEventListener("click", () => {
      const clave = claveDescifrar.value.trim();
      if (!clave) {
        alert("Por favor, introduce la clave.");
        return;
      }

      if (!hashFragment) {
        resultadoTexto.innerHTML = `<div class="tarjeta error">No hay mensaje en la URL.</div>`;
        return;
      }

      try {
        const paqueteSeguro = JSON.parse(atob(hashFragment));
        const cifrado = paqueteSeguro.data;
        const firmaOriginal = paqueteSeguro.firma;

        const bytes = CryptoJS.AES.decrypt(cifrado, clave);
        const mensajeDescifrado = bytes.toString(CryptoJS.enc.Utf8);

        if (!mensajeDescifrado) {
          resultadoTexto.innerHTML = `<div class="tarjeta error">Clave incorrecta.</div>`;
          return;
        }

        const esValido = verificarFirmaDigital(mensajeDescifrado, clave, firmaOriginal);
        if (!esValido) {
          resultadoTexto.innerHTML = `<div class="tarjeta error">Mensaje alterado o firma inválida.</div>`;
          return;
        }

        const seccion = document.getElementById("seccion-descifrar");
        if (seccion) {
          const inputs = seccion.querySelectorAll("input, button");
          inputs.forEach(el => el.style.display = "none");

          resultadoTexto.innerHTML = `<div class="tarjeta exito">${escapeHtml(mensajeDescifrado)}</div>`;
          const contBoton = document.createElement("div");
          contBoton.className = "contenedor-boton";
          const boton = document.createElement("button");
          boton.className = "boton-nuevo";
          boton.textContent = "Crear mi propio mensaje";
          boton.addEventListener("click", () => (window.location.href = "index.html"));
          contBoton.appendChild(boton);
          seccion.appendChild(contBoton);
        }
      } catch {
        resultadoTexto.innerHTML = `<div class="tarjeta error">Error al procesar el mensaje.</div>`;
      }
    });
  }

  // Botón crear nuevo mensaje en recibir.html
  const botonNuevo = document.getElementById("boton-nuevo");
  if (botonNuevo) {
    botonNuevo.addEventListener("click", () => (window.location.href = "index.html"));
  }
});


