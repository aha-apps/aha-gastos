// core/crypto.js — Cifrado AES con CryptoJS + UUID v4
window.cryptoHelpers = {
  _key: null,

  getKey: function() {
    if (this._key) return this._key;
    var stored = localStorage.getItem(APP_CONFIG.cifrado.storageKey);
    if (stored) {
      this._key = stored;
    } else {
      this._key = this._generateKey();
      localStorage.setItem(APP_CONFIG.cifrado.storageKey, this._key);
    }
    return this._key;
  },

  _generateKey: function() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    var key = '';
    for (var i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  },

  encrypt: function(texto) {
    if (!texto) return texto;
    try {
      var key = this.getKey();
      return CryptoJS.AES.encrypt(texto, key).toString();
    } catch (e) {
      console.error('Error al cifrar:', e);
      return texto;
    }
  },

  decrypt: function(textoCifrado) {
    if (!textoCifrado) return textoCifrado;
    if (typeof textoCifrado !== 'string') return textoCifrado;
    if (textoCifrado.indexOf('U2FsdGVkX1') !== 0) return textoCifrado;
    try {
      var key = this.getKey();
      var bytes = CryptoJS.AES.decrypt(textoCifrado, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('Error al descifrar:', e);
      return textoCifrado;
    }
  },

  resetKey: function() {
    localStorage.removeItem(APP_CONFIG.cifrado.storageKey);
    this._key = null;
  }
};

// Generador UUID v4 compatible file:// (no requiere crypto API)
window.uuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
