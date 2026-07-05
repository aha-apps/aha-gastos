// core/search-palette.js — Command Palette (Cmd+K) global
(function() {
  if (typeof Alpine === 'undefined') return;

  document.addEventListener('alpine:init', function() {
    Alpine.data('searchPalette', function() {
      return {
        open: false,
        query: '',
        selectedIdx: 0,
        keyboardNav: false,
        items: [],

        init: function() {
          var self = this;
          this._buildItems();

          // Watch for module load/unload
          document.addEventListener('module-change', function() {
            self._buildItems();
          });
        },

        _buildItems: function() {
          var mods = [];
          if (window.MODULES) {
            for (var id in window.MODULES) {
              if (window.MODULES.hasOwnProperty(id)) {
                var mod = window.MODULES[id];
                if (APP_CONFIG.modulos[id] && APP_CONFIG.modulos[id].activo) {
                  mods.push({
                    type: 'module',
                    id: id,
                    title: mod.titulo || APP_CONFIG.modulos[id].titulo,
                    icon: mod.icono || APP_CONFIG.modulos[id].icono || 'bi bi-box',
                    subtitle: 'Ir al m\u00f3dulo',
                    action: function() {
                      if (window.appRouter) window.appRouter.navigate(id);
                    }
                  });
                }
              }
            }
          }
          this.items = mods;
        },

        get filtered() {
          var self = this;
          if (!this.query || this.query.length < 2) {
            return this.items;
          }
          var q = this.query.toLowerCase();
          var results = [];
          this.items.forEach(function(item) {
            if (item.title.toLowerCase().indexOf(q) !== -1) {
              results.push(item);
            }
          });

          // Buscar registros si IA está activa
          if (results.length < 10 && window.ia && window.ia.search) {
            results.push({ type: 'separator', title: '' });
            // Podría integrar búsqueda IA aquí
          }

          return results;
        },

        get hasResults() {
          return this.filtered.length > 0;
        },

        openPalette: function() {
          this.open = true;
          this.query = '';
          this.selectedIdx = 0;
          this.keyboardNav = false;
          var self = this;
          setTimeout(function() {
            var input = document.querySelector('.sp-search-input');
            if (input) input.focus();
          }, 50);
        },

        closePalette: function() {
          this.open = false;
          this.query = '';
        },

        selectItem: function(item) {
          if (item && item.action) {
            item.action();
            this.closePalette();
          }
        },

        onKeydown: function(e) {
          if (!this.open) return;
          if (e.key === 'Escape') {
            this.closePalette();
            return;
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            var items = this.filtered;
            var maxIdx = items.length - 1;
            this.selectedIdx = Math.min(this.selectedIdx + 1, maxIdx);
            this.keyboardNav = true;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIdx = Math.max(0, this.selectedIdx - 1);
            this.keyboardNav = true;
          }
          if (e.key === 'Enter') {
            e.preventDefault();
            var filtered = this.filtered;
            if (filtered.length > 0 && this.selectedIdx >= 0 && this.selectedIdx < filtered.length) {
              this.selectItem(filtered[this.selectedIdx]);
            }
          }
        }
      };
    });
  });
})();
