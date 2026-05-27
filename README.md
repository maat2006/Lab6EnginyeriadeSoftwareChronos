# Lab6EnginyeriadeSoftwareChronos
Link: https://github.com/maat2006/Lab6EnginyeriadeSoftwareChronos

Collaborative base to break down and distribute the workload of the recipe management system.
The repo contains a React/TSX app that centralizes User Stories US-01 to US-04, their advanced prompts,
technical criteria, API contracts, data model and role-based workflow.

## Arranque

```bash
npm install
npm run dev
or 
bun install
bun run dev
```

Useful Commands:

```bash
npm run build
npm run preview
```

## Structure

- `src/data/recipeStories.js`: living document with the four User Stories, prompts, and technical breakdown.
- `src/data/teamWorkflow.js`: distribution of responsibilities by profile and delivery phases.
- `src/App.tsx`: connected dashboard that consumes the JS documents and allows reviewing/copying each prompt.
- `src/styles.css`: styles for the main interface.

## Team flow
Each member can work on a story independently, but everyone consumes the same source of truth:
`src/data/recipeStories.js`.

## Used Prompts

# Prompt para la US-01: Añadir nuevas recetas

Actúa como un Analista Técnico y Desarrollador Full-Stack Senior. Vamos a implementar la US-01 de nuestro sistema de gestión de recetas. El requerimiento original dice: **"Como usuario, quiero añadir nuevas recetas con ingredientes y pasos para tener un registro de cocina digital"**. Los criterios de aceptación actuales son genéricos (guardar, confirmar y deshacer en la interfaz principal). Necesito que desgloses esta historia en un plano de desarrollo real:

1. **Criterios de Aceptación Técnicos:**  
   Especifica qué campos obligatorios debe tener la receta (título, porciones, tiempo, etc.), cómo se estructuran los ingredientes (cantidad, unidad, nombre) y los pasos secuenciales.

2. **Modelo de Datos:**  
   Diseña la estructura de la base de datos (relación entre la tabla Recetas, Ingredientes y Pasos).

3. **API Backend:**  
   Define el endpoint POST necesario, detallando el JSON de entrada y las validaciones lógicas obligatorias.

4. **Estrategia de Interfaz y "Deshacer":**  
   Explica cómo se verá el formulario dinámico en el Frontend y cómo se abordará técnicamente el criterio de "poder deshacer la acción" (por ejemplo, mediante un botón temporal de "Deshacer/Eliminar" en el mensaje de confirmación de éxito).

---

# Prompt para la US-02: Buscar recetas por nombre o ingrediente

Actúa como un Analista Técnico y Desarrollador Full-Stack Senior. Vamos a implementar la US-02 de nuestro sistema de gestión de recetas. El requerimiento original dice: **"Como usuario, quiero buscar recetas por nombre o ingrediente para encontrar rápidamente lo que necesito"**. El criterio genérico pide que esté en la interfaz principal, que confirme y que "se pueda deshacer" (lo cual no tiene mucho sentido técnico para una simple búsqueda).  
Necesito que corrijas y desgloses esta historia de forma lógica:

1. **Criterios de Aceptación Técnicos:**  
   Define cómo debe comportarse la búsqueda (¿Es en tiempo real mientras se escribe?, ¿Soporta coincidencia parcial?, ¿Cómo filtra por múltiples ingredientes?). Reinterpreta el criterio de "deshacer" como un mecanismo rápido para limpiar los filtros de búsqueda instalados.

2. **Optimización de Base de Datos:**  
   Explica qué tipo de consultas o índices (por ejemplo, índices de texto) se deben aplicar en la base de datos para que la búsqueda por nombre e ingredientes sea rápida.

3. **API Backend:**  
   Define el endpoint GET de búsqueda, detallando los parámetros de consulta (query params) necesarios.

4. **Interfaz de Usuario:**  
   Describe los componentes de la interfaz principal (barra de búsqueda, tags de ingredientes seleccionados) y cómo se muestran los resultados o el estado "No se encontraron recetas".

---

# Prompt para la US-03: Editar recetas existentes

Actúa como un Analista Técnico y Desarrollador Full-Stack Senior. Vamos a implementar la US-03 de nuestro sistema de gestión de recetas. El requerimiento original dice: **"Como usuario, quiero editar recetas existentes para corregir errores o hacer modificaciones"**. Los criterios genéricos vuelven a exigir guardar, confirmar y deshacer. Necesito que estructures el desarrollo técnico de esta funcionalidad:

1. **Criterios de Aceptación Técnicos:**  
   Detalla el comportamiento del sistema al editar. ¿Qué pasa si el usuario borra un ingrediente existente o cambia el orden de los pasos?

2. **API Backend:**  
   Define el endpoint PUT o PATCH necesario. Explica cómo procesará el backend la actualización de los ingredientes y pasos asociados (¿reemplaza todo el array o hace actualizaciones atómicas?).

3. **Lógica de "Deshacer" (Mundo Real):**  
   Dado que el requerimiento exige "poder deshacer la acción si es necesario", propón una solución técnica elegante para el frontend o el backend (por ejemplo, mantener un borrador en memoria antes de guardar, o un sistema de "historial/rollback" rápido justo después de confirmar el cambio).

4. **Interfaz de Usuario:**  
   Describe cómo se cargan los datos actuales en el formulario de edición y cómo se notifican los cambios guardados con éxito.

---

# Prompt para la US-04: Eliminar recetas

Actúa como un Analista Técnico y Desarrollador Full-Stack Senior. Vamos a implementar la US-04 de nuestro sistema de gestión de recetas. El requerimiento original dice: **"Como usuario, quiero eliminar recetas para mantener el sistema organizado"**. Aquí el criterio de "poder deshacer la acción" y "confirmar con un mensaje" es crítico para no perder información por accidente. Necesito que desgloses la lógica de eliminación:

1. **Criterios de Aceptación Técnicos:**  
   Define la política de borrado. ¿Se realizará un borrado físico (eliminar el registro por completo) o un borrado lógico (Soft Delete, cambiando un estado a `deleted: true`)? Argumenta cuál es mejor para cumplir con el criterio de "deshacer".

2. **API Backend:**  
   Define el endpoint DELETE. Explica qué validaciones de seguridad debe hacer (ej. verificar que la receta pertenece al usuario que intenta borrarla).

3. **Implementación del "Deshacer" (Undo):**  
   Explica detalladamente el flujo técnico: cuando el usuario elimina, aparece un banner de confirmación (Toast/Snackbar) con una cuenta atrás de 5 segundos y un botón de "Deshacer". Si pulsa "Deshacer", la receta no se borra; si expira el tiempo, el borrado se consolida en la base de datos.

4. **Interfaz de Usuario:**  
   Describe el flujo visual desde que se hace clic en el icono de papelera en la interfaz principal hasta que la receta desaparece de la lista.


# Screenshots of the application

<img width="598" height="371" alt="Captura de pantalla 2026-05-27 a las 16 13 11" src="https://github.com/user-attachments/assets/be730b16-9148-40ea-a680-bb4c7e90419d" />
<img width="910" height="608" alt="image" src="https://github.com/user-attachments/assets/ad22fcd7-3864-410d-904f-bacf7e5aeaed" />
