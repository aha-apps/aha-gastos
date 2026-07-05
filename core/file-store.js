// core/file-store.js — Gestión de archivos (Lite: blobs en IndexedDB)
window.FileStore = {
  APP_DATA_DIR: 'data/',

  save: function(tipo, nombre, blob) {
    return new Promise(function(resolve, reject) {
      var path = tipo + '/' + uuid() + '-' + nombre;
      var reader = new FileReader();
      reader.onload = function(e) {
        var dataUrl = e.target.result;
        db._file_blobs.put({
          path: path,
          data: dataUrl,
          tipo: tipo,
          nombre: nombre,
          mime: blob.type || 'application/octet-stream',
          size: blob.size,
          createdAt: new Date()
        }).then(function() {
          resolve({ path: path, url: dataUrl });
        }).catch(function(err) {
          reject(err);
        });
      };
      reader.onerror = function() { reject(new Error('Error al leer archivo')); };
      reader.readAsDataURL(blob);
    });
  },

  getURL: function(path) {
    return new Promise(function(resolve, reject) {
      if (!path) return resolve(null);
      db._file_blobs.get(path).then(function(entry) {
        if (entry && entry.data) resolve(entry.data);
        else resolve(null);
      }).catch(function() { resolve(null); });
    });
  },

  read: function(path) {
    return this.getURL(path).then(function(dataUrl) {
      if (!dataUrl) return null;
      // Convert dataURL to Blob
      var parts = dataUrl.split(',');
      var mime = parts[0].match(/:(.*?);/)[1];
      var raw = atob(parts[1]);
      var rawLength = raw.length;
      var arr = new Uint8Array(rawLength);
      for (var i = 0; i < rawLength; i++) {
        arr[i] = raw.charCodeAt(i);
      }
      return new Blob([arr], { type: mime });
    });
  },

  delete: function(path) {
    return db._file_blobs.delete(path);
  },

  cleanOrphans: function() {
    return Promise.resolve();
  },

  meta: function(path) {
    return db._file_blobs.get(path);
  },

  avatarDefault: function() {
    return APP_CONFIG.data.avatars.default;
  }
};
