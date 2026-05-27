export type Ingredient = {
  id: string;
  position: number;
  quantity: number;
  unit: string;
  name: string;
  notes?: string;
};

export type RecipeStep = {
  id: string;
  position: number;
  instruction: string;
  timerMinutes?: number;
};

export type Recipe = {
  id: string;
  userId: string;
  title: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
  version: number;
};

export type RecipeInput = {
  title: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  ingredients: Array<Omit<Ingredient, 'id' | 'position'>>;
  steps: Array<Omit<RecipeStep, 'id' | 'position'>>;
};

export type SearchFilters = {
  query: string;
  ingredients: string[];
  match: 'all' | 'any';
};

export type RecipeVersion = {
  id: string;
  recipeId: string;
  snapshot: Recipe;
  createdAt: string;
};
