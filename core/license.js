// core/license.js — Verificador de licencias AHA
(function() {
  // APP_CONFIG ya fue cargado desde project.config.js (antes que este script)
  // En development, todo abierto
  if (window.ENV === 'development') {
    console.log('🔓 Entorno development — licencia desbloqueada');
    if (!window.APP_CONFIG) window.APP_CONFIG = {};
    APP_CONFIG.plan = 'lite';
    APP_CONFIG.maxRecords = 30;
    APP_CONFIG.canExport = false;
    APP_CONFIG.canWhiteLabel = false;
    APP_CONFIG.iaTier = 'lite';
    return;
  }

  // En producción, verificar licencia .aha
  window.checkLicense = function() {
    var stored = localStorage.getItem('aha_license_' + APP_ID);
    if (stored) {
      try {
        var licencia = JSON.parse(stored);
        aplicarLicencia(licencia);
        return true;
      } catch (e) {
        console.warn('Licencia almacenada inv\u00e1lida');
      }
    }
    // Plan Lite por defecto
    APP_CONFIG.plan = 'lite';
    APP_CONFIG.maxRecords = 30;
    APP_CONFIG.canExport = false;
    APP_CONFIG.canWhiteLabel = false;
    APP_CONFIG.iaTier = 'lite';
    return false;
  };

  window.cargarLicencia = function() {
    return new Promise(function(resolve) {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.aha';
      input.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return resolve(false);
        var reader = new FileReader();
        reader.onload = function(ev) {
          try {
            var licencia = JSON.parse(ev.target.result);
            localStorage.setItem('aha_license_' + APP_ID, JSON.stringify(licencia));
            aplicarLicencia(licencia);
            UI.toast('Licencia aplicada: ' + licencia.plan, 'success');
            resolve(true);
          } catch (err) {
            UI.toast('Archivo de licencia inv\u00e1lido', 'error');
            resolve(false);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  };

  function aplicarLicencia(licencia) {
    APP_CONFIG.plan = licencia.plan || 'lite';
    APP_CONFIG.customer = licencia.customer || null;

    if (licencia.plan === 'lite') {
      APP_CONFIG.maxRecords = 30;
      APP_CONFIG.canExport = false;
      APP_CONFIG.canWhiteLabel = false;
      APP_CONFIG.iaTier = 'lite';
    } else if (licencia.plan === 'profesional') {
      APP_CONFIG.maxRecords = Infinity;
      APP_CONFIG.canExport = true;
      APP_CONFIG.canWhiteLabel = false;
      APP_CONFIG.iaTier = 'full';
    } else if (licencia.plan === 'enterprise') {
      APP_CONFIG.maxRecords = Infinity;
      APP_CONFIG.canExport = true;
      APP_CONFIG.canWhiteLabel = true;
      APP_CONFIG.iaTier = 'full';
    }
  }

  // Ejecutar al cargar
  if (window.ENV !== 'development') {
    window.checkLicense();
  }
})();
