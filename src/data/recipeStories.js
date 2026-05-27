export const recipeStories = [
  {
    id: 'US-01',
    title: 'Añadir nuevas recetas',
    focus: 'Creacion de datos, relaciones de ingredientes y validaciones de entrada.',
    status: 'Lista para refinar',
    ownerHint: 'Backend + Frontend',
    theme: 'create',
    originalUserStory:
      'Como usuario, quiero añadir nuevas recetas con ingredientes y pasos para tener un registro de cocina digital.',
    prompt: `Actua como un Analista Tecnico y Desarrollador Full-Stack Senior. Vamos a implementar la US-01 de nuestro sistema de gestion de recetas. El requerimiento original dice: "Como usuario, quiero añadir nuevas recetas con ingredientes y pasos para tener un registro de cocina digital". Los criterios de aceptacion actuales son genericos (guardar, confirmar y deshacer en la interfaz principal).

Necesito que desgloses esta historia en un plano de desarrollo real:
1. Criterios de Aceptacion Tecnicos: Especifica que campos obligatorios debe tener la receta (titulo, porciones, tiempo, etc.), como se estructuran los ingredientes (cantidad, unidad, nombre) y los pasos secuenciales.
2. Modelo de Datos: Diseña la estructura de la base de datos (relacion entre la tabla Recetas, Ingredientes y Pasos).
3. API Backend: Define el endpoint POST necesario, detallando el JSON de entrada y las validaciones logicas obligatorias.
4. Estrategia de Interfaz y "Deshacer": Explica como se vera el formulario dinamico en el Frontend y como se abordara tecnicamente el criterio de "poder deshacer la accion" (por ejemplo, mediante un boton temporal de "Deshacer/Eliminar" en el mensaje de confirmacion de exito).`,
    acceptanceCriteria: [
      'La receta exige titulo, porciones, tiempo de preparacion y al menos un ingrediente y un paso.',
      'Cada ingrediente guarda cantidad numerica, unidad opcional y nombre obligatorio.',
      'Cada paso se almacena con posicion secuencial y descripcion obligatoria.',
      'El guardado confirma exito y permite deshacer la creacion durante una ventana temporal.',
      'Las validaciones se muestran antes de enviar y tambien se aplican en backend.',
    ],
    dataModel: [
      'recipes(id, user_id, title, description, servings, prep_time_minutes, cook_time_minutes, created_at, updated_at, deleted_at)',
      'recipe_ingredients(id, recipe_id, position, name, quantity, unit, notes)',
      'recipe_steps(id, recipe_id, position, instruction, timer_minutes)',
    ],
    api: {
      method: 'POST',
      path: '/api/recipes',
      request: {
        title: 'Tortilla de patatas',
        description: 'Receta familiar sencilla.',
        servings: 4,
        prepTimeMinutes: 15,
        cookTimeMinutes: 25,
        ingredients: [
          { quantity: 4, unit: 'ud', name: 'patata', notes: 'medianas' },
          { quantity: 6, unit: 'ud', name: 'huevo' },
        ],
        steps: [
          { instruction: 'Pelar y cortar las patatas.', timerMinutes: 8 },
          { instruction: 'Cuajar la mezcla en la sarten.', timerMinutes: 12 },
        ],
      },
      validations: [
        'title entre 3 y 120 caracteres.',
        'servings mayor que 0.',
        'prepTimeMinutes y cookTimeMinutes no negativos.',
        'ingredients y steps no pueden estar vacios.',
        'Las posiciones se recalculan en backend para evitar huecos o duplicados.',
      ],
      success: '201 Created con la receta completa normalizada.',
    },
    frontend: [
      'Formulario principal con secciones: datos basicos, ingredientes y pasos.',
      'Botones para añadir, reordenar y eliminar filas dinamicas.',
      'Validacion inline por campo y resumen de errores al intentar guardar.',
      'Toast de exito con accion "Deshacer" que elimina la receta recien creada si se pulsa a tiempo.',
    ],
    undoStrategy: [
      'Crear la receta inmediatamente y conservar su id en el toast.',
      'Durante 5 segundos, permitir accion de undo que llama a DELETE /api/recipes/:id o marca deleted_at.',
      'Si el usuario no pulsa undo, la receta queda persistida sin accion adicional.',
    ],
    teamTasks: [
      { role: 'Backend', task: 'Crear transaccion para insertar receta, ingredientes y pasos.' },
      { role: 'Frontend', task: 'Construir formulario dinamico reutilizable para crear y editar.' },
      { role: 'QA', task: 'Probar validaciones, arrays vacios y undo despues de crear.' },
    ],
  },
  {
    id: 'US-02',
    title: 'Buscar recetas por nombre o ingrediente',
    focus: 'Algoritmos de busqueda, rendimiento de consultas e interfaz de filtrado.',
    status: 'Lista para refinar',
    ownerHint: 'Backend + Frontend',
    theme: 'search',
    originalUserStory:
      'Como usuario, quiero buscar recetas por nombre o ingrediente para encontrar rapidamente lo que necesito.',
    prompt: `Actua como un Analista Tecnico y Desarrollador Full-Stack Senior. Vamos a implementar la US-02 de nuestro sistema de gestion de recetas. El requerimiento original dice: "Como usuario, quiero buscar recetas por nombre o ingrediente para encontrar rapidamente lo que necesito". El criterio generico pide que este en la interfaz principal, que confirme y que "se pueda deshacer" (lo cual no tiene mucho sentido tecnico para una simple busqueda).

Necesito que corrijas y desgloses esta historia de forma logica:
1. Criterios de Aceptacion Tecnicos: Define como debe comportarse la busqueda (¿Es en tiempo real mientras se escribe?, ¿Soporta coincidencia parcial?, ¿Como filtra por multiples ingredientes?). Reinterpreta el criterio de "deshacer" como un mecanismo rapido para limpiar los filtros de busqueda instalados.
2. Optimizacion de Base de Datos: Explica que tipo de consultas o indices (por ejemplo, indices de texto) se deben aplicar en la base de datos para que la busqueda por nombre e ingredientes sea rapida.
3. API Backend: Define el endpoint GET de busqueda, detallando los parametros de consulta (query params) necesarios.
4. Interfaz de Usuario: Describe los componentes de la interfaz principal (barra de busqueda, tags de ingredientes seleccionados) y como se muestran los resultados o el estado "No se encontraron recetas".`,
    acceptanceCriteria: [
      'La busqueda se ejecuta con debounce mientras el usuario escribe.',
      'Soporta coincidencia parcial por titulo y por nombre de ingrediente.',
      'Permite filtrar por multiples ingredientes con logica AND por defecto.',
      'El criterio de deshacer se implementa como limpiar filtros y volver al listado inicial.',
      'Muestra estado vacio cuando no hay coincidencias.',
    ],
    dataModel: [
      'Indice por recipes(user_id, deleted_at, title).',
      'Indice por recipe_ingredients(recipe_id, lower(name)).',
      'Indice full-text opcional sobre recipes.title, recipes.description y recipe_ingredients.name.',
    ],
    api: {
      method: 'GET',
      path: '/api/recipes/search',
      queryParams: {
        q: 'texto parcial de titulo o ingrediente',
        ingredients: 'tomate,queso',
        match: 'all | any',
        page: 1,
        pageSize: 20,
        sort: 'relevance | updatedAt | title',
      },
      validations: [
        'page y pageSize deben ser positivos.',
        'pageSize limitado para evitar respuestas excesivas.',
        'ingredients se normaliza a minusculas y sin duplicados.',
        'Solo devuelve recetas del usuario autenticado y no eliminadas.',
      ],
      success: '200 OK con resultados paginados y metadata de filtros activos.',
    },
    frontend: [
      'Barra de busqueda visible en la interfaz principal.',
      'Chips o tags para ingredientes seleccionados.',
      'Boton de limpiar filtros que funciona como "deshacer busqueda".',
      'Listado con resaltado de coincidencias y estado "No se encontraron recetas".',
    ],
    undoStrategy: [
      'Guardar el estado previo de filtros en memoria antes de aplicar nuevos filtros.',
      'Permitir limpiar todo con una accion visible.',
      'No se requiere rollback en backend porque la busqueda no modifica datos.',
    ],
    teamTasks: [
      { role: 'Backend', task: 'Crear endpoint de busqueda con filtros, paginacion e indices.' },
      { role: 'Frontend', task: 'Implementar barra, tags, debounce y estado vacio.' },
      { role: 'QA', task: 'Probar coincidencia parcial, multiples ingredientes y limpiar filtros.' },
    ],
  },
  {
    id: 'US-03',
    title: 'Editar recetas existentes',
    focus: 'Actualizacion de datos complejos, estados intermedios y rollback corto.',
    status: 'Lista para refinar',
    ownerHint: 'Full-stack',
    theme: 'edit',
    originalUserStory:
      'Como usuario, quiero editar recetas existentes para corregir errores o hacer modificaciones.',
    prompt: `Actua como un Analista Tecnico y Desarrollador Full-Stack Senior. Vamos a implementar la US-03 de nuestro sistema de gestion de recetas. El requerimiento original dice: "Como usuario, quiero editar recetas existentes para corregir errores o hacer modificaciones". Los criterios genericos vuelven a exigir guardar, confirmar y deshacer.

Necesito que estructures el desarrollo tecnico de esta funcionalidad:
1. Criterios de Aceptacion Tecnicos: Detalla el comportamiento del sistema al editar. ¿Que pasa si el usuario borra un ingrediente existente o cambia el orden de los pasos?
2. API Backend: Define el endpoint PUT o PATCH necesario. Explica como procesara el backend la actualizacion de los ingredientes y pasos asociados (¿reemplaza todo el array o hace actualizaciones atomicas?).
3. Logica de "Deshacer" (Mundo Real): Dado que el requerimiento exige "poder deshacer la accion si es necesario", propón una solucion tecnica elegante para el frontend o el backend (por ejemplo, mantener un borrador en memoria antes de guardar, o un sistema de "historial/rollback" rapido justo despues de confirmar el cambio).
4. Interfaz de Usuario: Describe como se cargan los datos actuales en el formulario de edicion y como se notifican los cambios guardados con exito.`,
    acceptanceCriteria: [
      'El formulario carga la receta actual con ingredientes y pasos ordenados.',
      'Permite añadir, borrar y reordenar ingredientes y pasos antes de guardar.',
      'El usuario puede cancelar cambios no guardados y volver al estado inicial.',
      'Despues de guardar, se confirma exito y se ofrece deshacer durante una ventana temporal.',
      'El backend evita editar recetas inexistentes, eliminadas o de otro usuario.',
    ],
    dataModel: [
      'recipe_versions(id, recipe_id, snapshot_json, created_by, created_at) para rollback opcional.',
      'recipes.updated_at se actualiza en cada guardado confirmado.',
      'Ingredientes y pasos se reemplazan dentro de una transaccion para mantener orden consistente.',
    ],
    api: {
      method: 'PUT',
      path: '/api/recipes/:recipeId',
      request: {
        title: 'Tortilla de patatas con cebolla',
        servings: 4,
        prepTimeMinutes: 20,
        cookTimeMinutes: 25,
        ingredients: [
          { quantity: 4, unit: 'ud', name: 'patata' },
          { quantity: 1, unit: 'ud', name: 'cebolla' },
          { quantity: 6, unit: 'ud', name: 'huevo' },
        ],
        steps: [
          { instruction: 'Pochar patata y cebolla.' },
          { instruction: 'Mezclar con huevo batido.' },
          { instruction: 'Cuajar por ambos lados.' },
        ],
      },
      validations: [
        'recipeId debe existir, pertenecer al usuario y no estar eliminado.',
        'El payload completo reemplaza ingredientes y pasos en una unica transaccion.',
        'Antes de reemplazar, se guarda snapshot para deshacer.',
        'Se aplican las mismas validaciones de creacion.',
      ],
      success: '200 OK con version previa disponible para rollback corto.',
    },
    frontend: [
      'Usar el mismo componente de formulario que US-01 en modo edicion.',
      'Mostrar estado de cambios sin guardar.',
      'Permitir cancelar antes de guardar sin tocar backend.',
      'Toast de exito con accion "Deshacer cambios".',
    ],
    undoStrategy: [
      'Antes del PUT, guardar snapshot local para cancelar cambios no guardados.',
      'En backend, guardar snapshot previo en recipe_versions durante el PUT.',
      'Si el usuario pulsa undo, llamar a POST /api/recipes/:id/restore-version con la version previa.',
    ],
    teamTasks: [
      { role: 'Backend', task: 'Implementar PUT transaccional y snapshot de version anterior.' },
      { role: 'Frontend', task: 'Reutilizar formulario y gestionar estado dirty/cancelar.' },
      { role: 'QA', task: 'Probar reordenacion, borrado de filas y rollback post-guardado.' },
    ],
  },
  {
    id: 'US-04',
    title: 'Eliminar recetas',
    focus: 'Persistencia, soft delete y prevencion de errores irreversibles.',
    status: 'Lista para refinar',
    ownerHint: 'Backend + UX',
    theme: 'delete',
    originalUserStory:
      'Como usuario, quiero eliminar recetas para mantener el sistema organizado.',
    prompt: `Actua como un Analista Tecnico y Desarrollador Full-Stack Senior. Vamos a implementar la US-04 de nuestro sistema de gestion de recetas. El requerimiento original dice: "Como usuario, quiero eliminar recetas para mantener el sistema organizado". Aqui el criterio de "poder deshacer la accion" y "confirmar con un mensaje" es critico para no perder informacion por accidente.

Necesito que desgloses la logica de eliminacion:
1. Criterios de Aceptacion Tecnicos: Define la politica de borrado. ¿Se realizara un borrado fisico (eliminar el registro por completo) o un borrado logico (Soft Delete, cambiando un estado a deleted: true)? Argumenta cual es mejor para cumplir con el criterio de "deshacer".
2. API Backend: Define el endpoint DELETE. Explica que validaciones de seguridad debe hacer (ej. verificar que la receta pertenece al usuario que intenta borrarla).
3. Implementacion del "Deshacer" (Undo): Explica detalladamente el flujo tecnico: cuando el usuario elimina, aparece un banner de confirmacion (Toast/Snackbar) con una cuenta atras de 5 segundos y un boton de "Deshacer". Si pulsa "Deshacer", la receta no se borra; si expira el tiempo, el borrado se consolida en la base de datos.
4. Interfaz de Usuario: Describe el flujo visual desde que se hace clic en el icono de papelera en la interfaz principal hasta que la receta desaparece de la lista.`,
    acceptanceCriteria: [
      'La eliminacion usa soft delete para permitir restauracion segura.',
      'Solo el propietario de la receta puede eliminarla.',
      'La receta desaparece visualmente de la lista de forma optimista.',
      'Un toast con cuenta atras permite deshacer durante 5 segundos.',
      'Si expira el tiempo, la receta queda marcada como eliminada y no aparece en busquedas.',
    ],
    dataModel: [
      'recipes.deleted_at almacena fecha de eliminacion logica.',
      'recipes.deleted_by almacena el usuario que ejecuto la accion.',
      'Las consultas principales filtran WHERE deleted_at IS NULL.',
    ],
    api: {
      method: 'DELETE',
      path: '/api/recipes/:recipeId',
      request: null,
      validations: [
        'recipeId debe existir.',
        'La receta debe pertenecer al usuario autenticado.',
        'La receta no debe estar ya eliminada.',
        'La operacion escribe deleted_at y deleted_by, no borra fisicamente.',
      ],
      success: '204 No Content o 200 OK con estado deleted.',
    },
    frontend: [
      'Icono de papelera en cada receta del listado principal.',
      'Confirmacion ligera antes de ejecutar o eliminacion optimista con toast inmediato.',
      'La fila desaparece y el toast muestra "Receta eliminada" con accion "Deshacer".',
      'Si se pulsa undo, la receta vuelve a la lista en la misma posicion si es posible.',
    ],
    undoStrategy: [
      'Opcion A: retrasar la llamada DELETE hasta que expiren 5 segundos.',
      'Opcion B: llamar DELETE al instante y restaurar con POST /api/recipes/:id/restore si hay undo.',
      'Para mejor UX y robustez multi-dispositivo, preferir soft delete inmediato con endpoint de restore.',
    ],
    teamTasks: [
      { role: 'Backend', task: 'Implementar soft delete, restore y filtros por deleted_at.' },
      { role: 'Frontend', task: 'Crear flujo de papelera, toast con contador y restauracion.' },
      { role: 'QA', task: 'Probar undo antes/despues del contador y permisos de propietario.' },
    ],
  },
];

export const apiContracts = recipeStories.map((story) => ({
  id: story.id,
  title: story.title,
  method: story.api.method,
  path: story.api.path,
  success: story.api.success,
}));
