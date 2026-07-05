// modules/dashboard/module.js — Dashboard principal
var ModDashboard = {
  id: 'dashboard',
  titulo: 'Dashboard',
  icono: 'bi bi-speedometer2',

  _charts: [],
  _interval: null,

  render: function() {
    return '' +
      '<div x-data="dashboardData()" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<h2 class="text-2xl font-bold mb-6 flex items-center gap-2">' +
          '<i class="bi bi-speedometer2 text-primary"></i> Dashboard' +
        '</h2>' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">' +
          '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">' +
            '<div class="stat-figure text-secondary"><i class="bi bi-arrow-down-left text-3xl"></i></div>' +
            '<div class="stat-title">Ingresos del mes</div>' +
            '<div class="stat-value text-success" id="dash-ingresos">$0</div>' +
          '</div>' +
          '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">' +
            '<div class="stat-figure text-secondary"><i class="bi bi-arrow-up-right text-3xl"></i></div>' +
            '<div class="stat-title">Egresos del mes</div>' +
            '<div class="stat-value text-error" id="dash-egresos">$0</div>' +
          '</div>' +
          '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">' +
            '<div class="stat-figure text-secondary"><i class="bi bi-wallet2 text-3xl"></i></div>' +
            '<div class="stat-title">Saldo del mes</div>' +
            '<div class="stat-value text-primary" id="dash-saldo">$0</div>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">' +
          '<div class="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">' +
            '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
              '<i class="bi bi-pie-chart text-primary"></i> Ingresos vs Egresos' +
            '</h3>' +
            '<div class="chart-container" style="position:relative; height:250px; width:100%">' +
              '<canvas id="dash-donut"></canvas>' +
            '</div>' +
          '</div>' +
          '<div class="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4">' +
            '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
              '<i class="bi bi-clock-history text-primary"></i> Últimos movimientos' +
            '</h3>' +
            '<div class="space-y-2" id="dash-ultimos">' +
              '<div class="skeleton h-10 w-full"></div>' +
              '<div class="skeleton h-10 w-full"></div>' +
              '<div class="skeleton h-10 w-full"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  init: function() {
    this._cargarDatos();
  },

  destroy: function() {
    this._charts.forEach(function(c) { if (c) c.destroy(); });
    this._charts = [];
    if (this._interval) clearInterval(this._interval);
  },

  _cargarDatos: function() {
    var self = this;
    var ahora = new Date();
    var mes = ahora.getMonth() + 1;
    var anio = ahora.getFullYear();
    var mesStr = (mes < 10 ? '0' : '') + mes + '-' + anio;

    db.movimientos
      .filter(function(m) {
        if (!m.fecha) return false;
        var f = m.fecha.toString();
        return f.indexOf(mesStr) !== -1 || f.indexOf('' + anio + '-' + (mes < 10 ? '0' : '') + mes) !== -1;
      })
      .toArray()
      .then(function(movs) {
        self._actualizarResumen(movs);
        self._actualizarGrafico(movs);
      })
      .catch(function(err) {
        console.error('Error cargando dashboard:', err);
      });

    // Últimos 5 movimientos (sin filtro de mes)
    db.movimientos
      .orderBy('createdAt')
      .reverse()
      .limit(5)
      .toArray()
      .then(function(movs) {
        self._actualizarUltimos(movs);
      });
  },

  _actualizarResumen: function(movs) {
    var ingresos = 0, egresos = 0;
    movs.forEach(function(m) {
      var monto = parseFloat(m.monto) || 0;
      if (m.tipo === 'ingreso') ingresos += monto;
      else egresos += monto;
    });
    var saldo = ingresos - egresos;

    var elIngresos = document.getElementById('dash-ingresos');
    var elEgresos = document.getElementById('dash-egresos');
    var elSaldo = document.getElementById('dash-saldo');
    if (elIngresos) elIngresos.textContent = UI.formatCurrency(ingresos);
    if (elEgresos) elEgresos.textContent = UI.formatCurrency(egresos);
    if (elSaldo) elSaldo.textContent = UI.formatCurrency(saldo);
    if (elSaldo) {
      elSaldo.className = 'stat-value ' + (saldo >= 0 ? 'text-primary' : 'text-error');
    }
  },

  _actualizarGrafico: function(movs) {
    var self = this;
    // Destruir gráfico anterior
    this._charts.forEach(function(c) { if (c) c.destroy(); });
    this._charts = [];

    var canvas = document.getElementById('dash-donut');
    if (!canvas) return;

    var ingresos = 0, egresos = 0;
    movs.forEach(function(m) {
      var monto = parseFloat(m.monto) || 0;
      if (m.tipo === 'ingreso') ingresos += monto;
      else egresos += monto;
    });

    if (ingresos === 0 && egresos === 0) {
      ingresos = 1; egresos = 1; // Mostrar 50/50 vacío
    }

    var ctx = canvas.getContext('2d');
    var chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ingresos', 'Egresos'],
        datasets: [{
          data: [ingresos, egresos],
          backgroundColor: ['#059669', '#dc2626'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, usePointStyle: true }
          }
        }
      }
    });
    self._charts.push(chart);
  },

  _actualizarUltimos: function(movs) {
    var container = document.getElementById('dash-ultimos');
    if (!container) return;

    if (!movs.length) {
      container.innerHTML = '' +
        '<div class="flex flex-col items-center justify-center py-8 text-base-content/40">' +
          '<i class="bi bi-inbox text-4xl mb-2"></i>' +
          '<p class="text-sm">No hay movimientos aún</p>' +
        '</div>';
      return;
    }

    var html = '';
    movs.forEach(function(m) {
      var monto = parseFloat(m.monto) || 0;
      var signo = m.tipo === 'ingreso' ? '+' : '-';
      var color = m.tipo === 'ingreso' ? 'text-success' : 'text-error';
      var icono = m.tipo === 'ingreso' ? 'bi-arrow-down-left' : 'bi-arrow-up-right';
      html += '' +
        '<div class="flex items-center justify-between p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors">' +
          '<div class="flex items-center gap-3">' +
            '<div class="w-9 h-9 rounded-full flex items-center justify-center ' +
              (m.tipo === 'ingreso' ? 'bg-success/10' : 'bg-error/10') + '">' +
              '<i class="bi ' + icono + ' ' + color + '"></i>' +
            '</div>' +
            '<div>' +
              '<div class="text-sm font-medium">' + (m.categoria || 'Sin categoría') + '</div>' +
              '<div class="text-xs text-base-content/50">' + UI.formatDate(m.fecha) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="font-semibold ' + color + '">' + signo + UI.formatCurrency(monto) + '</div>' +
        '</div>';
    });
    container.innerHTML = html;
  }
};

window.MODULES = window.MODULES || {};
window.MODULES[ModDashboard.id] = ModDashboard;

// Alpine data component
document.addEventListener('alpine:init', function() {
  Alpine.data('dashboardData', function() {
    return {
      init: function() {
        // La lógica está en ModDashboard
      }
    };
  });
});
