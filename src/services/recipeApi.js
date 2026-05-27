import { sampleRecipes } from '../data/sampleRecipes.js';

const RECIPES_KEY = 'chronos.recipes';
const VERSIONS_KEY = 'chronos.recipeVersions';
const CURRENT_USER_ID = 'demo-user';

class ApiValidationError extends Error {
  constructor(errors) {
    super('Recipe validation failed');
    this.name = 'ApiValidationError';
    this.errors = errors;
  }
}

const clone = (value) => JSON.parse(JSON.stringify(value));

const createId = (prefix) => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const readJson = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (!raw) return clone(fallback);

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return clone(fallback);
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getRecipes = () => readJson(RECIPES_KEY, sampleRecipes);
const saveRecipes = (recipes) => writeJson(RECIPES_KEY, recipes);
const getVersions = () => readJson(VERSIONS_KEY, []);
const saveVersions = (versions) => writeJson(VERSIONS_KEY, versions);

const wait = (value) => new Promise((resolve) => window.setTimeout(() => resolve(clone(value)), 120));

const validateRecipeInput = (payload) => {
  const errors = {};
  const title = payload.title?.trim() ?? '';

  if (title.length < 3) errors.title = 'El titulo debe tener al menos 3 caracteres.';
  if (Number(payload.servings) <= 0) errors.servings = 'Las porciones deben ser mayores que 0.';
  if (Number(payload.prepTimeMinutes) < 0) errors.prepTimeMinutes = 'El tiempo de preparacion no puede ser negativo.';
  if (Number(payload.cookTimeMinutes) < 0) errors.cookTimeMinutes = 'El tiempo de coccion no puede ser negativo.';
  if (!payload.ingredients?.length) errors.ingredients = 'La receta necesita al menos un ingrediente.';
  if (!payload.steps?.length) errors.steps = 'La receta necesita al menos un paso.';

  payload.ingredients?.forEach((ingredient, index) => {
    if (!ingredient.name?.trim()) errors[`ingredient-${index}-name`] = 'El nombre del ingrediente es obligatorio.';
    if (Number(ingredient.quantity) <= 0) errors[`ingredient-${index}-quantity`] = 'La cantidad debe ser mayor que 0.';
  });

  payload.steps?.forEach((step, index) => {
    if (!step.instruction?.trim()) errors[`step-${index}-instruction`] = 'La instruccion del paso es obligatoria.';
    if (step.timerMinutes !== undefined && Number(step.timerMinutes) < 0) {
      errors[`step-${index}-timer`] = 'El temporizador no puede ser negativo.';
    }
  });

  if (Object.keys(errors).length) {
    throw new ApiValidationError(errors);
  }
};

const normalizeRecipeInput = (payload) => {
  validateRecipeInput(payload);

  return {
    title: payload.title.trim(),
    description: payload.description?.trim() ?? '',
    servings: Number(payload.servings),
    prepTimeMinutes: Number(payload.prepTimeMinutes),
    cookTimeMinutes: Number(payload.cookTimeMinutes),
    ingredients: payload.ingredients.map((ingredient, index) => ({
      id: ingredient.id ?? createId('ingredient'),
      position: index + 1,
      quantity: Number(ingredient.quantity),
      unit: ingredient.unit?.trim() ?? '',
      name: ingredient.name.trim(),
      notes: ingredient.notes?.trim() ?? '',
    })),
    steps: payload.steps.map((step, index) => ({
      id: step.id ?? createId('step'),
      position: index + 1,
      instruction: step.instruction.trim(),
      timerMinutes: step.timerMinutes === '' || step.timerMinutes === undefined ? undefined : Number(step.timerMinutes),
    })),
  };
};

const assertEditableRecipe = (recipes, recipeId) => {
  const recipe = recipes.find((item) => item.id === recipeId);
  if (!recipe || recipe.deletedAt) {
    throw new Error('La receta no existe o esta eliminada.');
  }

  if (recipe.userId !== CURRENT_USER_ID) {
    throw new Error('No tienes permisos para modificar esta receta.');
  }

  return recipe;
};

const saveVersion = (recipe) => {
  const version = {
    id: createId('version'),
    recipeId: recipe.id,
    snapshot: clone(recipe),
    createdAt: new Date().toISOString(),
  };
  saveVersions([version, ...getVersions()]);
  return version.id;
};

export const recipeApi = {
  async search({ query = '', ingredients = [], match = 'all' } = {}) {
    const normalizedQuery = normalizeText(query);
    const normalizedIngredients = ingredients.map(normalizeText).filter(Boolean);

    const recipes = getRecipes()
      .filter((recipe) => recipe.userId === CURRENT_USER_ID && !recipe.deletedAt)
      .filter((recipe) => {
        if (!normalizedQuery) return true;

        const haystack = normalizeText(
          [recipe.title, recipe.description, ...recipe.ingredients.map((ingredient) => ingredient.name)].join(' '),
        );
        return haystack.includes(normalizedQuery);
      })
      .filter((recipe) => {
        if (!normalizedIngredients.length) return true;

        const ingredientNames = recipe.ingredients.map((ingredient) => normalizeText(ingredient.name));
        const matcher = (filter) => ingredientNames.some((name) => name.includes(filter));
        return match === 'any' ? normalizedIngredients.some(matcher) : normalizedIngredients.every(matcher);
      })
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());

    return wait(recipes);
  },

  async getIngredientOptions() {
    const names = getRecipes()
      .filter((recipe) => recipe.userId === CURRENT_USER_ID && !recipe.deletedAt)
      .flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.name.trim()))
      .filter(Boolean);

    return wait([...new Set(names)].sort((left, right) => left.localeCompare(right)));
  },

  async create(payload) {
    const now = new Date().toISOString();
    const normalized = normalizeRecipeInput(payload);
    const recipe = {
      id: createId('recipe'),
      userId: CURRENT_USER_ID,
      ...normalized,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deletedBy: null,
      version: 1,
    };

    saveRecipes([recipe, ...getRecipes()]);
    return wait(recipe);
  },

  async update(recipeId, payload) {
    const recipes = getRecipes();
    const recipe = assertEditableRecipe(recipes, recipeId);
    const previousVersionId = saveVersion(recipe);
    const normalized = normalizeRecipeInput(payload);
    const now = new Date().toISOString();

    const updated = {
      ...recipe,
      ...normalized,
      updatedAt: now,
      version: recipe.version + 1,
    };

    saveRecipes(recipes.map((item) => (item.id === recipeId ? updated : item)));
    return wait({ recipe: updated, previousVersionId });
  },

  async delete(recipeId) {
    const recipes = getRecipes();
    const recipe = assertEditableRecipe(recipes, recipeId);
    const deleted = {
      ...recipe,
      deletedAt: new Date().toISOString(),
      deletedBy: CURRENT_USER_ID,
    };

    saveRecipes(recipes.map((item) => (item.id === recipeId ? deleted : item)));
    return wait(deleted);
  },

  async restore(recipeId) {
    const recipes = getRecipes();
    const recipe = recipes.find((item) => item.id === recipeId);

    if (!recipe || recipe.userId !== CURRENT_USER_ID) {
      throw new Error('No se puede restaurar esta receta.');
    }

    const restored = {
      ...recipe,
      deletedAt: null,
      deletedBy: null,
      updatedAt: new Date().toISOString(),
    };

    saveRecipes(recipes.map((item) => (item.id === recipeId ? restored : item)));
    return wait(restored);
  },

  async restoreVersion(recipeId, versionId) {
    const recipes = getRecipes();
    const current = assertEditableRecipe(recipes, recipeId);
    const version = getVersions().find((item) => item.id === versionId && item.recipeId === recipeId);

    if (!version) {
      throw new Error('No existe una version previa para restaurar.');
    }

    const restored = {
      ...version.snapshot,
      deletedAt: null,
      deletedBy: null,
      updatedAt: new Date().toISOString(),
      version: current.version + 1,
    };

    saveRecipes(recipes.map((item) => (item.id === recipeId ? restored : item)));
    return wait(restored);
  },

  isValidationError(error) {
    return error instanceof ApiValidationError;
  },
};
