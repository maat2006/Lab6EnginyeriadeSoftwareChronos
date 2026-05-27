import type { Recipe, RecipeInput, SearchFilters } from '../types';

export const recipeApi: {
  search(filters?: SearchFilters): Promise<Recipe[]>;
  getIngredientOptions(): Promise<string[]>;
  create(payload: RecipeInput): Promise<Recipe>;
  update(recipeId: string, payload: RecipeInput): Promise<{
    recipe: Recipe;
    previousVersionId: string;
  }>;
  delete(recipeId: string): Promise<Recipe>;
  restore(recipeId: string): Promise<Recipe>;
  restoreVersion(recipeId: string, versionId: string): Promise<Recipe>;
  isValidationError(error: unknown): boolean;
};
