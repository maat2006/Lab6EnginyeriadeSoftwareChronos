import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import RecipeList from './components/RecipeList';
import SearchPanel from './components/SearchPanel';
import UndoToast, { type UndoToastState } from './components/UndoToast';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { recipeApi } from './services/recipeApi.js';
import type { Recipe, RecipeInput, SearchFilters } from './types';

const initialFilters: SearchFilters = {
  query: '',
  ingredients: [],
  match: 'all',
};

function App() {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<UndoToastState | null>(null);

  const debouncedFilters = useDebouncedValue(filters, 260);
  const selectedRecipe = useMemo(() => recipes.find((recipe) => recipe.id === selectedId) ?? recipes[0] ?? null, [recipes, selectedId]);
  const formIsOpen = isCreating || Boolean(editingRecipe);

  const refreshRecipes = async () => {
    setIsLoading(true);
    const [nextRecipes, nextIngredients] = await Promise.all([
      recipeApi.search(debouncedFilters),
      recipeApi.getIngredientOptions(),
    ]);
    setRecipes(nextRecipes as Recipe[]);
    setIngredientOptions(nextIngredients as string[]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshRecipes();
  }, [debouncedFilters]);

  useEffect(() => {
    if (!recipes.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !recipes.some((recipe) => recipe.id === selectedId)) {
      setSelectedId(recipes[0].id);
    }
  }, [recipes, selectedId]);

  useEffect(() => {
    if (!toast) return;

    if (toast.secondsLeft <= 0) {
      setToast(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast((current) => (current ? { ...current, secondsLeft: current.secondsLeft - 1 } : null));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const openCreateForm = () => {
    setServerErrors({});
    setEditingRecipe(null);
    setIsCreating(true);
  };

  const openEditForm = (recipe: Recipe) => {
    setServerErrors({});
    setIsCreating(false);
    setEditingRecipe(recipe);
  };

  const closeForm = () => {
    setServerErrors({});
    setIsCreating(false);
    setEditingRecipe(null);
  };

  const handleSubmit = async (payload: RecipeInput) => {
    setIsSaving(true);
    setServerErrors({});

    try {
      if (editingRecipe) {
        const result = (await recipeApi.update(editingRecipe.id, payload)) as {
          recipe: Recipe;
          previousVersionId: string;
        };
        closeForm();
        await refreshRecipes();
        setSelectedId(result.recipe.id);
        showUndoToast('Receta actualizada', 'Deshacer cambios', async () => {
          await recipeApi.restoreVersion(result.recipe.id, result.previousVersionId);
          await refreshRecipes();
          setSelectedId(result.recipe.id);
        });
      } else {
        const createdRecipe = (await recipeApi.create(payload)) as Recipe;
        closeForm();
        await refreshRecipes();
        setSelectedId(createdRecipe.id);
        showUndoToast('Receta creada', 'Deshacer alta', async () => {
          await recipeApi.delete(createdRecipe.id);
          await refreshRecipes();
        });
      }
    } catch (error) {
      if (recipeApi.isValidationError(error)) {
        setServerErrors((error as { errors: Record<string, string> }).errors);
      } else {
        setServerErrors({ form: error instanceof Error ? error.message : 'No se pudo guardar la receta.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (recipe: Recipe) => {
    await recipeApi.delete(recipe.id);
    await refreshRecipes();
    showUndoToast('Receta eliminada', 'Deshacer', async () => {
      await recipeApi.restore(recipe.id);
      await refreshRecipes();
      setSelectedId(recipe.id);
    });
  };

  const showUndoToast = (message: string, actionLabel: string, undoAction: () => Promise<void>) => {
    const id = window.crypto?.randomUUID?.() ?? String(Date.now());

    setToast({
      id,
      message,
      actionLabel,
      secondsLeft: 5,
      onUndo: async () => {
        await undoAction();
        setToast(null);
      },
    });
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Chronos Kitchen</p>
          <h1>Gestor de recetas</h1>
        </div>
        <button className="primary-button" type="button" onClick={openCreateForm}>
          <Plus size={18} aria-hidden="true" />
          Nueva receta
        </button>
      </header>

      <SearchPanel
        filters={filters}
        ingredientOptions={ingredientOptions}
        onChange={setFilters}
        onClear={() => setFilters(initialFilters)}
      />

      <section className="status-bar" aria-label="Resumen">
        <span>{recipes.length} recetas</span>
        <span>{ingredientOptions.length} ingredientes</span>
        <button className="text-button" type="button" onClick={refreshRecipes}>
          <RefreshCw size={16} aria-hidden="true" />
          Actualizar
        </button>
      </section>

      {serverErrors.form && <div className="global-error">{serverErrors.form}</div>}

      <div className="recipes-workspace">
        <div className="left-column">
          {isLoading ? (
            <section className="loading-panel">Cargando recetas...</section>
          ) : (
            <RecipeList
              recipes={recipes}
              selectedId={selectedRecipe?.id ?? null}
              onDelete={handleDelete}
              onEdit={openEditForm}
              onSelect={(recipe) => setSelectedId(recipe.id)}
            />
          )}
        </div>

        <div className="right-column">
          {formIsOpen ? (
            <RecipeForm
              initialRecipe={editingRecipe}
              isSaving={isSaving}
              serverErrors={serverErrors}
              onCancel={closeForm}
              onSubmit={handleSubmit}
            />
          ) : (
            <RecipeDetail recipe={selectedRecipe} onDelete={handleDelete} onEdit={openEditForm} />
          )}
        </div>
      </div>

      <UndoToast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}

export default App;
