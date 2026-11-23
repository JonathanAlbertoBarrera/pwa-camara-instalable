// FRAGMENTO B: EVENTO DE INSTALACIÓN.
let eventoInstalacionDiferido = null;


window.addEventListener('beforeinstallprompt', (event) => {
  // Evita que el mini-banner automático aparezca antes de tiempo
  event.preventDefault();
  eventoInstalacionDiferido = event;


  // Muestra tu botón personalizado de instalación en la UI
  const btnInstalar = document.getElementById('btn-instalar');
  btnInstalar.hidden = false;
});

// FRAGMENTO C: LIBERAR EL HARDWARE.
let streamActual = null;
let modoCamaraActual = 'environment'; // 'environment' = trasera | 'user' = frontal


function detenerCamaraActiva(){
  if (streamActual) {
    streamActual.getTracks().forEach((track) => {
      track.stop();
    });
    streamActual = null;
  }
}

let solicitandoCamara = false;
const visorVideo = document.getElementById('visor-camara');

function actualizarMensajeEstado(mensaje) {
  document.getElementById('mensaje-estado').textContent = mensaje;
  document.getElementById('btn-alternar-camara').disabled = !streamActual || solicitandoCamara;
  document.getElementById('btn-apagar-camara').disabled = !streamActual || solicitandoCamara;
}

// FRAGMENTO D: ENCENDER Y DIAGNOSTICAR ERRORES.
function iniciarCamara(modo){
  detenerCamaraActiva();


  const restricciones = {
    video: { facingMode: modo },
    audio: false
  };


  return navigator.mediaDevices.getUserMedia(restricciones)
    .then((stream) => {
      streamActual = stream;
      const visorVideo = document.getElementById('visor-camara');
      visorVideo.srcObject = stream;
      actualizarMensajeEstado(`Cámara activa (${modo === 'environment' ? 'Trasera' : 'Frontal'})`);
    })
    .catch((error) => {
      if (error.name === 'NotAllowedError') {
        actualizarMensajeEstado('Permiso denegado. Habilita el acceso a la cámara en los ajustes de tu navegador.');
      } else if (error.name === 'NotFoundError') {
        actualizarMensajeEstado('No se detectó el sensor de cámara solicitado en este dispositivo.');
      } else {
        actualizarMensajeEstado(`Error al acceder al hardware: ${error.message}`);
      }
    });
}

// APOYO AL DESAFÍO 2: EVITAR SOLICITUDES SIMULTÁNEAS.
function solicitarCamara() {
  if (solicitandoCamara) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    actualizarMensajeEstado('La cámara necesita HTTPS o localhost y un navegador compatible.');
    return;
  }
  solicitandoCamara = true;
  document.getElementById('btn-preparar-camara').disabled = true;
  document.getElementById('btn-confirmar-permiso').disabled = true;
  actualizarMensajeEstado('Esperando acceso a la cámara...');
  return iniciarCamara(modoCamaraActual).finally(() => {
    solicitandoCamara = false;
    document.getElementById('btn-preparar-camara').disabled = false;
    document.getElementById('btn-confirmar-permiso').disabled = false;
    actualizarMensajeEstado(document.getElementById('mensaje-estado').textContent);
  });
}

// FRAGMENTO E: CONSENTIMIENTO ANTES DE PEDIR EL PERMISO NATIVO.
// Paso 1: El usuario pulsa "Solicitar Acceso a Cámara" -> Mostramos aviso explicativo
document.getElementById('btn-preparar-camara').addEventListener('click', () => {
  document.getElementById('aviso-permiso').hidden = false;
});


// Paso 2: El usuario lee el motivo y pulsa "Aceptar y Encender Cámara"
document.getElementById('btn-confirmar-permiso').addEventListener('click', () => {
  document.getElementById('aviso-permiso').hidden = true;
  solicitarCamara();
});

document.getElementById('btn-cancelar-permiso').addEventListener('click', () => {
  document.getElementById('aviso-permiso').hidden = true;
});

// DESAFÍO 2: ALTERNAR LOS LENTES.
document.getElementById('btn-alternar-camara').addEventListener('click', () => {
  if (!streamActual || solicitandoCamara) return;
  modoCamaraActual = modoCamaraActual === 'environment' ? 'user' : 'environment';
  solicitarCamara();
});

// DESAFÍO 2: APAGAR Y LIMPIAR EL VIDEO.
document.getElementById('btn-apagar-camara').addEventListener('click', () => {
  detenerCamaraActiva();
  visorVideo.srcObject = null;
  actualizarMensajeEstado('Cámara apagada.');
});

// DESAFÍO 1: INSTALAR DESDE EL BOTÓN.
document.getElementById('btn-instalar').addEventListener('click', () => {
  if (!eventoInstalacionDiferido) return;
  const evento = eventoInstalacionDiferido;
  eventoInstalacionDiferido = null;
  evento.prompt()
    .then(() => evento.userChoice)
    .then((resultado) => {
      document.getElementById('btn-instalar').hidden = true;
      if (resultado.outcome === 'accepted') actualizarMensajeEstado('Instalación aceptada.');
    })
    .catch((error) => {
      document.getElementById('btn-instalar').hidden = true;
      actualizarMensajeEstado('No se pudo instalar: ' + error.message);
    });
});

window.addEventListener('appinstalled', () => {
  eventoInstalacionDiferido = null;
  document.getElementById('btn-instalar').hidden = true;
});

window.addEventListener('pagehide', () => {
  detenerCamaraActiva();
  visorVideo.srcObject = null;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch((error) => {
    actualizarMensajeEstado('No se pudo registrar el modo offline: ' + error.message);
  });
}

