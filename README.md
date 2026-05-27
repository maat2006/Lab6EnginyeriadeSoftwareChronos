# Lab6EnginyeriadeSoftwareChronos

Collaborative base to break down and distribute the workload of the recipe management system.
The repo contains a React/TSX app that centralizes User Stories US-01 to US-04, their advanced prompts,
technical criteria, API contracts, data model and role-based workflow.

## Arranque

```bash
npm install
npm run dev
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


# Plano Técnico de Desarrollo – Sistema de Gestión de Recetas

# US-01: Añadir nuevas recetas

## Historia de Usuario

**Como usuario**, quiero añadir nuevas recetas con ingredientes y pasos para tener un registro de cocina digital.

---

## 1. Criterios de Aceptación Técnicos

### Campos obligatorios de una receta

| Campo | Tipo | Obligatorio | Validaciones |
|---------|--------|-------------|--------------|
| título | string | Sí | mínimo 3 caracteres, máximo 100 |
| descripción | string | No | máximo 500 caracteres |
| porciones | integer | Sí | mayor a 0 |
| tiempoPreparacion | integer | Sí | minutos, mayor a 0 |
| categoria | string | No | lista predefinida |
| imagenUrl | string | No | URL válida |
| ingredientes | array | Sí | mínimo 1 ingrediente |
| pasos | array | Sí | mínimo 1 paso |

### Estructura de ingredientes

Cada ingrediente debe incluir:

| Campo | Tipo | Obligatorio |
|---------|--------|-------------|
| cantidad | decimal | Sí |
| unidad | string | Sí |
| nombre | string | Sí |

Ejemplo:

```json
{
   "cantidad":500,
   "unidad":"gramos",
   "nombre":"Harina"
}
```

### Estructura de pasos

Cada paso debe incluir:

| Campo | Tipo | Obligatorio |
|---------|--------|-------------|
| orden | integer | Sí |
| descripcion | string | Sí |

Ejemplo:

```json
{
   "orden":1,
   "descripcion":"Mezclar harina con agua"
}
```

---

## 2. Modelo de Datos

### Tabla: recetas

```sql
CREATE TABLE recetas(
    id UUID PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    porciones INT NOT NULL,
    tiempo_preparacion INT NOT NULL,
    categoria VARCHAR(50),
    imagen_url TEXT,
    usuario_id UUID NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabla: ingredientes

```sql
CREATE TABLE ingredientes(
    id UUID PRIMARY KEY,
    receta_id UUID REFERENCES recetas(id),
    cantidad DECIMAL(10,2),
    unidad VARCHAR(30),
    nombre VARCHAR(100)
);
```

### Tabla: pasos

```sql
CREATE TABLE pasos(
    id UUID PRIMARY KEY,
    receta_id UUID REFERENCES recetas(id),
    orden INT,
    descripcion TEXT
);
```

### Relación

```text
Usuarios
   |
   | (1:N)
   |
Recetas
   |
   ├── Ingredientes (1:N)
   |
   └── Pasos (1:N)
```

---

## 3. API Backend

### Endpoint

```http
POST /api/recetas
```

### Request JSON

```json
{
   "titulo":"Pizza Casera",
   "descripcion":"Pizza tradicional",
   "porciones":4,
   "tiempoPreparacion":45,
   "ingredientes":[
      {
         "cantidad":500,
         "unidad":"gramos",
         "nombre":"Harina"
      }
   ],
   "pasos":[
      {
         "orden":1,
         "descripcion":"Mezclar ingredientes"
      }
   ]
}
```

### Validaciones obligatorias

#### Validaciones generales

- Usuario autenticado
- Tiempo > 0
- Porciones > 0
- Ingredientes ≥ 1
- Pasos ≥ 1
- Título mínimo 3 caracteres

#### Ingredientes

- cantidad > 0
- unidad no vacía
- nombre no vacío

#### Pasos

- orden consecutivo
- descripción mínimo 5 caracteres

---

## 4. Estrategia Frontend y "Deshacer"

### Formulario dinámico

#### Información principal

- Título
- Descripción
- Porciones
- Tiempo preparación
- Categoría
- Imagen

#### Ingredientes

```text
Cantidad | Unidad | Nombre | [Eliminar]

+ Agregar ingrediente
```

#### Pasos

```text
Paso 1 [texto]
Paso 2 [texto]

+ Agregar paso
```

Funciones:

- Agregar elementos
- Eliminar elementos
- Reordenar mediante drag & drop

### Implementación de "Deshacer"

Después de guardar:

```text
✓ Receta creada correctamente

[Deshacer]
```

Funcionamiento:

1. El backend devuelve el ID
2. Frontend muestra Snackbar durante 5 segundos
3. Si el usuario pulsa:

```http
DELETE /api/recetas/{id}
```

4. Si expira el tiempo:

```text
La receta permanece almacenada
```

---

# US-02: Buscar recetas por nombre o ingrediente

## Historia de Usuario

**Como usuario**, quiero buscar recetas por nombre o ingrediente para encontrar rápidamente lo que necesito.

---

## 1. Criterios de Aceptación Técnicos

### Comportamiento esperado

- Búsqueda en tiempo real
- Debounce entre 300–500 ms
- Coincidencia parcial
- Ignorar mayúsculas/minúsculas
- Soporta múltiples ingredientes
- Combina filtros

Ejemplo:

```text
pollo + tomate
```

Resultados:

```text
Recetas que contengan ambos ingredientes
```

### Reinterpretación de "Deshacer"

Se reemplaza por:

```text
[Limpiar filtros]
```

Acciones:

- Borra texto buscado
- Elimina tags seleccionados
- Restaura lista completa

---

## 2. Optimización Base de Datos

### Índice para título

```sql
CREATE INDEX idx_receta_titulo
ON recetas
USING gin(
to_tsvector('spanish',titulo)
);
```

### Índice para ingredientes

```sql
CREATE INDEX idx_ingredientes_nombre
ON ingredientes(nombre);
```

### Consulta aproximada

```sql
SELECT r.*
FROM recetas r
JOIN ingredientes i
ON r.id=i.receta_id
WHERE
r.titulo ILIKE '%pollo%'
OR i.nombre ILIKE '%pollo%';
```

---

## 3. API Backend

### Endpoint

```http
GET /api/recetas/search
```

### Query Params

| Parámetro | Tipo |
|------------|------|
| q | string |
| ingredientes | array |
| pagina | integer |
| limite | integer |

Ejemplo:

```http
GET /api/recetas/search?q=pasta&ingredientes=tomate,queso
```

---

## 4. Interfaz Usuario

### Barra principal

```text
🔍 Buscar receta...
```

### Ingredientes seleccionados

```text
[Tomate x]
[Queso x]
[Pollo x]
```

### Resultados

```text
Pizza Casera
Pasta Italiana
Pollo al horno
```

### Estado vacío

```text
No se encontraron recetas

[Intenta cambiar los filtros]
```

---

# US-03: Editar recetas existentes

## Historia de Usuario

**Como usuario**, quiero editar recetas existentes para corregir errores o hacer modificaciones.

---

## 1. Criterios de Aceptación Técnicos

### Comportamiento esperado

Si usuario elimina ingrediente:

- desaparece de receta
- backend elimina relación

Si usuario cambia orden:

```text
Paso 1
Paso 2
Paso 3
```

No permitir:

```text
Paso 1
Paso 4
Paso 8
```

---

## 2. API Backend

### Endpoint

```http
PUT /api/recetas/{id}
```

o

```http
PATCH /api/recetas/{id}
```

### Estrategia recomendada

Actualizar colecciones completas:

```text
1. Eliminar ingredientes actuales
2. Insertar nueva colección
3. Eliminar pasos actuales
4. Insertar nueva colección
```

Todo dentro de una transacción:

```text
ACID Transaction
```

---

## 3. Lógica "Deshacer"

### Estrategia híbrida

Antes de guardar:

```javascript
const estadoOriginal = recetaActual;
```

Tras guardar:

```text
✓ Cambios guardados

[Deshacer]
```

Endpoint:

```http
PUT /api/recetas/{id}/restore
```

Alternativa más robusta:

```sql
CREATE TABLE historial_recetas(
    id UUID PRIMARY KEY,
    receta_id UUID,
    snapshot_json JSON,
    created_at TIMESTAMP
);
```

---

## 4. Interfaz Usuario

Formulario precargado:

```text
Editar receta

Título: Pizza Casera
Porciones: 4

Ingredientes:
500 gramos Harina

Pasos:
1. Mezclar ingredientes
```

Confirmación:

```text
✓ Cambios guardados correctamente

[Deshacer]
```

---

# US-04: Eliminar recetas

## Historia de Usuario

**Como usuario**, quiero eliminar recetas para mantener el sistema organizado.

---

## 1. Criterios de Aceptación Técnicos

### Política de borrado

Implementar Soft Delete:

```sql
ALTER TABLE recetas
ADD deleted BOOLEAN DEFAULT false;

ALTER TABLE recetas
ADD deleted_at TIMESTAMP NULL;
```

Motivos:

- Recuperación
- Auditoría
- Soporte Undo
- Prevención de pérdida accidental

---

## 2. API Backend

### Endpoint

```http
DELETE /api/recetas/{id}
```

### Validaciones

- Usuario autenticado
- Receta existente
- Verificar propietario

Ejemplo:

```sql
SELECT *
FROM recetas
WHERE
id=:id
AND usuario_id=:usuario;
```

---

## 3. Implementación Undo

### Flujo técnico

Usuario:

```text
🗑 Eliminar receta
```

Backend:

```http
DELETE /api/recetas/{id}
```

Acción:

```text
deleted=true
deleted_at=timestamp_actual
```

Frontend:

```text
⚠ Receta eliminada

[Deshacer]

(5 segundos)
```

Si usuario pulsa:

```http
POST /api/recetas/{id}/restore
```

Backend:

```text
deleted=false
deleted_at=NULL
```

Si expira:

```sql
DELETE FROM recetas
WHERE deleted=true
AND deleted_at < NOW()-INTERVAL '5 minutes';
```

---

## 4. Interfaz Usuario

```text
Lista recetas

Pizza 🍕      ✏️ 🗑
Pasta 🍝      ✏️ 🗑
```

Al pulsar papelera:

```text
¿Desea eliminar esta receta?

[Cancelar]
[Eliminar]
```

Después:

```text
⚠ Receta eliminada

[Deshacer]
(5 segundos)
```

Si no hay acción:

```text
La eliminación se consolida automáticamente
```
