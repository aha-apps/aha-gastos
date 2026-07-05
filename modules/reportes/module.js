// modules/reportes/module.js — Reportes mensuales con gráficos y exportación
var ModReportes = {
  id: 'reportes',
  titulo: 'Reportes',
  icono: 'bi bi-file-earmark-bar-graph',

  _chart: null,
  _datos: [],
  _mesActual: '',

  render: function() {
    var ahora = new Date();
    var mesActual = ahora.getFullYear() + '-' + ((ahora.getMonth() + 1) < 10 ? '0' : '') + (ahora.getMonth() + 1);
    this._mesActual = mesActual;

    return '' +
      '<div x-data="reportesData()" x-init="init()" class="animate__animated animate__fadeIn">' +
        '<div class="flex flex-wrap items-center justify-between gap-3 mb-6">' +
          '<h2 class="text-2xl font-bold flex items-center gap-2">' +
            '<i class="bi bi-file-earmark-bar-graph text-primary"></i> Reportes' +
          '</h2>' +
          '<div class="flex gap-2">' +
            '<input type="month" class="input input-bordered input-sm" id="rep-mes" value="' + mesActual + '" onchange="ModReportes.cambiarMes(this.value)">' +
            '<button class="btn btn-primary btn-sm" onclick="ModReportes.exportarPDF()">' +
              '<i class="bi bi-file-earmark-pdf"></i> PDF' +
            '</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="ModReportes.exportarCSV()">' +
              '<i class="bi bi-file-earmark-spreadsheet"></i> CSV' +
            '</button>' +
          '</div>' +
        '</div>' +

        <!-- Resumen -->
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" id="rep-resumen">' +
          '<div class="skeleton h-20 w-full"></div>' +
          '<div class="skeleton h-20 w-full"></div>' +
          '<div class="skeleton h-20 w-full"></div>' +
        '</div>' +

        <!-- Gráfico barras -->
        '<div class="bg-base-100 rounded-xl shadow-sm border border-base-200 p-4 mb-6">' +
          '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
            '<i class="bi bi-bar-chart text-primary"></i> Flujo de caja diario' +
          '</h3>' +
          '<div class="chart-container" style="position:relative; height:300px; width:100%">' +
            '<canvas id="rep-barras"></canvas>' +
          '</div>' +
        '</div>' +

        <!-- Tabla detallada -->
        '<div class="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">' +
          '<div class="p-4 border-b border-base-200 flex items-center justify-between">' +
            '<h3 class="font-semibold">Detalle del mes</h3>' +
            '<input type="text" class="input input-bordered input-sm max-w-[200px]" placeholder="Buscar..." id="rep-busqueda" oninput="ModReportes.filtrarTabla(this.value)">' +
          '</div>' +
          '<div class="overflow-x-auto">' +
            '<table class="table table-zebra">' +
              '<thead>' +
                '<tr>' +
                  '<th>Fecha</th>' +
                  '<th>Tipo</th>' +
                  '<th>Categoría</th>' +
                  '<th>Monto</th>' +
                  '<th>Nota</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody id="rep-tbody">' +
                '<tr><td colspan="5" class="text-center py-8 text-base-content/40">' +
                  '<div class="skeleton h-8 w-full"></div>' +
                  '<div class="skeleton h-8 w-full mt-2"></div>' +
                '</td></tr>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
          '<div id="rep-empty" class="hidden flex flex-col items-center justify-center py-12 text-base-content/40">' +
            '<i class="bi bi-inbox text-4xl mb-2"></i>' +
            '<p class="text-sm">No hay movimientos en este mes</p>' +
          '</div>' +
        '</div>' +

        <!-- IA Stats Lite -->
        '<div class="mt-6 p-4 bg-base-100 rounded-xl shadow-sm border border-base-200">' +
          '<h3 class="font-semibold mb-2 flex items-center gap-2">' +
            '<i class="bi bi-robot text-primary"></i> Estadísticas' +
          '</h3>' +
          '<div id="rep-ia-stats" class="text-sm text-base-content/70 space-y-1">' +
            '<p class="skeleton h-4 w-3/4"></p>' +
            '<p class="skeleton h-4 w-1/2"></p>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  init: function() {
    this._cargarDatos();
  },

  destroy: function() {
    if (this._chart) { this._chart.destroy(); this._chart = null; }
    this._datos = [];
  },

  cambiarMes: function(mes) {
    this._mesActual = mes;
    this._cargarDatos();
  },

  _cargarDatos: function() {
    var self = this;
    var mes = this._mesActual;
    if (!mes) mes = new Date().getFullYear() + '-' + ((new Date().getMonth() + 1) < 10 ? '0' : '') + (new Date().getMonth() + 1);

    db.movimientos.toArray().then(function(todos) {
      var filtrados = todos.filter(function(m) {
        if (!m.fecha) return false;
        return m.fecha.toString().indexOf(mes) !== -1;
      });

      filtrados.sort(function(a, b) {
        return new Date(b.fecha || 0) - new Date(a.fecha || 0);
      });

      self._datos = filtrados;
      self._actualizarResumen(filtrados);
      self._actualizarGrafico(filtrados);
      self._renderTabla(filtrados);
      self._generarStats(filtrados);
    });
  },

  _actualizarResumen: function(datos) {
    var container = document.getElementById('rep-resumen');
    if (!container) return;

    var ingresos = 0, egresos = 0;
    datos.forEach(function(m) {
      var monto = parseFloat(m.monto) || 0;
      if (m.tipo === 'ingreso') ingresos += monto;
      else egresos += monto;
    });
    var saldo = ingresos - egresos;

    container.innerHTML = '' +
      '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">' +
        '<div class="stat-title">Ingresos</div>' +
        '<div class="stat-value text-success text-2xl">' + UI.formatCurrency(ingresos) + '</div>' +
        '<div class="stat-desc">' + datos.length + ' movimientos</div>' +
      '</div>' +
      '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">' +
        '<div class="stat-title">Egresos</div>' +
        '<div class="stat-value text-error text-2xl">' + UI.formatCurrency(egresos) + '</div>' +
      '</div>' +
      '<div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">' +
        '<div class="stat-title">Saldo neto</div>' +
        '<div class="stat-value text-2xl ' + (saldo >= 0 ? 'text-primary' : 'text-error') + '">' + UI.formatCurrency(saldo) + '</div>' +
      '</div>';
  },

  _actualizarGrafico: function(datos) {
    var self = this;
    if (this._chart) { this._chart.destroy(); this._chart = null; }

    var canvas = document.getElementById('rep-barras');
    if (!canvas) return;

    // Agrupar por día
    var dias = {};
    datos.forEach(function(m) {
      var dia = m.fecha ? m.fecha.toString().slice(8, 10) : '??';
      if (!dias[dia]) dias[dia] = { ingresos: 0, egresos: 0 };
      var monto = parseFloat(m.monto) || 0;
      if (m.tipo === 'ingreso') dias[dia].ingresos += monto;
      else dias[dia].egresos += monto;
    });

    var labels = Object.keys(dias).sort();
    var ingresosData = labels.map(function(d) { return dias[d].ingresos; });
    var egresosData = labels.map(function(d) { return dias[d].egresos; });

    var ctx = canvas.getContext('2d');
    self._chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Ingresos',
            data: ingresosData,
            backgroundColor: '#059669',
            borderRadius: 4
          },
          {
            label: 'Egresos',
            data: egresosData,
            backgroundColor: '#dc2626',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { callback: function(val) { return '$' + val.toFixed(0); } }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, padding: 16 }
          }
        }
      }
    });
  },

  _renderTabla: function(datos) {
    var tbody = document.getElementById('rep-tbody');
    var empty = document.getElementById('rep-empty');
    if (!tbody) return;

    if (!datos.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-base-content/40">Sin resultados</td></tr>';
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (empty) empty.classList.add('hidden');

    // Descifrar montos para la tabla
    var html = '';
    datos.forEach(function(m) {
      var monto = parseFloat(m.monto) || 0;
      var color = m.tipo === 'ingreso' ? 'text-success' : 'text-error';
      var signo = m.tipo === 'ingreso' ? '+' : '-';
      var badgeColor = m.tipo === 'ingreso' ? 'badge-success' : 'badge-error';
      html += '<tr>' +
        '<td class="text-sm">' + UI.formatDate(m.fecha) + '</td>' +
        '<td><span class="badge badge-sm ' + badgeColor + '">' + m.tipo + '</span></td>' +
        '<td>' + (m.categoria || '-') + '</td>' +
        '<td class="font-semibold ' + color + '">' + signo + UI.formatCurrency(monto) + '</td>' +
        '<td class="text-sm text-base-content/60 max-w-[200px] truncate">' + (m.nota || '-') + '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
  },

  _generarStats: function(datos) {
    var container = document.getElementById('rep-ia-stats');
    if (!container) return;

    if (!datos.length) {
      container.innerHTML = '<p class="text-base-content/40">No hay datos suficientes para generar estadísticas.</p>';
      return;
    }

    var ingresos = 0, egresos = 0;
    var catEgresos = {};
    var catIngresos = {};

    datos.forEach(function(m) {
      var monto = parseFloat(m.monto) || 0;
      if (m.tipo === 'ingreso') {
        ingresos += monto;
        catIngresos[m.categoria] = (catIngresos[m.categoria] || 0) + monto;
      } else {
        egresos += monto;
        catEgresos[m.categoria] = (catEgresos[m.categoria] || 0) + monto;
      }
    });

    var saldo = ingresos - egresos;
    var html = '';

    // Mayor egreso
    var maxCat = '', maxMonto = 0;
    for (var c in catEgresos) {
      if (catEgresos[c] > maxMonto) { maxMonto = catEgresos[c]; maxCat = c; }
    }
    var pctEgresos = egresos > 0 ? ((maxMonto / egresos) * 100).toFixed(1) : 0;

    var total = ingresos + egresos;
    var pctIngresos = total > 0 ? ((ingresos / total) * 100).toFixed(1) : 0;

    html += '<p><i class="bi bi-info-circle text-primary"></i> <strong>Saldo proyectado al cierre:</strong> ' + UI.formatCurrency(saldo) + '</p>';
    if (maxCat) {
      html += '<p><i class="bi bi-tag text-primary"></i> <strong>Mayor egreso:</strong> ' + maxCat + ' (' + pctEgresos + '% del total de egresos)</p>';
    }
    html += '<p><i class="bi bi-pie-chart text-primary"></i> <strong>Composición:</strong> ' + pctIngresos + '% ingresos, ' + (100 - pctIngresos).toFixed(1) + '% egresos</p>';

    container.innerHTML = html;
  },

  // Filtro en tabla
  filtrarTabla: function(query) {
    if (!query) {
      this._renderTabla(this._datos);
      return;
    }

    var q = query.toLowerCase();
    var filtrados = this._datos.filter(function(m) {
      return (m.categoria && m.categoria.toLowerCase().indexOf(q) !== -1) ||
             (m.nota && m.nota.toLowerCase().indexOf(q) !== -1) ||
             (m.tipo && m.tipo.indexOf(q) !== -1) ||
             (m.fecha && m.fecha.indexOf(q) !== -1);
    });
    this._renderTabla(filtrados);
  },

  // Exportar CSV
  exportarCSV: function() {
    if (!this._datos.length) {
      UI.toast('No hay datos para exportar', 'warning');
      return;
    }

    var csv = 'Fecha,Tipo,Categoría,Monto,Nota\n';
    this._datos.forEach(function(m) {
      var monto = parseFloat(m.monto) || 0;
      var nota = (m.nota || '').replace(/"/g, '""');
      csv += '"' + UI.formatDate(m.fecha) + '","' + m.tipo + '","' + (m.categoria || '') + '","' + monto + '","' + nota + '"\n';
    });

    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'reporte-' + this._mesActual + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);

    UI.toast('CSV exportado', 'success');
  },

  // Exportar PDF con jsPDF
  exportarPDF: function() {
    if (!this._datos || !this._datos.length) {
      UI.toast('No hay datos para exportar', 'warning');
      return;
    }

    var self = this;
    UI.loading(true);

    try {
      var doc = new jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      var pageW = 210;
      var margin = 15;
      var y = 20;

      // Título
      doc.setFontSize(18);
      doc.setTextColor(5, 150, 105);
      doc.text('AHA Gastos - Reporte Mensual', margin, y);
      y += 8;

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text('Periodo: ' + (this._mesActual || 'Actual'), margin, y);
      y += 8;

      // Resumen
      var ingresos = 0, egresos = 0;
      this._datos.forEach(function(m) {
        var monto = parseFloat(m.monto) || 0;
        if (m.tipo === 'ingreso') ingresos += monto;
        else egresos += monto;
      });
      var saldo = ingresos - egresos;

      doc.setFontSize(12);
      doc.setTextColor(33);
      doc.text('Ingresos: $' + ingresos.toFixed(2), margin, y);
      y += 6;
      doc.text('Egresos: $' + egresos.toFixed(2), margin, y);
      y += 6;
      doc.text('Saldo neto: $' + saldo.toFixed(2), margin, y);
      y += 10;

      // Tabla
      doc.setFontSize(9);
      doc.setTextColor(255);
      doc.setFillColor(5, 150, 105);
      doc.rect(margin, y, 180, 6, 'F');
      doc.text('Fecha', margin + 2, y + 4);
      doc.text('Tipo', margin + 25, y + 4);
      doc.text('Categoría', margin + 50, y + 4);
      doc.text('Monto', margin + 110, y + 4);
      doc.text('Nota', margin + 145, y + 4);
      y += 8;

      doc.setTextColor(33);
      this._datos.slice(0, 50).forEach(function(m) {
        if (y > 275) {
          doc.addPage();
          y = 20;
          doc.setFontSize(9);
          doc.setTextColor(255);
          doc.setFillColor(5, 150, 105);
          doc.rect(margin, y, 180, 6, 'F');
          doc.text('Fecha', margin + 2, y + 4);
          doc.text('Tipo', margin + 25, y + 4);
          doc.text('Categoría', margin + 50, y + 4);
          doc.text('Monto', margin + 110, y + 4);
          doc.text('Nota', margin + 145, y + 4);
          y += 8;
          doc.setTextColor(33);
        }

        var monto = parseFloat(m.monto) || 0;
        var fecha = m.fecha ? m.fecha.toString() : '';
        doc.text(fecha, margin + 2, y);
        doc.text(m.tipo || '', margin + 25, y);
        doc.text((m.categoria || '').substring(0, 15), margin + 50, y);
        doc.text('$' + monto.toFixed(2), margin + 110, y);
        doc.text((m.nota || '').substring(0, 20), margin + 145, y);
        y += 5;
      });

      // Pie de página
      doc.setFontSize(8);
      doc.setTextColor(180);
      doc.text('Generado por AHA Gastos - ' + new Date().toLocaleDateString(), margin, 290);

      doc.save('reporte-' + this._mesActual + '.pdf');
      UI.toast('PDF exportado', 'success');
    } catch (e) {
      UI.toast('Error al generar PDF: ' + e.message, 'error');
    }

    UI.loading(false);
  }
};

window.MODULES = window.MODULES || {};
window.MODULES[ModReportes.id] = ModReportes;

document.addEventListener('alpine:init', function() {
  Alpine.data('reportesData', function() {
    return {
      init: function() {}
    };
  });
});
