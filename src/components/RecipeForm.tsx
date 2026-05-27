import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2, X } from 'lucide-react';
import type { Ingredient, Recipe, RecipeInput, RecipeStep } from '../types';

type FormIngredient = Omit<Ingredient, 'id' | 'position'>;
type FormStep = Omit<RecipeStep, 'id' | 'position'>;

type RecipeFormProps = {
  initialRecipe: Recipe | null;
  isSaving: boolean;
  serverErrors: Record<string, string>;
  onCancel: () => void;
  onSubmit: (payload: RecipeInput) => void;
};

const emptyIngredient = (): FormIngredient => ({
  quantity: 1,
  unit: '',
  name: '',
  notes: '',
});

const emptyStep = (): FormStep => ({
  instruction: '',
  timerMinutes: undefined,
});

const toFormState = (recipe: Recipe | null) => ({
  title: recipe?.title ?? '',
  description: recipe?.description ?? '',
  servings: recipe?.servings ?? 2,
  prepTimeMinutes: recipe?.prepTimeMinutes ?? 10,
  cookTimeMinutes: recipe?.cookTimeMinutes ?? 20,
  ingredients: recipe?.ingredients.map(({ quantity, unit, name, notes }) => ({ quantity, unit, name, notes })) ?? [
    emptyIngredient(),
  ],
  steps: recipe?.steps.map(({ instruction, timerMinutes }) => ({ instruction, timerMinutes })) ?? [emptyStep()],
});

function RecipeForm({ initialRecipe, isSaving, onCancel, onSubmit, serverErrors }: RecipeFormProps) {
  const [form, setForm] = useState(toFormState(initialRecipe));
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const errors = useMemo(() => ({ ...clientErrors, ...serverErrors }), [clientErrors, serverErrors]);

  useEffect(() => {
    setForm(toFormState(initialRecipe));
    setClientErrors({});
  }, [initialRecipe]);

  const setField = (field: keyof typeof form, value: string | number | FormIngredient[] | FormStep[]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateIngredient = (index: number, field: keyof FormIngredient, value: string | number) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, itemIndex) =>
        itemIndex === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    }));
  };

  const updateStep = (index: number, field: keyof FormStep, value: string | number | undefined) => {
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step, itemIndex) => (itemIndex === index ? { ...step, [field]: value } : step)),
    }));
  };

  const moveIngredient = (index: number, direction: -1 | 1) => {
    setField('ingredients', moveItem(form.ingredients, index, direction));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    setField('steps', moveItem(form.steps, index, direction));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (form.title.trim().length < 3) nextErrors.title = 'Minimo 3 caracteres.';
    if (Number(form.servings) <= 0) nextErrors.servings = 'Debe ser mayor que 0.';
    if (Number(form.prepTimeMinutes) < 0) nextErrors.prepTimeMinutes = 'No puede ser negativo.';
    if (Number(form.cookTimeMinutes) < 0) nextErrors.cookTimeMinutes = 'No puede ser negativo.';
    if (!form.ingredients.length) nextErrors.ingredients = 'Añade al menos un ingrediente.';
    if (!form.steps.length) nextErrors.steps = 'Añade al menos un paso.';

    form.ingredients.forEach((ingredient, index) => {
      if (!ingredient.name.trim()) nextErrors[`ingredient-${index}-name`] = 'Obligatorio.';
      if (Number(ingredient.quantity) <= 0) nextErrors[`ingredient-${index}-quantity`] = 'Mayor que 0.';
    });

    form.steps.forEach((step, index) => {
      if (!step.instruction.trim()) nextErrors[`step-${index}-instruction`] = 'Obligatorio.';
    });

    setClientErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      servings: Number(form.servings),
      prepTimeMinutes: Number(form.prepTimeMinutes),
      cookTimeMinutes: Number(form.cookTimeMinutes),
      ingredients: form.ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: Number(ingredient.quantity),
      })),
      steps: form.steps.map((step) => ({
        ...step,
        timerMinutes: step.timerMinutes === undefined ? undefined : Number(step.timerMinutes),
      })),
    });
  };

  return (
    <form className="recipe-form" onSubmit={submit}>
      <div className="form-header">
        <div>
          <h2>{initialRecipe ? 'Editar receta' : 'Nueva receta'}</h2>
          <p>{initialRecipe ? `Version actual v${initialRecipe.version}` : 'Formulario de alta'}</p>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Cerrar formulario">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="form-grid">
        <Field label="Titulo" error={errors.title}>
          <input value={form.title} onChange={(event) => setField('title', event.target.value)} />
        </Field>

        <Field label="Porciones" error={errors.servings}>
          <input
            min="1"
            type="number"
            value={form.servings}
            onChange={(event) => setField('servings', Number(event.target.value))}
          />
        </Field>

        <Field label="Preparacion min" error={errors.prepTimeMinutes}>
          <input
            min="0"
            type="number"
            value={form.prepTimeMinutes}
            onChange={(event) => setField('prepTimeMinutes', Number(event.target.value))}
          />
        </Field>

        <Field label="Coccion min" error={errors.cookTimeMinutes}>
          <input
            min="0"
            type="number"
            value={form.cookTimeMinutes}
            onChange={(event) => setField('cookTimeMinutes', Number(event.target.value))}
          />
        </Field>
      </div>

      <Field label="Descripcion">
        <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} rows={3} />
      </Field>

      <section className="form-section">
        <div className="section-heading">
          <h3>Ingredientes</h3>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setField('ingredients', [...form.ingredients, emptyIngredient()])}
          >
            <Plus size={17} aria-hidden="true" />
            Añadir
          </button>
        </div>
        {errors.ingredients && <span className="field-error">{errors.ingredients}</span>}

        <div className="editable-list">
          {form.ingredients.map((ingredient, index) => (
            <div className="ingredient-row" key={index}>
              <Field label="Cantidad" error={errors[`ingredient-${index}-quantity`]}>
                <input
                  min="0"
                  step="0.1"
                  type="number"
                  value={ingredient.quantity}
                  onChange={(event) => updateIngredient(index, 'quantity', Number(event.target.value))}
                />
              </Field>
              <Field label="Unidad">
                <input value={ingredient.unit} onChange={(event) => updateIngredient(index, 'unit', event.target.value)} />
              </Field>
              <Field label="Ingrediente" error={errors[`ingredient-${index}-name`]}>
                <input value={ingredient.name} onChange={(event) => updateIngredient(index, 'name', event.target.value)} />
              </Field>
              <Field label="Notas">
                <input value={ingredient.notes} onChange={(event) => updateIngredient(index, 'notes', event.target.value)} />
              </Field>
              <RowTools
                canMoveDown={index < form.ingredients.length - 1}
                canMoveUp={index > 0}
                canRemove={form.ingredients.length > 1}
                onMoveDown={() => moveIngredient(index, 1)}
                onMoveUp={() => moveIngredient(index, -1)}
                onRemove={() =>
                  setField(
                    'ingredients',
                    form.ingredients.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <h3>Pasos</h3>
          <button className="secondary-button" type="button" onClick={() => setField('steps', [...form.steps, emptyStep()])}>
            <Plus size={17} aria-hidden="true" />
            Añadir
          </button>
        </div>
        {errors.steps && <span className="field-error">{errors.steps}</span>}

        <div className="editable-list">
          {form.steps.map((step, index) => (
            <div className="step-row" key={index}>
              <span className="step-number">{index + 1}</span>
              <Field label="Instruccion" error={errors[`step-${index}-instruction`]}>
                <textarea value={step.instruction} onChange={(event) => updateStep(index, 'instruction', event.target.value)} rows={2} />
              </Field>
              <Field label="Timer min">
                <input
                  min="0"
                  type="number"
                  value={step.timerMinutes ?? ''}
                  onChange={(event) =>
                    updateStep(index, 'timerMinutes', event.target.value === '' ? undefined : Number(event.target.value))
                  }
                />
              </Field>
              <RowTools
                canMoveDown={index < form.steps.length - 1}
                canMoveUp={index > 0}
                canRemove={form.steps.length > 1}
                onMoveDown={() => moveStep(index, 1)}
                onMoveUp={() => moveStep(index, -1)}
                onRemove={() =>
                  setField(
                    'steps',
                    form.steps.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              />
            </div>
          ))}
        </div>
      </section>

      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="primary-button" type="submit" disabled={isSaving}>
          <Save size={18} aria-hidden="true" />
          {isSaving ? 'Guardando' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

function Field({ children, error, label }: { children: React.ReactNode; error?: string; label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

function RowTools({
  canMoveDown,
  canMoveUp,
  canRemove,
  onMoveDown,
  onMoveUp,
  onRemove,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  canRemove: boolean;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="row-tools">
      <button className="icon-button" type="button" onClick={onMoveUp} disabled={!canMoveUp} aria-label="Subir fila">
        <ArrowUp size={16} aria-hidden="true" />
      </button>
      <button className="icon-button" type="button" onClick={onMoveDown} disabled={!canMoveDown} aria-label="Bajar fila">
        <ArrowDown size={16} aria-hidden="true" />
      </button>
      <button className="icon-button danger" type="button" onClick={onRemove} disabled={!canRemove} aria-label="Eliminar fila">
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export default RecipeForm;
