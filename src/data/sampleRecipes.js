const now = new Date().toISOString();

export const sampleRecipes = [
  {
    id: 'recipe-tortilla',
    userId: 'demo-user',
    title: 'Tortilla de patatas con cebolla',
    description: 'Receta clasica para una cena rapida.',
    servings: 4,
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    deletedBy: null,
    version: 1,
    ingredients: [
      { id: 'ing-patata', position: 1, quantity: 4, unit: 'ud', name: 'patata', notes: 'medianas' },
      { id: 'ing-cebolla', position: 2, quantity: 1, unit: 'ud', name: 'cebolla', notes: '' },
      { id: 'ing-huevo', position: 3, quantity: 6, unit: 'ud', name: 'huevo', notes: '' },
    ],
    steps: [
      { id: 'step-cortar', position: 1, instruction: 'Pelar y cortar las patatas en laminas.', timerMinutes: 8 },
      { id: 'step-pochar', position: 2, instruction: 'Pochar patata y cebolla a fuego medio.', timerMinutes: 18 },
      { id: 'step-cuajar', position: 3, instruction: 'Mezclar con huevo y cuajar por ambos lados.', timerMinutes: 10 },
    ],
  },
  {
    id: 'recipe-pasta',
    userId: 'demo-user',
    title: 'Pasta con tomate y albahaca',
    description: 'Plato sencillo con ingredientes basicos.',
    servings: 2,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    deletedBy: null,
    version: 1,
    ingredients: [
      { id: 'ing-pasta', position: 1, quantity: 200, unit: 'g', name: 'pasta', notes: '' },
      { id: 'ing-tomate', position: 2, quantity: 250, unit: 'g', name: 'tomate', notes: 'triturado' },
      { id: 'ing-albahaca', position: 3, quantity: 6, unit: 'hojas', name: 'albahaca', notes: '' },
    ],
    steps: [
      { id: 'step-cocer-pasta', position: 1, instruction: 'Cocer la pasta en agua con sal.', timerMinutes: 10 },
      { id: 'step-salsa', position: 2, instruction: 'Reducir el tomate y mezclar con albahaca.', timerMinutes: 8 },
      { id: 'step-mezclar', position: 3, instruction: 'Unir pasta y salsa antes de servir.', timerMinutes: 2 },
    ],
  },
];
