// core/theme.js — Inyección de tema DaisyUI emerald + colores personalizados
(function() {
  var colores = APP_CONFIG.tema.colores;
  var root = document.documentElement;

  // Inyectar variables CSS personalizadas sobre el tema emerald
  var css = ':root {';
  for (var key in colores) {
    if (colores.hasOwnProperty(key)) {
      css += '--' + key + ': ' + colores[key] + ';';
    }
  }
  css += '}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Alpine store para tema
  document.addEventListener('alpine:init', function() {
    Alpine.store('theme', {
      modo: APP_CONFIG.tema.modo || 'claro',
      colores: colores,
      toggleModo: function() {
        var html = document.documentElement;
        if (html.getAttribute('data-theme') === 'dark') {
          html.setAttribute('data-theme', 'emerald');
          this.modo = 'claro';
        } else {
          html.setAttribute('data-theme', 'dark');
          this.modo = 'oscuro';
        }
      }
    });
  });
})();
