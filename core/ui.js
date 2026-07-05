// core/ui.js — Sistema de UI reutilizable
window.UI = {
  toast: function(msg, tipo, duracion) {
    if (!tipo) tipo = 'info';
    if (!duracion) duracion = 4000;
    var colores = {
      success: 'alert-success',
      error: 'alert-error',
      warning: 'alert-warning',
      info: 'alert-info'
    };
    var iconos = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    var contenedor = document.getElementById('toast-container');
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = 'toast-container';
      contenedor.className = 'toast toast-top toast-end z-[100]';
      document.body.appendChild(contenedor);
    }
    var alerta = document.createElement('div');
    alerta.className = 'alert ' + (colores[tipo] || 'alert-info') + ' flex items-center gap-2 shadow-lg animate__animated animate__fadeInRight';
    alerta.innerHTML = '<i class="bi ' + (iconos[tipo] || iconos.info) + '"></i><span>' + msg + '</span>';
    contenedor.appendChild(alerta);
    setTimeout(function() {
      if (alerta.parentNode) {
        alerta.classList.remove('animate__fadeInRight');
        alerta.classList.add('animate__fadeOutRight');
        setTimeout(function() {
          if (alerta.parentNode) alerta.parentNode.removeChild(alerta);
        }, 500);
      }
    }, duracion);
  },

  confirm: function(msg, titulo) {
    if (!titulo) titulo = 'Confirmar';
    return new Promise(function(resolve) {
      var backdrop = document.createElement('div');
      backdrop.className = 'fixed inset-0 z-[70] flex items-center justify-center bg-base-300/60 backdrop-blur-sm animate__animated animate__fadeIn';
      backdrop.innerHTML =
        '<div class="modal-box max-w-sm animate__animated animate__zoomIn">' +
          '<h3 class="text-lg font-bold mb-2">' + titulo + '</h3>' +
          '<p class="py-2 text-base-content/70">' + msg + '</p>' +
          '<div class="modal-action">' +
            '<button class="btn btn-ghost" id="ui-confirm-no">Cancelar</button>' +
            '<button class="btn btn-primary" id="ui-confirm-yes">Aceptar</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(backdrop);
      var cerrar = function(resultado) {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        resolve(resultado);
      };
      document.getElementById('ui-confirm-yes').addEventListener('click', function() { cerrar(true); });
      document.getElementById('ui-confirm-no').addEventListener('click', function() { cerrar(false); });
      backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) cerrar(false);
      });
    });
  },

  modalForm: function(titulo, html, onSave) {
    var backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 z-[70] flex items-center justify-center p-4 bg-base-300/60 backdrop-blur-sm animate__animated animate__fadeIn';
    backdrop.innerHTML =
      '<div class="modal-box max-w-lg w-full animate__animated animate__zoomIn">' +
        '<form id="ui-modal-form" onsubmit="return false;">' +
          '<h3 class="text-lg font-bold mb-4">' + titulo + '</h3>' +
          '<div class="modal-body space-y-4">' + html + '</div>' +
          '<div class="modal-action">' +
            '<button type="button" class="btn btn-ghost" id="ui-modal-cancel">Cancelar</button>' +
            '<button type="submit" class="btn btn-primary" id="ui-modal-save">' +
              '<span id="ui-modal-save-text">Guardar</span>' +
              '<span id="ui-modal-save-spinner" class="loading loading-spinner loading-sm hidden"></span>' +
            '</button>' +
          '</div>' +
        '</form>' +
      '</div>';
    document.body.appendChild(backdrop);
    var cerrar = function() {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    };
    document.getElementById('ui-modal-cancel').addEventListener('click', cerrar);
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) cerrar();
    });
    document.getElementById('ui-modal-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var formData = {};
      var inputs = backdrop.querySelectorAll('[x-model]');
      inputs.forEach(function(input) {
        var key = input.getAttribute('x-model');
        if (key) formData[key] = input.value;
      });
      // Also capture select, textarea, checkbox
      var selects = backdrop.querySelectorAll('select[x-model]');
      selects.forEach(function(sel) {
        var key = sel.getAttribute('x-model');
        if (key) formData[key] = sel.value;
      });
      var textareas = backdrop.querySelectorAll('textarea[x-model]');
      textareas.forEach(function(ta) {
        var key = ta.getAttribute('x-model');
        if (key) formData[key] = ta.value;
      });
      var saveBtn = document.getElementById('ui-modal-save');
      var saveText = document.getElementById('ui-modal-save-text');
      var saveSpinner = document.getElementById('ui-modal-save-spinner');
      saveBtn.disabled = true;
      saveText.textContent = 'Guardando...';
      if (saveSpinner) saveSpinner.classList.remove('hidden');
      Promise.resolve(onSave(formData)).then(function() {
        cerrar();
      }).catch(function(err) {
        UI.toast(err.message || 'Error al guardar', 'error');
        saveBtn.disabled = false;
        saveText.textContent = 'Guardar';
        if (saveSpinner) saveSpinner.classList.add('hidden');
      });
    });
    // Focus first input
    var firstInput = backdrop.querySelector('input:not([type=hidden])');
    if (firstInput) setTimeout(function() { firstInput.focus(); }, 100);
  },

  loading: function(show) {
    var existing = document.getElementById('ui-loading-overlay');
    if (show) {
      if (existing) return;
      var overlay = document.createElement('div');
      overlay.id = 'ui-loading-overlay';
      overlay.className = 'fixed inset-0 z-[80] flex items-center justify-center bg-base-300/40 backdrop-blur-sm';
      overlay.innerHTML =
        '<div class="flex flex-col items-center gap-3">' +
          '<span class="loading loading-spinner loading-lg text-primary"></span>' +
          '<p class="text-sm text-base-content/60">Procesando...</p>' +
        '</div>';
      document.body.appendChild(overlay);
    } else {
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    }
  },

  formatDate: function(date) {
    if (!date) return '';
    var d = new Date(date);
    if (isNaN(d.getTime())) return '';
    var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var dia = d.getDate();
    var mes = meses[d.getMonth()];
    var anio = d.getFullYear();
    return dia + ' ' + mes + ' ' + anio;
  },

  formatCurrency: function(n) {
    if (n === null || n === undefined) return '$0.00';
    var num = typeof n === 'string' ? parseFloat(n) : n;
    if (isNaN(num)) return '$0.00';
    return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  formatBytes: function(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i >= sizes.length) i = sizes.length - 1;
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatRelative: function(date) {
    if (!date) return '';
    var d = new Date(date);
    if (isNaN(d.getTime())) return '';
    var ahora = new Date();
    var diffMs = ahora - d;
    var diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'hace unos segundos';
    var diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return 'hace ' + diffMin + ' min';
    var diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return 'hace ' + diffHoras + ' h';
    var diffDias = Math.floor(diffHoras / 24);
    if (diffDias < 30) return 'hace ' + diffDias + ' d\u00edas';
    return this.formatDate(date);
  }
};
