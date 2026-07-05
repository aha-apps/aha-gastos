// modules/movimientos/module.js — CRUD Ingresos/Egresos
var ModMovimientos = {
  id: 'movimientos',
  titulo: 'Movimientos',
  icono: 'bi bi-arrow-left-right',

  _datos: [],
  _filtroMes: '',
  _filtroCategoria: '',
  _filtroTipo: '',

  render: function() {
    var self = this;
    var ahora = new Date();
    var mesActual = ahora.getFullYear() + '-' + ((ahora.getMonth() + 1) < 10 ? '0' : '') + (ahora.getMonth() + 1);
    this._filtroMes = mesActual;

    // Cargar categorías para los filtros
    var html = '' +
      '<div x-data="movimientosData()" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<div class="flex flex-wrap items-center justify-between gap-3 mb-4">' +
          '<h2 class="text-2xl font-bold flex items-center gap-2">' +
            '<i class="bi bi-arrow-left-right text-primary"></i> Movimientos' +
          '</h2>' +
          '<button class="btn btn-primary" onclick="ModMovimientos.abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Agregar' +
          '</button>' +
        '</div>' +

        <!-- Filtros -->
        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<input type="month" class="input input-bordered input-sm" id="filtro-mes" ' +
            'value="' + mesActual + '" onchange="ModMovimientos._filtroMes=this.value;ModMovimientos._filtrar()">' +
          '<select class="select select-bordered select-sm" id="filtro-categoria" onchange="ModMovimientos._filtroCategoria=this.value;ModMovimientos._filtrar()">' +
            '<option value="">Todas las categorías</option>' +
          '</select>' +
          '<select class="select select-bordered select-sm" id="filtro-tipo" onchange="ModMovimientos._filtroTipo=this.value;ModMovimientos._filtrar()">' +
            '<option value="">Todos los tipos</option>' +
            '<option value="ingreso">Ingresos</option>' +
            '<option value="egreso">Egresos</option>' +
          '</select>' +
          '<span class="badge badge-ghost badge-sm self-center" id="mov-count">0 registros</span>' +
        '</div>' +

        <!-- Tabla -->
        '<div class="overflow-x-auto bg-base-100 rounded-xl shadow-sm border border-base-200">' +
          '<table class="table table-zebra">' +
            '<thead>' +
              '<tr>' +
                '<th>Fecha</th>' +
                '<th>Tipo</th>' +
                '<th>Categoría</th>' +
                '<th>Monto</th>' +
                '<th>Nota</th>' +
                '<th class="text-right">Acciones</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="mov-tbody">' +
              '<tr><td colspan="6" class="text-center py-8 text-base-content/40">' +
                '<div class="skeleton h-8 w-full"></div>' +
                '<div class="skeleton h-8 w-full mt-2"></div>' +
                '<div class="skeleton h-8 w-full mt-2"></div>' +
              '</td></tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +

        <!-- Empty state (hidden by default) -->
        '<div id="mov-empty" class="hidden flex flex-col items-center justify-center py-16 text-base-content/50">' +
          '<i class="bi bi-arrow-left-right text-6xl mb-4"></i>' +
          '<p class="text-lg mb-4">No hay movimientos</p>' +
          '<button class="btn btn-primary" onclick="ModMovimientos.abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Agregar primero' +
          '</button>' +
        '</div>' +
      '</div>';

    return html;
  },

  init: function() {
    this._cargarCategorias();
    this._filtrar();
  },

  destroy: function() {
    this._datos = [];
  },

  _cargarCategorias: function() {
    var self = this;
    db.categorias.toArray().then(function(cats) {
      var sel = document.getElementById('filtro-categoria');
      if (!sel) return;
      var html = '<option value="">Todas las categorías</option>';
      cats.forEach(function(c) {
        html += '<option value="' + c.nombre + '">' + c.nombre + '</option>';
      });
      sel.innerHTML = html;
    });
  },

  _filtrar: function() {
    var self = this;
    var mesFiltro = this._filtroMes;
    var catFiltro = this._filtroCategoria;
    var tipoFiltro = this._filtroTipo;

    db.movimientos.toArray().then(function(todos) {
      var filtrados = todos.filter(function(m) {
        if (mesFiltro) {
          var f = (m.fecha || '').toString();
          if (f.indexOf(mesFiltro) === -1) return false;
        }
        if (catFiltro && m.categoria !== catFiltro) return false;
        if (tipoFiltro && m.tipo !== tipoFiltro) return false;
        return true;
      });

      // Ordenar por fecha descendente
      filtrados.sort(function(a, b) {
        return new Date(b.fecha || 0) - new Date(a.fecha || 0);
      });

      self._datos = filtrados;
      self._renderTabla(filtrados);
    });
  },

  _renderTabla: function(datos) {
    var tbody = document.getElementById('mov-tbody');
    var empty = document.getElementById('mov-empty');
    var count = document.getElementById('mov-count');

    if (!tbody) return;

    if (count) count.textContent = datos.length + ' registros';

    if (!datos.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-base-content/40">Sin resultados</td></tr>';
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (empty) empty.classList.add('hidden');

    var html = '';
    datos.forEach(function(m) {
      var monto = parseFloat(m.monto) || 0;
      var signo = m.tipo === 'ingreso' ? '+' : '-';
      var color = m.tipo === 'ingreso' ? 'text-success' : 'text-error';
      var badgeColor = m.tipo === 'ingreso' ? 'badge-success' : 'badge-error';
      html += '<tr>' +
        '<td class="text-sm">' + UI.formatDate(m.fecha) + '</td>' +
        '<td><span class="badge badge-sm ' + badgeColor + '">' + m.tipo + '</span></td>' +
        '<td>' + (m.categoria || '-') + '</td>' +
        '<td class="font-semibold ' + color + '">' + signo + UI.formatCurrency(monto) + '</td>' +
        '<td class="text-sm text-base-content/60 max-w-[150px] truncate">' + (m.nota || '-') + '</td>' +
        '<td class="text-right">' +
          '<button class="btn btn-sm btn-ghost" onclick="ModMovimientos.abrirForm(\'' + m.id + '\')" title="Editar">' +
            '<i class="bi bi-pencil"></i>' +
          '</button>' +
          '<button class="btn btn-sm btn-ghost text-error" onclick="ModMovimientos.eliminar(\'' + m.id + '\')" title="Eliminar">' +
            '<i class="bi bi-trash"></i>' +
          '</button>' +
        '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  },

  abrirForm: function(id) {
    var self = this;
    var editando = !!id;

    // Cargar categorías para el select
    db.categorias.toArray().then(function(cats) {
      var catOptions = '<option value="">Seleccionar categoría</option>';
      cats.forEach(function(c) {
        catOptions += '<option value="' + c.nombre + '">' + c.nombre + '</option>';
      });

      if (editando) {
        db.movimientos.get(id).then(function(item) {
          if (!item) {
            UI.toast('Registro no encontrado', 'error');
            return;
          }
          self._mostrarForm(item, catOptions);
        });
      } else {
        self._mostrarForm(null, catOptions);
      }
    });
  },

  _mostrarForm: function(item, catOptions) {
    var editando = !!item;
    var tipo = item ? item.tipo : 'egreso';
    var categoria = item ? (item.categoria || '') : '';
    var monto = item ? (parseFloat(item.monto) || 0) : '';
    var fecha = item ? (item.fecha || '') : new Date().toISOString().slice(0, 10);
    var nota = item ? (item.nota || '') : '';

    var html = '' +
      '<div class="space-y-4">' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Tipo</span>' +
          '<select x-model="tipo" class="select select-bordered w-full">' +
            '<option value="egreso" ' + (tipo === 'egreso' ? 'selected' : '') + '>Egreso (Gasto)</option>' +
            '<option value="ingreso" ' + (tipo === 'ingreso' ? 'selected' : '') + '>Ingreso</option>' +
          '</select>' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Categoría</span>' +
          '<select x-model="categoria" class="select select-bordered w-full">' + catOptions + '</select>' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Monto</span>' +
          '<input type="number" step="0.01" min="0" x-model="monto" value="' + monto + '" class="input input-bordered w-full" required>' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Fecha</span>' +
          '<input type="date" x-model="fecha" value="' + fecha + '" class="input input-bordered w-full" required>' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Nota</span>' +
          '<textarea x-model="nota" class="textarea textarea-bordered w-full" rows="2">' + nota + '</textarea>' +
        '</label>' +
      '</div>';

    UI.modalForm(
      editando ? 'Editar movimiento' : 'Nuevo movimiento',
      html,
      function(data) {
        if (editando) {
          return self._actualizar(id, data);
        } else {
          return self._guardar(data);
        }
      }
    );
  },

  _guardar: function(datos) {
    var registro = {
      id: uuid(),
      tipo: datos.tipo || 'egreso',
      categoria: datos.categoria || '',
      monto: datos.monto || '0',
      fecha: datos.fecha || new Date().toISOString().slice(0, 10),
      nota: datos.nota || '',
      createdBy: APP_CONFIG.usuarioActual || 'local',
      createdAt: new Date()
    };

    // Cifrar campos sensibles
    var campos = APP_CONFIG.cifrado.camposSensibles || [];
    if (campos.indexOf('monto') !== -1) registro.monto = cryptoHelpers.encrypt(registro.monto);
    if (campos.indexOf('nota') !== -1) registro.nota = cryptoHelpers.encrypt(registro.nota);

    return db.movimientos.put(registro).then(function() {
      UI.toast('Movimiento guardado', 'success');
      ModMovimientos._filtrar();
    });
  },

  _actualizar: function(id, datos) {
    return db.movimientos.get(id).then(function(existente) {
      if (!existente) {
        UI.toast('Registro no encontrado', 'error');
        return;
      }

      var actualizado = {
        id: id,
        tipo: datos.tipo || existente.tipo,
        categoria: datos.categoria || existente.categoria,
        monto: datos.monto || existente.monto,
        fecha: datos.fecha || existente.fecha,
        nota: datos.nota !== undefined ? datos.nota : existente.nota,
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };

      var campos = APP_CONFIG.cifrado.camposSensibles || [];
      if (campos.indexOf('monto') !== -1) {
        if (actualizado.monto && actualizado.monto.indexOf('U2FsdGVkX1') !== 0) {
          actualizado.monto = cryptoHelpers.encrypt(actualizado.monto);
        }
      }
      if (campos.indexOf('nota') !== -1) {
        if (actualizado.nota && actualizado.nota.indexOf('U2FsdGVkX1') !== 0) {
          actualizado.nota = cryptoHelpers.encrypt(actualizado.nota);
        }
      }

      return db.movimientos.put(actualizado).then(function() {
        UI.toast('Movimiento actualizado', 'success');
        ModMovimientos._filtrar();
      });
    });
  },

  eliminar: function(id) {
    UI.confirm('¿Eliminar este movimiento?').then(function(ok) {
      if (!ok) return;
      db.movimientos.delete(id).then(function() {
        UI.toast('Movimiento eliminado', 'success');
        ModMovimientos._filtrar();
      }).catch(function(err) {
        UI.toast(err.message || 'Error al eliminar', 'error');
      });
    });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES[ModMovimientos.id] = ModMovimientos;

// Alpine data
document.addEventListener('alpine:init', function() {
  Alpine.data('movimientosData', function() {
    return {
      init: function() {}
    };
  });
});
