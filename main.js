// main.js - versión completa con cifrado AES + firma digital (SHA-256)
// Compatible con index.html y recibir.html

document.addEventListener("DOMContentLoaded", () => {
  // Elementos comunes
  const btnCifrar = document.getElementById("btnCifrar");
  const btnNuevo = document.getElementById("btnNuevo");
  const btnCopiar = document.getElementById("btnCopiar");
  const mensajeInput = document.getElementById("mensaje");
  const claveInput = document.getElementById("clave");
  const enlaceCifradoCont = document.getElementById("enlaceCifrado");
  const formulario = document.getElementById("formulario");
  const resultado = document.getElementById("resultado");

  // --- Funciones auxiliares ---
  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function construirUrlRecibir(hashTexto) {
    const url = new URL("recibir.html#" + encodeURIComponent(hashTexto), window.location.href);
    return url.href;
  }

  // Crear "firma digital" simulada (hash SHA-256 del mensaje + clave)
  function generarFirmaDigital(mensaje, clave) {
    const data = mensaje + clave;
    const hash = CryptoJS.SHA256(data).toString();
    return hash;
  }

  // Verificar firma digital
  function verificarFirmaDigital(mensaje, clave, firmaOriginal) {
    const nuevaFirma = generarFirmaDigital(mensaje, clave);
    return nuevaFirma === firmaOriginal;
  }

  // --- CIFRADO (index.html) ---
  if (btnCifrar) {
    btnCifrar.addEventListener("click", () => {
      const mensaje = mensajeInput.value.trim();
      const clave = claveInput.value.trim();

      if (!mensaje || !clave) {
        alert("Por favor, completa el mensaje y la clave.");
        return;
      }

      // Cifrar mensaje con AES
      const cifrado = CryptoJS.AES.encrypt(mensaje, clave).toString();

      // Generar firma digital (integridad)
      const firma = generarFirmaDigital(mensaje, clave);

      // Crear objeto que combine mensaje cifrado + firma
      const paqueteSeguro = JSON.stringify({
        data: cifrado,
        firma: firma,
      });

      // Construir enlace
      const enlaceHref = construirUrlRecibir(btoa(paqueteSeguro));

      // Mostrar enlace cifrado
      enlaceCifradoCont.innerHTML = "";
      const a = document.createElement("a");
      a.href = enlaceHref;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = enlaceHref;
      a.style.wordBreak = "break-all";
      enlaceCifradoCont.appendChild(a);

      // Cambiar secciones
      formulario.style.display = "none";
      resultado.style.display = "block";
    });
  }

  // --- COPIAR ENLACE ---
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

  // --- NUEVO MENSAJE ---
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

  // --- DESCIFRADO (recibir.html) ---
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
        resultadoTexto.innerHTML = `<div class="tarjeta error">❌ No hay mensaje en la URL.</div>`;
        return;
      }

      try {
        const paqueteSeguro = JSON.parse(atob(hashFragment));
        const cifrado = paqueteSeguro.data;
        const firmaOriginal = paqueteSeguro.firma;

        // Descifrar
        const bytes = CryptoJS.AES.decrypt(cifrado, clave);
        const mensajeDescifrado = bytes.toString(CryptoJS.enc.Utf8);

        if (!mensajeDescifrado) {
          resultadoTexto.innerHTML = `<div class="tarjeta error">❌ Clave incorrecta o mensaje dañado.</div>`;
          return;
        }

        // Verificar integridad con firma
        const esValido = verificarFirmaDigital(mensajeDescifrado, clave, firmaOriginal);

        if (!esValido) {
          resultadoTexto.innerHTML = `<div class="tarjeta error">⚠️ Mensaje alterado o firma inválida.</div>`;
          return;
        }

        // Mostrar mensaje descifrado y botón
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
      } catch (e) {
        resultadoTexto.innerHTML = `<div class="tarjeta error">❌ Error al procesar el mensaje.</div>`;
      }
    });
  }

  // --- BOTÓN CREAR MI PROPIO MENSAJE (recibir.html) ---
  const botonNuevo = document.getElementById("boton-nuevo");
  if (botonNuevo) {
    botonNuevo.addEventListener("click", () => (window.location.href = "index.html"));
  }
});

