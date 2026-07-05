# AHA Gastos

Control de gastos offline para micro-negocios.

## Características

- Control de ingresos y egresos diarios
- Categorización de gastos
- Reportes mensuales en PDF
- Gráficos de flujo de caja (Chart.js)
- 100% offline-first (IndexedDB + Service Worker)
- Sin necesidad de internet
- Exportación respaldo cifrado .ateje-backup

## Perfil: Lite

- Funciona con doble clic en index.html
- Dexie (IndexedDB) como base de datos
- Cifrado AES de datos sensibles con CryptoJS
- PWA instalable con Service Worker
- Exportación ZIP + GitHub Pages

## Stack

- Alpine.js + DaisyUI 4 + Tailwind Play CDN
- Dexie.js (IndexedDB)
- Chart.js (gráficos)
- CryptoJS (cifrado AES)
- Pako (compresión ZIP)
- Bootstrap Icons
- Animate.css

## Estructura

```
aha-gastos/
├── index.html              ← Entry point
├── manifest.json            ← PWA manifest
├── sw.js                    ← Service Worker
├── project.config.js        ← Configuración
├── core/                    ← Lógica central
│   ├── main.js              ← Punto de entrada
│   ├── app.js               ← Router
│   ├── db.js                ← Dexie DB
│   ├── crypto.js            ← Cifrado AES + UUID
│   ├── ui.js                ← UI components
│   ├── theme.js             ← Tema visual
│   ├── env.js               ← Environment flag
│   ├── network.js           ← Monitoreo red
│   ├── sync.js              ← Export/Import
│   ├── seed.js              ← Datos iniciales
│   ├── license.js           ← Licencias
│   ├── search-palette.js    ← Cmd+K
│   └── file-store.js        ← Archivos
├── modules/                 ← Módulos funcionales
│   ├── dashboard/           ← Dashboard inicio
│   ├── movimientos/         ← CRUD ingresos/egresos
│   ├── categorias/          ← Gestión categorías
│   └── reportes/            ← Reportes mensuales
└── assets/
    ├── css/                 ← Estilos
    ├── js/libs/             ← Librerías
    ├── icons/               ← Iconos PWA
    └── data/defaults/       ← Placeholders
```

## Uso

Abre `index.html` en tu navegador (doble clic).
