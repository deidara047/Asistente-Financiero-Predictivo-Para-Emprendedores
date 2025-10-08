const categories: { [key: string]: string[] } = {
  Transporte: ['uber', 'taxi', 'gasolina', 'bus', 'combustible'],
  Alimentación: ['supermercado', 'restaurante', 'comida', 'almuerzo', 'cena', 'desayuno'],
  Entretenimiento: ['cine', 'netflix', 'spotify', 'bar', 'juego', 'música'],
  Servicios: ['agua', 'luz', 'internet', 'teléfono', 'electricidad'],
  Otros: [],
};

export const categorizeTransaction = (description: string): string | null => {
  const lowerDesc = description.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category;
    }
  }
  return null;
};