export const teamTracks = [
  {
    role: 'Product / QA',
    accent: 'green',
    mission: 'Convertir requisitos genericos en criterios verificables y casos de prueba.',
    responsibilities: [
      'Revisar criterios de aceptacion tecnicos por User Story.',
      'Definir casos limite: campos vacios, orden de pasos, borrado accidental y busquedas sin resultados.',
      'Validar que cada confirmacion y deshacer tiene comportamiento observable.',
    ],
    stories: ['US-01', 'US-02', 'US-03', 'US-04'],
  },
  {
    role: 'Backend',
    accent: 'blue',
    mission: 'Implementar contratos de API, validaciones y persistencia.',
    responsibilities: [
      'Crear endpoints REST definidos en cada historia.',
      'Aplicar relaciones Recetas, Ingredientes y Pasos con transacciones.',
      'Asegurar pertenencia de usuario y soft delete para eliminacion reversible.',
    ],
    stories: ['US-01', 'US-02', 'US-03', 'US-04'],
  },
  {
    role: 'Frontend',
    accent: 'orange',
    mission: 'Construir la interfaz principal y los estados de interaccion.',
    responsibilities: [
      'Crear formularios dinamicos para ingredientes y pasos.',
      'Implementar busqueda con filtros limpiables.',
      'Gestionar toasts, confirmaciones y acciones de deshacer.',
    ],
    stories: ['US-01', 'US-02', 'US-03', 'US-04'],
  },
  {
    role: 'Arquitectura',
    accent: 'rose',
    mission: 'Mantener coherencia tecnica entre historias y evitar duplicacion.',
    responsibilities: [
      'Alinear el modelo de datos con los contratos de API.',
      'Definir estrategia de undo comun cuando proceda.',
      'Aprobar indices, transacciones y reglas de concurrencia.',
    ],
    stories: ['US-01', 'US-02', 'US-03', 'US-04'],
  },
];

export const deliveryMilestones = [
  {
    name: 'Refinamiento',
    output: 'Historias aceptadas con criterios tecnicos y casos limite.',
  },
  {
    name: 'Contrato',
    output: 'Payloads, endpoints, errores y permisos documentados.',
  },
  {
    name: 'Implementacion',
    output: 'Backend, frontend y estado de undo conectados por historia.',
  },
  {
    name: 'Verificacion',
    output: 'Pruebas manuales y automaticas sobre flujos principales.',
  },
];
