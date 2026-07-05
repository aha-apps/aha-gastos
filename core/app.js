// core/app.js — Router hash-based + registro de módulos
window.MODULES = {};

window.appRouter = {
  currentModule: null,
  currentHash: '',

  init: function() {
    var self = this;

    // Escuchar cambios de hash
    window.addEventListener('hashchange', function() {
      self._handleHash();
    });

    // Inicializar red
    if (window.network) {
      window.network.init();
    }

    // Sembrar datos iniciales
    if (window.seedData) {
      window.seedData().then(function() {
        console.log('✅ Seed completado');
      });
    }

    // Manejar hash inicial
    this._handleHash();
  },

  _handleHash: function() {
    var hash = window.location.hash.replace('#', '') || 'dashboard';
    if (hash === this.currentHash) return;
    this.currentHash = hash;
    this.navigate(hash);
  },

  navigate: function(moduleId) {
    var self = this;

    // Destruir módulo anterior
    if (this.currentModule && window.MODULES[this.currentModule]) {
      var oldMod = window.MODULES[this.currentModule];
      if (oldMod.destroy) oldMod.destroy();
    }

    // Actualizar hash sin disparar evento
    if (window.location.hash !== '#' + moduleId) {
      window.location.hash = moduleId;
    }

    this.currentModule = moduleId;

    // Mostrar loading
    var container = document.getElementById('app-content');
    if (!container) return;

    container.innerHTML =
      '<div class="flex items-center justify-center py-20">' +
        '<div class="flex flex-col items-center gap-3">' +
          '<span class="loading loading-spinner loading-lg text-primary"></span>' +
          '<p class="text-sm text-base-content/40">Cargando...</p>' +
        '</div>' +
      '</div>';

    // Cargar y renderizar módulo
    var mod = window.MODULES[moduleId];
    if (!mod) {
      container.innerHTML = '<div class="alert alert-error m-4">M\u00f3dulo no encontrado: ' + moduleId + '</div>';
      return;
    }

    // Renderizar
    var result = mod.render();
    if (result && typeof result.then === 'function') {
      result.then(function(html) {
        container.innerHTML = html;
        if (mod.init) mod.init();
        document.dispatchEvent(new CustomEvent('module-change', { detail: { module: moduleId } }));
      }).catch(function(err) {
        container.innerHTML = '<div class="alert alert-error m-4">' +
          '<i class="bi bi-exclamation-triangle"></i>' +
          '<span>' + (err.message || 'Error al cargar m\u00f3dulo') + '</span></div>';
      });
    } else {
      container.innerHTML = result || '';
      if (mod.init) mod.init();
      document.dispatchEvent(new CustomEvent('module-change', { detail: { module: moduleId } }));
    }
  },

  refreshCurrent: function() {
    if (this.currentModule) {
      this.navigate(this.currentModule);
    }
  },

  registerModule: function(mod) {
    if (mod && mod.id) {
      window.MODULES[mod.id] = mod;
    }
  }
};
