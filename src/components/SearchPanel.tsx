import { FormEvent, KeyboardEvent, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { SearchFilters } from '../types';

type SearchPanelProps = {
  filters: SearchFilters;
  ingredientOptions: string[];
  onChange: (filters: SearchFilters) => void;
  onClear: () => void;
};

function SearchPanel({ filters, ingredientOptions, onChange, onClear }: SearchPanelProps) {
  const [ingredientDraft, setIngredientDraft] = useState('');

  const addIngredient = () => {
    const value = ingredientDraft.trim();
    if (!value) return;

    const exists = filters.ingredients.some((ingredient) => ingredient.toLowerCase() === value.toLowerCase());
    if (!exists) {
      onChange({ ...filters, ingredients: [...filters.ingredients, value] });
    }
    setIngredientDraft('');
  };

  const removeIngredient = (ingredientToRemove: string) => {
    onChange({
      ...filters,
      ingredients: filters.ingredients.filter((ingredient) => ingredient !== ingredientToRemove),
    });
  };

  const submitIngredient = (event: FormEvent) => {
    event.preventDefault();
    addIngredient();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addIngredient();
    }
  };

  return (
    <section className="search-panel" aria-label="Busqueda de recetas">
      <label className="search-input">
        <Search size={18} aria-hidden="true" />
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Buscar por nombre o ingrediente"
        />
      </label>

      <form className="ingredient-filter" onSubmit={submitIngredient}>
        <input
          list="ingredient-options"
          value={ingredientDraft}
          onChange={(event) => setIngredientDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ingrediente"
        />
        <datalist id="ingredient-options">
          {ingredientOptions.map((ingredient) => (
            <option key={ingredient} value={ingredient} />
          ))}
        </datalist>
        <button className="icon-button" type="submit" aria-label="Añadir ingrediente al filtro">
          <Plus size={18} aria-hidden="true" />
        </button>
      </form>

      <div className="segmented-control" aria-label="Modo de coincidencia">
        <button
          className={filters.match === 'all' ? 'is-active' : ''}
          type="button"
          onClick={() => onChange({ ...filters, match: 'all' })}
        >
          Todos
        </button>
        <button
          className={filters.match === 'any' ? 'is-active' : ''}
          type="button"
          onClick={() => onChange({ ...filters, match: 'any' })}
        >
          Alguno
        </button>
      </div>

      <button className="clear-button" type="button" onClick={onClear}>
        <X size={17} aria-hidden="true" />
        Limpiar
      </button>

      {filters.ingredients.length > 0 && (
        <div className="filter-tags">
          {filters.ingredients.map((ingredient) => (
            <button key={ingredient} type="button" onClick={() => removeIngredient(ingredient)}>
              {ingredient}
              <X size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default SearchPanel;
