# AHA Gastos — Spec Funcional

## Identidad

- **Nombre:** AHA Gastos
- **Tagline:** Controla tus finanzas personales y de negocio
- **Color:** #10b981 (emerald-500)
- **Target:** Freelancers, pequeños negocios, control financiero personal
- **Perfil:** Lite (file://, doble clic)

## Stack

- Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- ES5 estricto, offline-first, sin servidor
- Chart.js 4 para gráficos en reportes

## DB Schema (Dexie)

```
gastos: ++id, concepto, monto, categoria, metodoPago, fecha, createdBy, createdAt, updatedAt
categorias_gasto: ++id, nombre, tipo, limiteMensual, createdAt, updatedAt
presupuestos: ++id, categoria, mes, anio, limite, gastado, createdAt, updatedAt
```

## Módulos

### 1. Gastos (`#/gastos`)
- Registro rápido de gastos
- Campos: concepto, monto, categoría (select), método de pago, fecha
- Lista paginada con búsqueda por concepto
- Filtros por categoría, método de pago, rango de fechas
- Editar y eliminar gastos

### 2. Categorías (`#/categorias`)
- CRUD de categorías de gasto
- Tipo: fijo o variable
- Límite mensual opcional (para control de presupuesto)
- Al eliminar, preguntar qué hacer con gastos asociados

### 3. Presupuestos (`#/presupuestos`)
- Crear presupuesto mensual por categoría
- Seguimiento automático: gastado se actualiza al registrar gastos
- Indicador visual de progreso (barra verde/amarilla/roja)
- Lista del mes actual con opción de cambiar de mes

### 4. Reportes (`#/reportes`)
- Dashboard con Chart.js:
  - Gastos del mes: total y comparación con mes anterior
  - Por categoría: gráfico de pastel
  - Evolución mensual: gráfico de líneas (últimos 12 meses)
  - Presupuesto vs real: gráfico de barras comparativo
  - Gastos por método de pago: tabla resumen

## Estilo

- DaisyUI tema esmeralda (emerald-500 como primario)
- Layout: sidebar + contenido principal
- Tablas responsive con scroll horizontal en móvil
- Formularios en modal (UI.modalForm)
- Toasts para feedback de operaciones
