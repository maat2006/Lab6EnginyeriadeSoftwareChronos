# Lab6EnginyeriadeSoftwareChronos

Aplicacion React/TSX para gestionar recetas de cocina. Implementa las historias:

- US-01: añadir recetas con ingredientes y pasos.
- US-02: buscar recetas por nombre o ingrediente.
- US-03: editar recetas existentes con historial para deshacer.
- US-04: eliminar recetas con soft delete y accion de deshacer.

## Arranque

```bash
npm install
npm run dev
```

Comandos utiles:

```bash
npm run build
npm run preview
```

## Estructura

- `src/App.tsx`: orquestacion de estado, busqueda, CRUD y acciones de deshacer.
- `src/components/`: formulario dinamico, buscador, listado, detalle y toast de undo.
- `src/services/recipeApi.js`: capa de datos que simula endpoints REST y persiste en `localStorage`.
- `src/data/sampleRecipes.js`: recetas iniciales para desarrollo.
- `src/types.ts`: tipos compartidos para frontend y capa de datos.
- `src/styles.css`: estilos de la interfaz principal.

## Flujo de equipo

1. Frontend trabaja en `src/components/` y `src/App.tsx`.
2. Backend puede sustituir `src/services/recipeApi.js` por llamadas HTTP reales manteniendo la misma interfaz.
3. QA valida crear, buscar, editar, eliminar y deshacer usando la app local.
4. Arquitectura mantiene los tipos en `src/types.ts` sincronizados con los contratos del backend.

La persistencia actual es local por navegador mediante `localStorage`, preparada para evolucionar a API real.
