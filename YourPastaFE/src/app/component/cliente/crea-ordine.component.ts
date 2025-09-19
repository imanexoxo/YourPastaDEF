import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { lastValueFrom } from 'rxjs';

import { Utente } from '../../dto/utente.model';
import { Inventario } from '../../dto/inventario.model';
import { Piatto } from '../../dto/piatto.model';
import { PiattoItem } from '../../dto/piatto-item.model';

import { SessionService } from '../../service/session.service';
import { InventarioService } from '../../service/inventario.service';
import { PiattoService } from '../../service/piatto.service';
import { PiattoItemService } from '../../service/piatto-item.service';
import { CarrelloService } from '../../service/carrello.service';
import { ImageService } from '../../service/image.service';

/**
 * NUOVO FLUSSO CREAZIONE PIATTO PERSONALIZZATO
 * 
 * STEP 1: Utente seleziona ingredienti per categoria (pasta, sugo, proteine, etc.)
 * STEP 2: Ingredienti selezionati → creazione PiattoItem records nel database
 * STEP 3: PiattoItem completati → creazione Piatto nel database
 * STEP 4: Piatto completo → aggiunto al Carrello tramite CarrelloService
 * STEP 5: Dal Carrello → Checkout → Ordine finale
 * 
 * BENEFICI:
 * - Separazione delle responsabilità: creazione piatto vs gestione carrello
 * - Persistenza corretta: piatti salvati nel database con ingredienti associati
 * - Riutilizzabilità: piatti creati possono essere riordinati
 * - Architettura pulita: ogni step ha una responsabilità specifica
 */

interface IngredienteSelezionato {
  ingrediente: Inventario;
  quantita: number;
}

interface StepCreazione {
  titolo: string;
  categoria: string;
  descrizione: string;
  obbligatorio: boolean;
}

@Component({
  selector: 'app-crea-ordine',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatBadgeModule,
    MatIconModule,
    MatStepperModule,
    MatDividerModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './crea-ordine.component.html',
  styleUrls: ['./crea-ordine.component.css']
})
export class CreaOrdineComponent implements OnInit {
  
  // Stato utente
  utenteCorrente: Utente | null = null;
  
  // Stato wizard
  currentStep = 0;
  isLoading = false;
  
  // Ingredienti disponibili per lo step corrente
  ingredientiDisponibili: Inventario[] = [];
  
  // Ingredienti selezionati per il piatto in costruzione
  ingredientiSelezionati: IngredienteSelezionato[] = [];
  
  // Nome personalizzato del piatto
  nomePiattoPersonalizzato: string = '';
  
  // Configurazione steps del wizard
  steps: StepCreazione[] = [
    {
      titolo: 'Scegli la Pasta',
      categoria: 'pasta',
      descrizione: 'Seleziona il tipo di pasta per il tuo piatto',
      obbligatorio: true
    },
    {
      titolo: 'Aggiungi Condimenti',
      categoria: 'condimenti',
      descrizione: 'Scegli i condimenti per la tua pasta',
      obbligatorio: false
    },
    {
      titolo: 'Proteine',
      categoria: 'proteine',
      descrizione: 'Aggiungi proteine al tuo piatto',
      obbligatorio: false
    },
    {
      titolo: 'Verdure e Formaggi',
      categoria: 'verdure_formaggi',
      descrizione: 'Personalizza con verdure e formaggi',
      obbligatorio: false
    },
    {
      titolo: 'Topping',
      categoria: 'topping',
      descrizione: 'Completa con i tuoi topping preferiti',
      obbligatorio: false
    },
    {
      titolo: 'Finalizza Piatto',
      categoria: 'riepilogo',
      descrizione: 'Rivedi il tuo piatto e aggiungilo al carrello',
      obbligatorio: false
    }
  ];


  constructor(
    private sessionService: SessionService,
    private inventarioService: InventarioService,
    private piattoService: PiattoService,
    private piattoItemService: PiattoItemService,
    private carrelloService: CarrelloService,
    public imageService: ImageService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}


  // Carica l'utente
  async ngOnInit() {
    this.utenteCorrente = this.sessionService.getLoggedUser();
    if (!this.utenteCorrente) {
      this.router.navigate(['/login']);
      return;
    }
    
    await this.caricaIngredientiStep();
  }



  // Carica ingredienti per lo step corrente
  async caricaIngredientiStep() {
    if (this.isUltimoStep()) 
      return;
    
    const categoria = this.steps[this.currentStep].categoria;
    this.isLoading = true;
    
    try {
      if (categoria === 'condimenti') {
        // Carica sia condimento_pronto che condimento_base
        const [condimentiPronti, condimentiBase] = await Promise.all([
          lastValueFrom(this.inventarioService.trovaArticoliPerCategoria('condimento_pronto')),
          lastValueFrom(this.inventarioService.trovaArticoliPerCategoria('condimento_base'))
        ]);
        this.ingredientiDisponibili = [...condimentiPronti, ...condimentiBase];
      } else if (categoria === 'verdure_formaggi') {
        // Carica ingrediente_base
        this.ingredientiDisponibili = await lastValueFrom(
          this.inventarioService.trovaArticoliPerCategoria('ingrediente_base')
        );
      } else {
        // Carica categoria normale
      this.ingredientiDisponibili = await lastValueFrom(
        this.inventarioService.trovaArticoliPerCategoria(categoria)
      );
      }
      
      this.ingredientiDisponibili = this.ingredientiDisponibili.filter(i => i.quantita > 0);
      
    } catch (error) {
      console.error('Errore nel caricamento ingredienti:', error);
      this.snackBar.open('Errore nel caricamento ingredienti', 'Chiudi', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }



  aggiungiIngredienteAlPiatto(ingrediente: Inventario) {
    const esistente = this.ingredientiSelezionati.find(item => item.ingrediente.id === ingrediente.id);
    
    if (esistente) {
      if (esistente.quantita < ingrediente.quantita) {
        esistente.quantita++;
        this.snackBar.open(`Quantità ${ingrediente.nome} aumentata`, 'Chiudi', { duration: 1500 });
      } else {
        this.snackBar.open('Quantità massima raggiunta', 'Chiudi', { duration: 2000 });
        return;
      }
    } else {
      this.ingredientiSelezionati.push({ ingrediente, quantita: 1 });
      this.snackBar.open(`${ingrediente.nome} aggiunto al piatto`, 'Chiudi', { duration: 1500 });
    }
  }

  rimuoviIngredienteDalPiatto(ingrediente: Inventario) {
    const esistente = this.ingredientiSelezionati.find(item => item.ingrediente.id === ingrediente.id);
    
    if (esistente) {
      esistente.quantita--;
      if (esistente.quantita <= 0) {
        this.ingredientiSelezionati = this.ingredientiSelezionati.filter(item => item.ingrediente.id !== ingrediente.id);
      }
    }
  }

  getQuantitaInPiatto(ingrediente: Inventario): number {
    const item = this.ingredientiSelezionati.find(item => item.ingrediente.id === ingrediente.id);
    return item ? item.quantita : 0;
  }

  calcolaPrezzoTotalePiatto(): number {
    // Restituisce sempre il prezzo originale, senza applicare sconti
    // Gli sconti verranno applicati solo al checkout finale
    return this.ingredientiSelezionati.reduce((total, item) => 
      total + (item.ingrediente.prezzoUnitario * item.quantita), 0
    );
  }

  // Metodo per mostrare il prezzo scontato solo visivamente (senza salvarlo)
  calcolaPrezzoScontatoVisualizzazione(): number {
    const prezzoOriginale = this.calcolaPrezzoTotalePiatto();
    if (this.utenteCorrente?.ruolo === 'studente') {
      return prezzoOriginale * 0.8;
    }
    return prezzoOriginale;
  }



  // FUNZIONE CHE PREPARA IL PIATTO PER L'AGGIUNTA AL CARRELLO
  async finalizzaPiatto() {
    
    // Se il piatto è vuoto
    if (this.ingredientiSelezionati.length === 0) {
      this.snackBar.open('Aggiungi almeno un ingrediente al piatto', 'Chiudi', { duration: 3000 });
      return;
    }

    // Se manca il nome del piatto
    if (!this.nomePiattoPersonalizzato || this.nomePiattoPersonalizzato.trim().length === 0) {
      this.snackBar.open('Inserisci un nome per il tuo piatto personalizzato', 'Chiudi', { duration: 3000 });
      return;
    }

    // Se manca la pasta
    const haPasta = this.ingredientiSelezionati.some(item => item.ingrediente.categoria === 'pasta');
    if (!haPasta) {
      this.snackBar.open('Seleziona almeno un tipo di pasta', 'Chiudi', { duration: 3000 });
      return;
    }

    // CREAZIONE E SALVATAGGIO PIATTO NEL DATABASE
    try {
      this.isLoading = true;

      // Costruisci gli attributi del nuovo piatto
      const nomiIngredienti = this.ingredientiSelezionati.map(item => item.ingrediente.nome);
      const nomePiatto = this.nomePiattoPersonalizzato.trim();
      const descrizione = `Piatto creato con: ${nomiIngredienti.join(', ')}`;
      const prezzoTotale = this.calcolaPrezzoTotalePiatto();

      const nuovoPiatto: Piatto = {
        nome: nomePiatto,
        descrizione: descrizione,
        prezzo: prezzoTotale,
        utenteId: this.utenteCorrente?.id
      };

      // CREA IL PIATTO NEL DATABASE
      const piattoCreato = await lastValueFrom(this.piattoService.creaPiatto(nuovoPiatto));

      // CREA I PIATTO ITEMS NEL DATABASE
      for (const ingredienteSelezionato of this.ingredientiSelezionati) {
        if (!piattoCreato.id || !ingredienteSelezionato.ingrediente.id) {
          throw new Error('ID mancante per la creazione del PiattoItem');
        }
        
        const piattoItem: PiattoItem = {
          piattoId: piattoCreato.id,
          ingredienteId: ingredienteSelezionato.ingrediente.id,
          quantita: ingredienteSelezionato.quantita,
          prezzo: ingredienteSelezionato.ingrediente.prezzoUnitario * ingredienteSelezionato.quantita
        };
        
        // SALVA PIATTO ITEM NEL DATABASE
        await lastValueFrom(this.piattoItemService.creaPiattoItem(piattoItem));
      }

      // AGGIUNGI IL PIATTO CREATO AL CARRELLO
      this.carrelloService.aggiungiPiatto(piattoCreato, 1);

      // Reset del form
      this.ingredientiSelezionati = [];
      this.nomePiattoPersonalizzato = '';
      this.currentStep = 0;
      
      this.snackBar.open(`${nomePiatto} creato e aggiunto al carrello!`, 'Chiudi', { duration: 3000 });

      // Reindirizza automaticamente alla selezione bevande
      setTimeout(() => {
        this.router.navigate(['/inventario'], { 
          queryParams: { 
            categoria: 'bevande', 
            autoAddToCart: 'true',
            fromCreaOrdine: 'true'
          } 
        });
      }, 500);

    } catch (error) {
      console.error('Errore nella creazione del piatto:', error);
      this.snackBar.open('Errore nella creazione del piatto. Riprova.', 'Chiudi', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  
  prossimo() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      if (!this.isUltimoStep()) {
        this.caricaIngredientiStep();
      }
    }
  }

  precedente() {
    if (this.currentStep > 0) {
      this.currentStep--;
      if (!this.isUltimoStep()) {
        this.caricaIngredientiStep();
      }
    }
  }

  puoProcedere(): boolean {
    if (this.currentStep === 0) {
      return this.ingredientiSelezionati.some(item => item.ingrediente.categoria === 'pasta');
    }
    return true;
  }

  isUltimoStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  getTotalIngredienti(): number {
    return this.ingredientiSelezionati.reduce((total, item) => total + item.quantita, 0);
  }

  isPiattoValido(): boolean {
    return this.ingredientiSelezionati.length > 0 && 
           this.ingredientiSelezionati.some(item => item.ingrediente.categoria === 'pasta');
  }

  vaiAlCarrello() {
    this.router.navigate(['/carrello']);
  }

  ordinaSoloBevande() {
    this.router.navigate(['/inventario'], { queryParams: { categoria: 'bevande' } });
  }

  resetWizard() {
    this.ingredientiSelezionati = [];
    this.nomePiattoPersonalizzato = '';
    this.currentStep = 0;
    this.caricaIngredientiStep();
  }

  /**
   * OTTIENE L'ICONA PER OGNI STEP
   */
  getStepIcon(categoria: string): string {
    switch (categoria) {
      case 'pasta': return 'restaurant';
      case 'condimento_pronto': return 'local_dining';
      case 'condimento_base': return 'soup_kitchen';
      case 'proteine': return 'set_meal';
      case 'ingrediente_base': return 'eco';
      case 'topping': return 'star';
      case 'riepilogo': return 'check_circle';
      default: return 'restaurant';
    }
  }



  /**
   * GESTIONE QUANTITÀ INGREDIENTI
   */
  getQuantitaIngrediente(ingredienteId: number | undefined): number {
    if (!ingredienteId) return 0;
    const item = this.ingredientiSelezionati.find(i => i.ingrediente.id === ingredienteId);
    return item ? item.quantita : 0;
  }

  aggiungiIngrediente(ingrediente: Inventario) {
    if (ingrediente.quantita <= 0 || !ingrediente.id) return;

    const esistente = this.ingredientiSelezionati.find(i => i.ingrediente.id === ingrediente.id);
    if (esistente) {
      esistente.quantita++;
    } else {
      this.ingredientiSelezionati.push({
        ingrediente,
        quantita: 1
      });
    }
  }

  rimuoviIngrediente(ingredienteId: number | undefined) {
    if (!ingredienteId) return;
    const index = this.ingredientiSelezionati.findIndex(i => i.ingrediente.id === ingredienteId);
    if (index !== -1) {
      this.ingredientiSelezionati[index].quantita--;
      if (this.ingredientiSelezionati[index].quantita <= 0) {
        this.ingredientiSelezionati.splice(index, 1);
      }
    }
  }

  /**
   * METODI PER RIEPILOGO
   */
  getCategorie(): string[] {
    const categorie = new Set(this.ingredientiSelezionati.map(item => item.ingrediente.categoria));
    return Array.from(categorie);
  }

  getCategoriaLabel(categoria: string): string {
    switch (categoria) {
      case 'pasta': return 'Pasta';
      case 'condimento_pronto': return 'Condimenti Pronti';
      case 'condimento_base': return 'Condimenti Base';
      case 'proteine': return 'Proteine';
      case 'ingrediente_base': return 'Ingredienti Base';
      case 'topping': return 'Topping';
      default: return categoria;
    }
  }

  getIngredientiPerCategoria(categoria: string): IngredienteSelezionato[] {
    return this.ingredientiSelezionati.filter(item => item.ingrediente.categoria === categoria);
  }

  /**
   * NAVIGAZIONE CORRETTA
   */
  prossimoStep() {
    if (this.isPossibileProseguire() && !this.isUltimoStep()) {
      this.prossimo();
    }
  }

  precedenteStep() {
    if (this.currentStep > 0) {
      this.precedente();
    }
  }

  isPossibileProseguire(): boolean {
    return this.puoProcedere();
  }

  reset() {
    this.resetWizard();
  }
}