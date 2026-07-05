// core/sync.js — Export/Import .ateje-backup (cifrado+comprimido)
window.SyncEngine = {
  _password: '',
  _excludeTables: ['_ia_sqlite'],

  setPassword: function(pwd) {
    this._password = pwd || '';
  },

  exportar: function(password) {
    var pwd = password || this._password;
    var self = this;

    UI.toast('Preparando respaldo...', 'info');

    var tables = {};
    var appName = APP_CONFIG.app.nombre || 'aha-gastos';

    var tablePromises = [];
    db.tables.forEach(function(table) {
      if (self._excludeTables.indexOf(table.name) !== -1) return;
      tablePromises.push(
        table.toArray().then(function(records) {
          if (records.length) tables[table.name] = records;
        })
      );
    });

    return Promise.all(tablePromises).then(function() {
      var keys = Object.keys(tables);
      if (!keys.length) {
        UI.toast('No hay datos para exportar', 'warning');
        return;
      }

      var payload = JSON.stringify({
        version: 2,
        app: appName,
        exportedAt: new Date().toISOString(),
        tables: tables
      });

      var compressed;
      try {
        compressed = pako.deflate(payload, { level: 9 });
      } catch (e) {
        UI.toast('Error al comprimir: ' + e.message, 'error');
        return;
      }

      var blob;
      if (pwd) {
        try {
          var wordArray = CryptoJS.lib.WordArray.create(compressed);
          var encrypted = CryptoJS.AES.encrypt(wordArray, pwd).toString();
          blob = new Blob([encrypted], { type: 'application/octet-stream' });
        } catch (e) {
          UI.toast('Error al cifrar: ' + e.message, 'error');
          return;
        }
      } else {
        blob = new Blob([compressed], { type: 'application/octet-stream' });
      }

      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = appName + '-' + new Date().toISOString().slice(0, 10) + '.ateje-backup';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 1000);

      UI.toast('Respaldo exportado (' + (blob.size / 1024).toFixed(1) + ' KB)', 'success');
    }).catch(function(err) {
      UI.toast('Error al exportar: ' + err.message, 'error');
    });
  },

  importar: function(file, password) {
    var pwd = password || this._password;
    var self = this;

    UI.toast('Leyendo respaldo...', 'info');
    UI.loading(true);

    var leerArchivo = function(archivo) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) { resolve(e.target.result); };
        reader.onerror = function() { reject(new Error('Error al leer archivo')); };
        reader.readAsArrayBuffer(archivo);
      });
    };

    return leerArchivo(file).then(function(data) {
      var bytes = new Uint8Array(data);

      if (pwd) {
        try {
          var encryptedStr = new TextDecoder().decode(bytes);
          var decrypted = CryptoJS.AES.decrypt(encryptedStr, pwd);
          var decBytes = [];
          var words = decrypted.words;
          var sigBytes = decrypted.sigBytes;
          for (var i = 0; i < sigBytes; i++) {
            decBytes.push((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
          }
          bytes = new Uint8Array(decBytes);
        } catch (e) {
          UI.toast('Contrase\u00f1a incorrecta o archivo da\u00f1ado', 'error');
          UI.loading(false);
          return;
        }
      }

      var jsonStr;
      try {
        jsonStr = pako.inflate(bytes, { to: 'string' });
      } catch (e) {
        try {
          jsonStr = new TextDecoder().decode(bytes);
        } catch (e2) {
          UI.toast('Error al descomprimir: ' + e.message, 'error');
          UI.loading(false);
          return;
        }
      }

      var dataObj;
      try {
        dataObj = JSON.parse(jsonStr);
      } catch (e) {
        UI.toast('Archivo de respaldo inv\u00e1lido', 'error');
        UI.loading(false);
        return;
      }

      UI.toast('Restaurando ' + Object.keys(dataObj.tables || {}).length + ' tablas...', 'info');

      var importPromises = [];
      if (dataObj.tables) {
        for (var tableName in dataObj.tables) {
          if (dataObj.tables.hasOwnProperty(tableName)) {
            var records = dataObj.tables[tableName];
            if (db[tableName] && records.length) {
              importPromises.push(
                db[tableName].clear().then(function() {
                  return db[tableName].bulkPut(records);
                })
              );
            }
          }
        }
      }

      return Promise.all(importPromises).then(function() {
        UI.toast('Respaldo restaurado correctamente', 'success');
        UI.loading(false);
        // Recargar módulo actual si existe
        if (window.appRouter && window.appRouter.currentModule) {
          window.appRouter.refreshCurrent();
        }
      }).catch(function(err) {
        UI.toast('Error al restaurar: ' + err.message, 'error');
        UI.loading(false);
      });
    }).catch(function(err) {
      UI.toast('Error al leer archivo: ' + err.message, 'error');
      UI.loading(false);
    });
  }
};
