# AHA Gastos — Stack Ateje (Lite)

## Identidad
- **Nombre:** AHA Gastos
- **Tagline:** Controla tus finanzas personales y de negocio
- **Perfil:** Lite (file://, doble clic)
- **Stack:** Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- **Tema:** #10b981 (emerald-500)
- **Módulos:** gastos, categorías, presupuestos, reportes
- **Repo:** github.com/aha-apps/aha-gastos

## Stack Técnico

- **Runtime:** Sin servidor. Abrir `index.html` con doble clic o servir con cualquier HTTP server
- **Frontend:** Alpine.js 3.14 (x-data, x-init, x-show, x-for, x-model, x-on, x-text, x-html, x-bind)
- **CSS:** DaisyUI 4 sobre Tailwind Play CDN (sin build step). Tema inyectado vía CSS variables
- **Iconos:** Bootstrap Icons v1.11
- **Persistencia:** Dexie 3 (IndexedDB) — offline-first, sin backend
- **Animaciones:** Animate.css v4
- **Cifrado:** CryptoJS AES (core/crypto.js)
- **Gráficos:** Chart.js 4 (chart.umd.min.js)
- **Compresión:** Pako 2 (para export/import .ateje-backup)
- **PWA:** Service Worker + manifest.json (instalable offline)

## Convenciones de Código (OBLIGATORIAS)

- **ES5 estricto:** `'use strict'`, `var`, function expressions. NO usar `import`, `export`, `type="module"`
- **CDNs en index.html:** Las librerías se cargan desde `assets/js/libs/` y `assets/css/`
- **UUID v4:** Usar `window.uuid()` de `core/crypto.js` (Math.random, no crypto.getRandomValues para file://)
- **UI Helpers globales:** `window.UI.toast()`, `window.UI.confirm()`, `window.UI.modalForm()`, `window.UI.loading()`
- **Toast:** `UI.toast('mensaje', 'success|error|warning|info')` — duración 3s auto
- **Confirm:** `UI.confirm('¿Estás seguro?', { title, confirmText, cancelText }).then(ok => ...)`
- **ModalForm:** `UI.modalForm({ title, fields: [{ key, label, type, required }], data }).then(result => ...)`
- **Loading:** `UI.loading.show('Cargando...')` / `UI.loading.hide()`
- **DB:** `window.db` — instancia Dexie global definida en core/db.js
- **Router:** Hash-based (core/app.js). Módulos se cargan por `#/modulo`
- **Módulos:** Cada módulo tiene `module.html` (template Alpine) y `module.js` (lógica IIFE)
- **Stores Alpine:** `Alpine.store('loading', {...})`, `Alpine.store('network', {...})`, etc.
- **Sin alert() nativo:** Siempre usar `UI.toast()` o `UI.confirm()`
- **Antes de db.delete():** Siempre `UI.confirm()`

## DB Schema

```
gastos: ++id, concepto, monto, categoria, metodoPago, fecha, createdBy, createdAt, updatedAt
categorias_gasto: ++id, nombre, tipo, limiteMensual, createdAt, updatedAt
presupuestos: ++id, categoria, mes, anio, limite, gastado, createdAt, updatedAt
```

## Módulos

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `#/gastos` | Gastos | Registro diario de gastos con concepto, monto, categoría, método de pago |
| `#/categorias` | Categorías | Gestión de categorías de gasto con límite mensual opcional |
| `#/presupuestos` | Presupuestos | Presupuesto mensual por categoría con seguimiento de gastado vs límite |
| `#/reportes` | Reportes | Dashboard con gráficas Chart.js: gastos por categoría, evolución mensual |

## Cómo Trabajar con Este Código

1. **Abrir:** Doble clic en `index.html` o `npx serve .`
2. **Reset datos:** DevTools > Application > IndexedDB > Eliminar base de datos
3. **Export/Backup:** Desde Ajustes > Exportar datos (genera .ateje-backup cifrado)
4. **Import:** Desde Ajustes > Importar datos
5. **Service Worker:** Se registra automáticamente. Para debuggear: DevTools > Application > Service Workers
6. **Debug Alpine:** `window.Alpine` en consola, o `document.querySelector('[x-data]').__x`
7. **Estilos:** DaisyUI clases + tema inyectado dinámicamente (no CSS estático)

## Git

- Branch: main
- CI/CD: GitHub Actions (deploy-pages.yml)
- URL: https://aha-apps.github.io/aha-gastos/
