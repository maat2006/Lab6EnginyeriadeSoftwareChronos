import { Clock, Edit3, Soup, Trash2, Users } from 'lucide-react';
import type { Recipe } from '../types';

type RecipeListProps = {
  recipes: Recipe[];
  selectedId: string | null;
  onSelect: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
};

function RecipeList({ recipes, selectedId, onDelete, onEdit, onSelect }: RecipeListProps) {
  if (!recipes.length) {
    return (
      <section className="empty-state">
        <Soup size={34} aria-hidden="true" />
        <h2>No se encontraron recetas</h2>
        <p>Ajusta la busqueda o crea una receta nueva.</p>
      </section>
    );
  }

  return (
    <section className="recipe-list" aria-label="Listado de recetas">
      {recipes.map((recipe) => (
        <article className={`recipe-card ${selectedId === recipe.id ? 'is-selected' : ''}`} key={recipe.id}>
          <button className="recipe-main" type="button" onClick={() => onSelect(recipe)}>
            <span className="recipe-title">{recipe.title}</span>
            <span className="recipe-description">{recipe.description || 'Sin descripcion'}</span>
            <span className="recipe-meta">
              <span>
                <Users size={15} aria-hidden="true" />
                {recipe.servings}
              </span>
              <span>
                <Clock size={15} aria-hidden="true" />
                {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min
              </span>
              <span>v{recipe.version}</span>
            </span>
            <span className="ingredient-chips">
              {recipe.ingredients.slice(0, 4).map((ingredient) => (
                <span key={ingredient.id}>{ingredient.name}</span>
              ))}
            </span>
          </button>

          <div className="recipe-actions">
            <button className="icon-button" type="button" onClick={() => onEdit(recipe)} aria-label={`Editar ${recipe.title}`}>
              <Edit3 size={17} aria-hidden="true" />
            </button>
            <button
              className="icon-button danger"
              type="button"
              onClick={() => onDelete(recipe)}
              aria-label={`Eliminar ${recipe.title}`}
            >
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

export default RecipeList;
