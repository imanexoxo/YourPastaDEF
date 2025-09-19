import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, lastValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Piatto } from '../dto/piatto.model';
import { ImageService } from './image.service';
import { PiattoItemService } from './piatto-item.service';
import { InventarioService } from './inventario.service';
import { UtenteService } from './utente.service';

@Injectable({
  providedIn: 'root'
})
export class PiattoService {
  private readonly API = 'http://localhost:8080/api/piatto';

  constructor(
    private http: HttpClient, 
    private imageService: ImageService,
    private piattoItemService: PiattoItemService,
    private inventarioService: InventarioService,
    private utenteService: UtenteService
  ) {}

  // Crea piatto
  // Prende un oggetto piatto dal frontend, manda una richiesta POST e riceve il piatto creato dal backend
  creaPiatto(piatto: any): Observable<Piatto> {
    return this.http.post<Piatto>(`${this.API}/nuovo`, piatto);
  }

  // Trova piatti per utente
  // Prende l'id utente dal frontend, manda una richiesta GET e riceve una lista di piatti dal backend
  getPiattiPerUtente(utenteId: number): Observable<Piatto[]> {
    return this.http.get<Piatto[]>(`${this.API}/utente/${utenteId}`);
  }

  // Trova tutti i piatti
  // Non prende nulla dal frontend, manda una richiesta GET e riceve una lista di piatti dal backend
  getTuttiPiatti(): Observable<Piatto[]> {
    return this.http.get<Piatto[]>(this.API);
  }

  // Trova piatto per ID
  // Prende l'id dal frontend, manda una richiesta GET e riceve il piatto corrispondente dal backend
  getPiattoPerId(id: number): Observable<Piatto> {
    return this.http.get<Piatto>(`${this.API}/${id}`);
  }

  // Cerca piatti per nome
  // Prende il nome dal frontend, manda una richiesta GET e riceve una lista di piatti dal backend
  cercaPerNome(nome: string): Observable<Piatto[]> {
    return this.http.get<Piatto[]>(`${this.API}/cerca?nome=${nome}`);
  }

  // Ottiene il nome utente dall'utenteId
  async getNomeUtenteDaId(utenteId: number): Promise<string> {
    try {
      const utente = await lastValueFrom(this.utenteService.trovaUtentePerId(utenteId));
      return utente?.nome || 'Utente sconosciuto';
    } catch (error) {
      console.error('Errore nel recupero utente:', error);
      return 'Utente sconosciuto';
    }
  }

  // Ottiene le immagini degli ingredienti di un piatto ordinati per ID
  async getImmaginiIngredienti(piatto: Piatto): Promise<string[]> {
    if (!piatto.id) {
      return this.imageService.generateDefaultIngredientImages(1);
    }

    try {
      // 1. Ottieni i piatto_item per questo piatto
      const piattoItems = await this.piattoItemService.getPerPiattoId(piatto.id).toPromise();
      
      if (!piattoItems || piattoItems.length === 0) {
        return this.imageService.generateDefaultIngredientImages(piatto.id);
      }

      // 2. Estrai e ordina gli ingrediente_id
      const ingredientiIds = piattoItems
        .filter(item => item.ingredienteId)
        .sort((a, b) => a.ingredienteId - b.ingredienteId)
        .map(item => item.ingredienteId);

      // 3. Delega al ImageService la generazione delle immagini
      return this.imageService.getImmaginiPerIngredienti(ingredientiIds);
    } catch (error) {
      console.error('Errore nel caricamento immagini ingredienti:', error);
      return this.imageService.generateDefaultIngredientImages(piatto.id);
    }
  }

  // Ottiene i nomi degli ingredienti di un piatto
  async getNomiIngredienti(piatto: Piatto): Promise<string[]> {
    if (!piatto.id) {
      return this.generateDefaultIngredientNames(1);
    }

    try {
      // 1. Ottieni i piatto_item per questo piatto
      const piattoItems = await this.piattoItemService.getPerPiattoId(piatto.id).toPromise();
      
      if (!piattoItems || piattoItems.length === 0) {
        return this.generateDefaultIngredientNames(piatto.id);
      }

      // 2. Per ogni piatto_item, ottieni i dettagli dell'ingrediente dall'inventario
      const ingredientiDetails = await Promise.all(
        piattoItems.map(async (item) => {
          try {
            const ingrediente = await this.inventarioService.trovaArticoloPerId(item.ingredienteId).toPromise();
            return ingrediente ? `${ingrediente.nome} x${item.quantita}` : `Ingrediente ${item.ingredienteId} x${item.quantita}`;
          } catch (error) {
            console.error(`Errore nel caricamento ingrediente ${item.ingredienteId}:`, error);
            return `Ingrediente ${item.ingredienteId} x${item.quantita}`;
          }
        })
      );

      return ingredientiDetails;
    } catch (error) {
      console.error('Errore nel caricamento nomi ingredienti:', error);
      return this.generateDefaultIngredientNames(piatto.id);
    }
  }

  // Verifica la disponibilità degli ingredienti di un piatto
  async verificaDisponibilitaIngredienti(piatto: Piatto): Promise<{disponibile: boolean, ingredientiMancanti: string[]}> {
    if (!piatto.id) {
      return { disponibile: false, ingredientiMancanti: ['Piatto non valido'] };
    }

    try {
      // 1. Ottieni i piatto_item per questo piatto
      const piattoItems = await this.piattoItemService.getPerPiattoId(piatto.id).toPromise();
      
      if (!piattoItems || piattoItems.length === 0) {
        return { disponibile: false, ingredientiMancanti: ['Ingredienti non trovati'] };
      }

      const ingredientiMancanti: string[] = [];

      // 2. Verifica ogni ingrediente
      for (const item of piattoItems) {
        try {
          const ingrediente = await this.inventarioService.trovaArticoloPerId(item.ingredienteId).toPromise();
          if (!ingrediente || ingrediente.quantita <= 0) {
            ingredientiMancanti.push(ingrediente?.nome || `Ingrediente ${item.ingredienteId}`);
          }
        } catch (error) {
          console.error(`Errore nel controllo ingrediente ${item.ingredienteId}:`, error);
          ingredientiMancanti.push(`Ingrediente ${item.ingredienteId}`);
        }
      }

      return {
        disponibile: ingredientiMancanti.length === 0,
        ingredientiMancanti: ingredientiMancanti
      };
    } catch (error) {
      console.error('Errore nella verifica disponibilità ingredienti:', error);
      return { disponibile: false, ingredientiMancanti: ['Errore nella verifica'] };
    }
  }

  // Genera nomi di ingredienti di esempio per fallback
  private generateDefaultIngredientNames(piattoId: number): string[] {
    const ingredienti = [
      'Pasta x100g', 'Pomodoro x50g', 'Basilico x10g', 
      'Mozzarella x80g', 'Olio EVO x20ml', 'Parmigiano x30g',
      'Aglio x5g', 'Peperoncino x2g', 'Pancetta x40g', 'Pepe nero x1g'
    ];
    
    const numberOfIngredients = 2 + (piattoId % 3);
    const selected = [];
    
    for (let i = 0; i < numberOfIngredients; i++) {
      const ingrediente = ingredienti[(piattoId + i) % ingredienti.length];
      selected.push(ingrediente);
    }
    
    return selected;
  }
}