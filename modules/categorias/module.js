// modules/categorias/module.js — Gestión de categorías
var ModCategorias = {
  id: 'categorias',
  titulo: 'Categor\u00edas',
  icono: 'bi bi-tags',

  _datos: [],

  render: function() {
    return '' +
      '<div x-data="categoriasData()" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<div class="flex flex-wrap items-center justify-between gap-3 mb-6">' +
          '<h2 class="text-2xl font-bold flex items-center gap-2">' +
            '<i class="bi bi-tags text-primary"></i> Categorías' +
          '</h2>' +
          '<button class="btn btn-primary" onclick="ModCategorias.abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Nueva categoría' +
          '</button>' +
        '</div>' +

        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="cat-grid">' +
          '<div class="skeleton h-24 w-full"></div>' +
          '<div class="skeleton h-24 w-full"></div>' +
          '<div class="skeleton h-24 w-full"></div>' +
          '<div class="skeleton h-24 w-full"></div>' +
        '</div>' +

        '<div id="cat-empty" class="hidden flex flex-col items-center justify-center py-16 text-base-content/50">' +
          '<i class="bi bi-tags text-6xl mb-4"></i>' +
          '<p class="text-lg mb-4">No hay categorías personalizadas</p>' +
          '<button class="btn btn-primary" onclick="ModCategorias.abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Crear primera' +
          '</button>' +
        '</div>' +
      '</div>';
  },

  init: function() {
    this._cargarDatos();
  },

  destroy: function() {
    this._datos = [];
  },

  _cargarDatos: function() {
    var self = this;
    db.categorias.toArray().then(function(cats) {
      self._datos = cats;
      self._renderGrid(cats);
    });
  },

  _renderGrid: function(cats) {
    var grid = document.getElementById('cat-grid');
    var empty = document.getElementById('cat-empty');
    if (!grid) return;

    if (!cats.length) {
      grid.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (empty) empty.classList.add('hidden');

    var html = '';
    cats.forEach(function(c) {
      var colorClass = c.tipo === 'ingreso' ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5';
      var icono = c.tipo === 'ingreso' ? 'bi-arrow-down-left text-success' : 'bi-arrow-up-right text-error';
      var badgeColor = c.tipo === 'ingreso' ? 'badge-success' : 'badge-error';
      html += '' +
        '<div class="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 hover:shadow-md transition-all ' + colorClass + '">' +
          '<div class="flex items-start justify-between">' +
            '<div class="flex items-center gap-3">' +
              '<div class="w-10 h-10 rounded-lg flex items-center justify-center ' +
                (c.tipo === 'ingreso' ? 'bg-success/10' : 'bg-error/10') + '">' +
                '<i class="bi ' + icono + ' text-lg"></i>' +
              '</div>' +
              '<div>' +
                '<h3 class="font-semibold">' + c.nombre + '</h3>' +
                '<span class="badge badge-sm ' + badgeColor + '">' + c.tipo + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="flex gap-1">' +
              '<button class="btn btn-sm btn-ghost btn-square" onclick="ModCategorias.abrirForm(\'' + c.id + '\')" title="Editar">' +
                '<i class="bi bi-pencil"></i>' +
              '</button>' +
              '<button class="btn btn-sm btn-ghost btn-square text-error" onclick="ModCategorias.eliminar(\'' + c.id + '\')" title="Eliminar">' +
                '<i class="bi bi-trash"></i>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    grid.innerHTML = html;
  },

  abrirForm: function(id) {
    var self = this;
    var editando = !!id;

    if (editando) {
      db.categorias.get(id).then(function(item) {
        if (!item) {
          UI.toast('Categoría no encontrada', 'error');
          return;
        }
        self._mostrarForm(item);
      });
    } else {
      self._mostrarForm(null);
    }
  },

  _mostrarForm: function(item) {
    var editando = !!item;
    var nombre = item ? item.nombre : '';
    var tipo = item ? item.tipo : 'egreso';

    // Verificar si es predefinida
    var predefinidas = ['renta', 'luz', 'mercancía', 'nómina', 'transporte', 'alimentos', 'servicios', 'otros'];
    var esPredefinida = item && predefinidas.indexOf(item.nombre ? item.nombre.toLowerCase() : '') !== -1;

    var html = '' +
      '<div class="space-y-4">' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Nombre</span>' +
          '<input type="text" x-model="nombre" value="' + (nombre || '') + '" class="input input-bordered w-full" required>' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Tipo</span>' +
          '<select x-model="tipo" class="select select-bordered w-full"' +
            (esPredefinida ? ' disabled' : '') + '>' +
            '<option value="egreso" ' + (tipo === 'egreso' ? 'selected' : '') + '>Egreso (Gasto)</option>' +
            '<option value="ingreso" ' + (tipo === 'ingreso' ? 'selected' : '') + '>Ingreso</option>' +
          '</select>' +
        '</label>' +
        (esPredefinida ? '<p class="text-xs text-base-content/40"><i class="bi bi-info-circle"></i> Categoría predefinida — solo puedes editar el nombre</p>' : '') +
      '</div>';

    UI.modalForm(
      editando ? 'Editar categoría' : 'Nueva categoría',
      html,
      function(data) {
        if (editando) {
          return self._actualizar(item.id, data);
        } else {
          return self._guardar(data);
        }
      }
    );
  },

  _guardar: function(datos) {
    if (!datos.nombre || datos.nombre.trim() === '') {
      UI.toast('El nombre es obligatorio', 'warning');
      return Promise.reject(new Error('Nombre requerido'));
    }

    var registro = {
      id: uuid(),
      nombre: datos.nombre.trim(),
      tipo: datos.tipo || 'egreso',
      createdBy: APP_CONFIG.usuarioActual || 'local',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return db.categorias.put(registro).then(function() {
      UI.toast('Categoría guardada', 'success');
      ModCategorias._cargarDatos();
    });
  },

  _actualizar: function(id, datos) {
    return db.categorias.get(id).then(function(existente) {
      if (!existente) {
        UI.toast('Categoría no encontrada', 'error');
        return;
      }

      var actualizado = {
        id: id,
        nombre: datos.nombre ? datos.nombre.trim() : existente.nombre,
        tipo: datos.tipo || existente.tipo,
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };

      return db.categorias.put(actualizado).then(function() {
        UI.toast('Categoría actualizada', 'success');
        ModCategorias._cargarDatos();
      });
    });
  },

  eliminar: function(id) {
    var self = this;
    // Verificar si tiene movimientos asociados
    db.categorias.get(id).then(function(cat) {
      if (!cat) {
        UI.toast('Categoría no encontrada', 'error');
        return;
      }

      // Verificar si es predefinida
      var predefinidas = ['cat-renta', 'cat-luz', 'cat-mercancia', 'cat-nomina', 'cat-transporte', 'cat-alimentos', 'cat-servicios', 'cat-otros-egreso', 'cat-ventas', 'cat-servicios-ingreso', 'cat-otros-ingreso'];
      if (predefinidas.indexOf(id) !== -1) {
        UI.toast('No puedes eliminar categorías predefinidas', 'warning');
        return;
      }

      UI.confirm('¿Eliminar "' + cat.nombre + '"?').then(function(ok) {
        if (!ok) return;
        db.movimientos.filter(function(m) { return m.categoria === cat.nombre; }).count().then(function(count) {
          if (count > 0) {
            return UI.confirm(count + ' movimiento(s) usan esta categoría. ¿Eliminar de todas formas?').then(function(ok2) {
              if (!ok2) return;
              return db.categorias.delete(id);
            });
          }
          return db.categorias.delete(id);
        }).then(function() {
          if (!arguments.length) return; // cancelled
          UI.toast('Categoría eliminada', 'success');
          ModCategorias._cargarDatos();
        }).catch(function(err) {
          UI.toast(err.message || 'Error al eliminar', 'error');
        });
      });
    });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES[ModCategorias.id] = ModCategorias;

document.addEventListener('alpine:init', function() {
  Alpine.data('categoriasData', function() {
    return {
      init: function() {}
    };
  });
});
