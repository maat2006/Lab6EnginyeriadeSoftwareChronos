import { Clock, Edit3, Trash2, Users } from 'lucide-react';
import type { Recipe } from '../types';

type RecipeDetailProps = {
  recipe: Recipe | null;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
};

function RecipeDetail({ onDelete, onEdit, recipe }: RecipeDetailProps) {
  if (!recipe) {
    return (
      <section className="recipe-detail empty-detail">
        <h2>Selecciona una receta</h2>
        <p>El detalle aparecera aqui.</p>
      </section>
    );
  }

  return (
    <section className="recipe-detail" aria-label="Detalle de receta">
      <div className="detail-top">
        <div>
          <h2>{recipe.title}</h2>
          <p>{recipe.description || 'Sin descripcion'}</p>
        </div>
        <div className="detail-actions">
          <button className="icon-button" type="button" onClick={() => onEdit(recipe)} aria-label="Editar receta">
            <Edit3 size={18} aria-hidden="true" />
          </button>
          <button className="icon-button danger" type="button" onClick={() => onDelete(recipe)} aria-label="Eliminar receta">
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="detail-metrics">
        <span>
          <Users size={17} aria-hidden="true" />
          {recipe.servings} porciones
        </span>
        <span>
          <Clock size={17} aria-hidden="true" />
          {recipe.prepTimeMinutes} min prep
        </span>
        <span>
          <Clock size={17} aria-hidden="true" />
          {recipe.cookTimeMinutes} min coccion
        </span>
      </div>

      <div className="detail-columns">
        <div>
          <h3>Ingredientes</h3>
          <ul className="ingredient-list">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id}>
                <strong>
                  {ingredient.quantity} {ingredient.unit}
                </strong>
                <span>{ingredient.name}</span>
                {ingredient.notes && <small>{ingredient.notes}</small>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Pasos</h3>
          <ol className="step-list">
            {recipe.steps.map((step) => (
              <li key={step.id}>
                <span>{step.instruction}</span>
                {step.timerMinutes !== undefined && <small>{step.timerMinutes} min</small>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default RecipeDetail;
