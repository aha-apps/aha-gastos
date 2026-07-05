// project.config.js — Configuración de AHA Gastos
var APP_CONFIG = {
  app: {
    id: 'aha-gastos',
    nombre: 'AHA Gastos',
    version: '1.0.0',
    tipo: 'gastos',
    descripcion: 'Control de gastos offline para micro-negocios',
    plan: 'lite',
    tagline: 'Control de gastos offline para micro-negocios'
  },
  perfil: 'lite',
  iaJutia: {
    perfil: 'lite'
  },
  modulosActivos: ['dashboard', 'movimientos', 'categorias', 'reportes'],
  tema: {
    modo: 'claro',
    colores: {
      primary: '#059669',
      secondary: '#0284c7',
      accent: '#d97706',
      neutral: '#374151',
      'base-100': '#ffffff',
      'base-200': '#f3f4f6',
      'base-300': '#d1d5db',
      'base-content': '#1f2937',
      info: '#0284c7',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626'
    },
    tipografia: {
      familia: 'Inter, system-ui, sans-serif',
      escala: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      }
    },
    radio: {
      caja: '0.5rem',
      modal: '1rem',
      badge: '9999px',
      btn: '0.5rem'
    }
  },
  cifrado: {
    camposSensibles: ['monto', 'nota'],
    storageKey: 'aha-gastos-key'
  },
  modulos: {
    dashboard: { titulo: 'Dashboard', icono: 'bi bi-speedometer2', activo: true },
    movimientos: { titulo: 'Movimientos', icono: 'bi bi-arrow-left-right', activo: true },
    categorias: { titulo: 'Categorías', icono: 'bi bi-tags', activo: true },
    reportes: { titulo: 'Reportes', icono: 'bi bi-file-earmark-bar-graph', activo: true }
  },
  data: {
    dir: 'data/',
    maxFileSize: 10 * 1024 * 1024,
    tipos: ['avatar', 'foto', 'doc', 'logo', 'backup'],
    avatars: {
      default: 'data/defaults/avatar.svg',
      size: 200,
      calidad: 0.8
    }
  },
  sync: {
    primaryFormat: 'json',
    secondaryFormats: [],
    includeFiles: true,
    encrypt: true,
    maxExportSize: 50 * 1024 * 1024
  },
  ui: {
    formsMode: 'modal',
    alerts: 'toast',
    confirmDelete: true,
    avatars: false,
    avatarDefault: 'data/defaults/avatar.svg'
  },
  usuarioActual: 'local'
};

window.APP_CONFIG = APP_CONFIG;
window.APP_ID = 'aha-gastos';
