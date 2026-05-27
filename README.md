# Lab6EnginyeriadeSoftwareChronos

Base colaborativa para desglosar y repartir el trabajo del sistema de gestion de recetas.
El repo contiene una app React/TSX que centraliza las User Stories US-01 a US-04, sus prompts avanzados,
criterios tecnicos, contratos de API, modelo de datos y flujo de trabajo por roles.

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

- `src/data/recipeStories.js`: documento vivo con las cuatro User Stories, prompts y desglose tecnico.
- `src/data/teamWorkflow.js`: reparto de responsabilidades por perfil y fases de entrega.
- `src/App.tsx`: tablero conectado que consume los documentos JS y permite revisar/copiar cada prompt.
- `src/styles.css`: estilos de la interfaz principal.

## Flujo de equipo

1. Product/QA revisa los criterios de aceptacion de cada historia en `recipeStories.js`.
2. Backend toma los contratos de API y validaciones definidos por historia.
3. Frontend implementa los formularios, busqueda, edicion, borrado y mecanismos de deshacer.
4. QA valida cada historia usando los criterios tecnicos y los casos limite indicados.

Cada miembro puede trabajar una historia de forma independiente, pero todos consumen la misma fuente de verdad:
`src/data/recipeStories.js`.
