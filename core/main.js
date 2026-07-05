// core/main.js — Punto de entrada, inicialización global
(function() {
  var ready = function() {
    console.log('🚀 AHA Gastos iniciando...');

    // Verificar que dependencias globales existen
    var deps = ['Dexie', 'CryptoJS', 'Alpine', 'pako'];
    var faltantes = [];
    deps.forEach(function(dep) {
      if (typeof window[dep] === 'undefined') {
        faltantes.push(dep);
      }
    });

    if (faltantes.length) {
      console.error('❌ Librerías faltantes:', faltantes.join(', '));
      document.getElementById('app').innerHTML =
        '<div class="flex items-center justify-center min-h-screen bg-base-200">' +
          '<div class="alert alert-error max-w-md shadow-lg">' +
            '<i class="bi bi-exclamation-triangle-fill"></i>' +
            '<span>Error: Librerías faltantes: ' + faltantes.join(', ') + '. Verifica la conexión a internet para la carga inicial.</span>' +
          '</div>' +
        '</div>';
      return;
    }

    // Arrancar router
    if (window.appRouter) {
      window.appRouter.init();
    }

    console.log('✅ AHA Gastos listo');
  };

  // Esperar a que Alpine esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
