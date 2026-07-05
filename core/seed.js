// core/seed.js — Datos iniciales: categorías predefinidas
(function() {
  var categoriasPredefinidas = [
    { id: 'cat-renta', nombre: 'Renta', tipo: 'egreso' },
    { id: 'cat-luz', nombre: 'Luz', tipo: 'egreso' },
    { id: 'cat-mercancia', nombre: 'Mercanc\u00eda', tipo: 'egreso' },
    { id: 'cat-nomina', nombre: 'N\u00f3mina', tipo: 'egreso' },
    { id: 'cat-transporte', nombre: 'Transporte', tipo: 'egreso' },
    { id: 'cat-alimentos', nombre: 'Alimentos', tipo: 'egreso' },
    { id: 'cat-servicios', nombre: 'Servicios', tipo: 'egreso' },
    { id: 'cat-otros-egreso', nombre: 'Otros', tipo: 'egreso' },
    { id: 'cat-ventas', nombre: 'Ventas', tipo: 'ingreso' },
    { id: 'cat-servicios-ingreso', nombre: 'Servicios', tipo: 'ingreso' },
    { id: 'cat-otros-ingreso', nombre: 'Otros', tipo: 'ingreso' }
  ];

  var yaSembradas = false;

  window.seedData = function() {
    if (yaSembradas) return Promise.resolve();
    yaSembradas = true;

    return db.categorias.count().then(function(count) {
      if (count > 0) return;

      var ahora = new Date();
      var promises = categoriasPredefinidas.map(function(cat) {
        var registro = {
          id: cat.id,
          nombre: cat.nombre,
          tipo: cat.tipo,
          createdBy: 'system',
          createdAt: ahora,
          updatedAt: ahora
        };
        return db.categorias.put(registro);
      });

      return Promise.all(promises).then(function() {
        console.log('✅ Categor\u00edas predefinidas sembradas:', categoriasPredefinidas.length);
      });
    }).catch(function(err) {
      console.error('Error al sembrar datos:', err);
    });
  };
})();
