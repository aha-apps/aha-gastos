// core/db.js — Inicialización Dexie
var db = new Dexie('AHA_Gastos');

db.version(2).stores({
  movimientos: 'id, tipo, *categoria, monto, *fecha, *nota, *createdBy, createdAt',
  categorias: 'id, nombre, tipo, *createdBy, createdAt, updatedAt',
  _sync_log: 'id, *tabla, *operacion, *idRegistro, *estado, *fecha, *createdBy, createdAt',
  _ia_chats: 'id, *titulo, *modelo, *createdBy, createdAt, updatedAt',
  _ia_messages: 'id, *chatId, *rol, contenido, *createdBy, createdAt'
});

db.version(1).stores({
  movimientos: 'id, tipo, *categoria, monto, *fecha, *nota, *createdBy, createdAt',
  categorias: 'id, nombre, tipo, *createdBy, createdAt, updatedAt',
  _file_blobs: '&path'
});

window.db = db;
