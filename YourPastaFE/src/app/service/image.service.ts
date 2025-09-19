import { Injectable } from '@angular/core';

// Servizio per gestire le immagini degli ingredienti
// Le immagini sono nominate con il formato {id}.png
// Se l'immagine non esiste, usa default.png

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  // Ottiene l'immagine basandosi sull'ID
  getImageById(id: number | null | undefined): string {
    if (!id || id <= 0) {
      console.log('ID non valido:', id, '-> usando default.png');
      return 'assets/images/default.png';
    }
    const imagePath = `assets/images/${id}.png`;
    console.log('ID valido:', id, '-> path:', imagePath);
    return imagePath;
  }

  // Genera il testo alt per l'immagine basandosi sul nome dell'ingrediente
  getImageAlt(nome: string | null | undefined): string {
    if (!nome || nome.trim() === '') {
      return 'Ingrediente';
    }
    return nome.trim();
  }

  // Restituisce sempre l'immagine di default
  getDefaultImage(): string {
    return 'assets/images/default.png';
  }

  // Ottiene l'immagine per un ingrediente basandosi sul nome
  getImageForIngredient(nomeIngrediente: string): string {

    // Cerca di mappare il nome a un ID (implementazione semplificata)
    const ingredientMap: { [key: string]: number } = {
      'spaghetti': 1,
      'penne': 2,
      'fusilli': 3,
      'farfalle': 4,
      'rigatoni': 5,
      'linguine': 6,
      'tagliatelle': 7,
      'tortellini': 8,
      'aglio': 9,
      'olio': 10,
      'pomodoro': 11,
      'basilico': 12
    };
    
    const id = ingredientMap[nomeIngrediente.toLowerCase()];
    return this.getImageById(id);
  }

  // Verifica se un'immagine esiste
  async checkImageExists(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = this.getImageById(id);
    });
  }

  // Genera immagini per ingredienti di un piatto (basato su lista di ingrediente_id)
  getImmaginiPerIngredienti(ingredientiIds: number[]): string[] {
    if (!ingredientiIds || ingredientiIds.length === 0) {
      return [this.getDefaultImage()];
    }

    return ingredientiIds.map(id => this.getImageById(id));
  }

  // Genera immagini di ingredienti di esempio per fallback
  generateDefaultIngredientImages(piattoId: number): string[] {
    // Algoritmo semplice per generare IDs basati sull'ID del piatto
    const baseIds = [1, 5, 9, 12, 15]; // IDs di esempio
    const numberOfIngredients = 2 + (piattoId % 3); // 2-4 ingredienti
    const selectedIds = [];
    
    for (let i = 0; i < numberOfIngredients; i++) {
      const id = baseIds[(piattoId + i) % baseIds.length];
      selectedIds.push(this.getImageById(id));
    }
    
    return selectedIds;
  }
}