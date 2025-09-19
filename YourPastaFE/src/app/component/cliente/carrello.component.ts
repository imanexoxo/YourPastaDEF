import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { CarrelloService } from '../../service/carrello.service';
import { SessionService } from '../../service/session.service';
import { PiattoService } from '../../service/piatto.service';
import { Carrello, CarrelloItem } from '../../dto/carrello.model';
import { Utente } from '../../dto/utente.model';

/**
 * COMPONENTE CARRELLO - Visualizza e gestisce gli item nel carrello utente
 * 
 * FUNZIONALITÀ:
 * - Visualizzazione piatti personalizzati con ingredienti espandibili
 * - Visualizzazione bevande con immagini
 * - Modifica quantità con controlli + / -
 * - Rimozione item dal carrello
 * - Aggiunta piatti ai preferiti
 * - Calcolo prezzi con sconto automatico
 * - Navigazione al checkout
 */
@Component({
  selector: 'app-carrello',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './carrello.component.html',
  styleUrls: ['./carrello.component.css']
})
export class CarrelloComponent implements OnInit, OnDestroy {
  carrello: Carrello = {
    items: [],
    prezzoTotaleOriginale: 0,
    scontoApplicato: 0,
    prezzoTotaleFinale: 0,
    numeroTotaleItem: 0
  };
  
  utenteCorrente: Utente | null = null;
  isLoading = false;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private carrelloService: CarrelloService,
    private sessionService: SessionService,
    private piattoService: PiattoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.utenteCorrente = this.sessionService.getLoggedUser();
    if (!this.utenteCorrente) {
      this.router.navigate(['/login']);
      return;
    }

    // Sottoscrivi agli aggiornamenti del carrello
    this.subscription.add(
      this.carrelloService.carrello$.subscribe(carrello => {
        this.carrello = carrello;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * GESTIONE QUANTITÀ
   */
  aumentaQuantita(index: number): void {
    try {
      const item = this.carrello.items[index];
      this.carrelloService.modificaQuantita(index, item.quantita + 1);
    } catch (error: any) {
      this.snackBar.open(error.message, 'Chiudi', { duration: 3000 });
    }
  }

  diminuisciQuantita(index: number): void {
    const item = this.carrello.items[index];
    if (item.quantita > 1) {
      this.carrelloService.modificaQuantita(index, item.quantita - 1);
    } else {
      this.rimuoviItem(index);
    }
  }

  rimuoviItem(index: number): void {
    const item = this.carrello.items[index];
    const nome = item.tipo === 'piatto' ? item.piatto?.nome : item.bevanda?.nome;
    
    this.carrelloService.rimuoviItem(index);
    this.snackBar.open(`${nome} rimosso dal carrello`, 'Chiudi', { duration: 2000 });
  }

  /**
   * GESTIONE PREFERITI
   */
  togglePreferito(index: number): void {
    const item = this.carrello.items[index];
    
    if (item.tipo === 'piatto' && item.piatto) {
      this.carrelloService.togglePreferito(index);
      
      const statoPreferito = item.piatto.isFavorito ? 'aggiunto ai' : 'rimosso dai';
      this.snackBar.open(
        `${item.piatto.nome} ${statoPreferito} preferiti`,
        'Chiudi',
        { duration: 2000 }
      );
      
      // Salva nel backend se necessario
      if (item.piatto.isFavorito && item.piatto.id) {
        this.salvaPiattoNeiPreferiti(item.piatto.id);
      }
    }
  }

  private async salvaPiattoNeiPreferiti(piattoId: number): Promise<void> {
    try {
      // Implementare chiamata al backend per salvare il piatto nei preferiti
      // await this.piattoService.aggiungiAiPreferiti(piattoId);
    } catch (error) {
      console.error('Errore nel salvare piatto nei preferiti:', error);
    }
  }

  /**
   * UTILITÀ UI
   */
  getNomeItem(item: CarrelloItem): string {
    return item.tipo === 'piatto' ? 
      (item.piatto?.nome || 'Piatto personalizzato') : 
      (item.bevanda?.nome || 'Bevanda');
  }

  getDescrizioneItem(item: CarrelloItem): string {
    if (item.tipo === 'piatto' && item.piatto?.descrizione) {
      return item.piatto.descrizione;
    }
    return '';
  }

  getIngredientiPiatto(item: CarrelloItem): string {
    if (item.tipo === 'piatto' && item.piatto?.ingredienti) {
      return item.piatto.ingredienti
        .map(ing => ing.ingrediente?.nome || `Ingrediente ${ing.ingredienteId}`)
        .join(', ');
    }
    return '';
  }

  /**
   * NAVIGAZIONE
   */
  continuaShopping(): void {
    this.router.navigate(['/crea-ordine']);
  }

  vaiAlCheckout(): void {
    if (this.carrello.items.length === 0) {
      this.snackBar.open('Il carrello è vuoto!', 'Chiudi', { duration: 2000 });
      return;
    }
    
    this.router.navigate(['/checkout']);
  }

  vaiAiPreferiti(): void {
    this.router.navigate(['/wishlist']);
  }

  svuotaCarrello(): void {
    const conferma = confirm('Sei sicuro di voler svuotare il carrello?');
    if (conferma) {
      this.carrelloService.svuotaCarrello();
      this.snackBar.open('Carrello svuotato', 'Chiudi', { duration: 2000 });
    }
  }

  /**
   * UTILITÀ
   */
  isCarrelloVuoto(): boolean {
    return this.carrello.items.length === 0;
  }

  getPercentualeSconto(): number {
    if (this.carrello.prezzoTotaleOriginale === 0) return 0;
    return Math.round((this.carrello.scontoApplicato / this.carrello.prezzoTotaleOriginale) * 100);
  }

  /**
   * METODI PER VISUALIZZAZIONE PREZZI SCONTATI
   */
  isUtenteStudente(): boolean {
    return this.utenteCorrente?.ruolo === 'studente';
  }

  getPrezziVisualizzazione(): { prezzoOriginale: number, prezzoScontato: number, sconto: number } {
    return this.carrelloService.calcolaPrezzoScontatoPerVisualizzazione();
  }

  hasSconto(): boolean {
    const prezzi = this.getPrezziVisualizzazione();
    return prezzi.sconto > 0;
  }
}