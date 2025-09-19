import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { CarrelloService } from '../../service/carrello.service';
import { SessionService } from '../../service/session.service';
import { OrdineService } from '../../service/ordine.service';
import { OrdineItemService } from '../../service/ordine-item.service';
import { TavoloService } from '../../service/tavolo.service';
import { UtenteService } from '../../service/utente.service';
import { Carrello, CarrelloItem } from '../../dto/carrello.model';
import { Utente } from '../../dto/utente.model';
import { Tavolo } from '../../dto/tavolo.model';
import { Ordine } from '../../dto/ordine.model';

/**
 * COMPONENTE CHECKOUT - Finalizzazione dell'ordine
 * 
 * FUNZIONALITÀ:
 * - Riepilogo carrello (sola visualizzazione)
 * - Selezione tavolo o asporto
 * - Inserimento note
 * - Gestione scontistiche:
 *   - 20% sconto per studenti
 *   - 10% sconto ogni 100 punti (scalando 100 punti)
 *   - 10% sconto primo ordine (se 0 ordini precedenti)
 * - Creazione ordine e ordine-item
 * - Svuotamento carrello post-ordine
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  carrello: Carrello = {
    items: [],
    prezzoTotaleOriginale: 0,
    scontoApplicato: 0,
    prezzoTotaleFinale: 0,
    numeroTotaleItem: 0
  };
  
  utenteCorrente: Utente | null = null;
  tavoliDisponibili: Tavolo[] = [];
  
  // Form data
  tavoloSelezionato: Tavolo | null = null;
  numeroTavoloSelezionato: number | null = null;
  isAsporto: boolean = false;
  isDelivery: boolean = false;
  note: string = '';
  
  // Calcoli sconti
  // ancora?
  prezzoOriginale: number = 0;
  scontoStudente: number = 0;
  scontoPunti: number = 0;
  scontoPrimoOrdine: number = 0;
  scontoTotale: number = 0;
  prezzoFinale: number = 0;
  
  // UI State
  isLoading = false;
  isProcessingOrder = false;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private carrelloService: CarrelloService,
    private sessionService: SessionService,
    private ordineService: OrdineService,
    private ordineItemService: OrdineItemService,
    private tavoloService: TavoloService,
    private utenteService: UtenteService,
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

    // Verifica che il carrello non sia vuoto
    this.subscription.add(
      this.carrelloService.carrello$.subscribe(carrello => {
        this.carrello = carrello;
        if (carrello.items.length === 0) {
          this.snackBar.open('Il carrello è vuoto!', 'Chiudi', { duration: 3000 });
          this.router.navigate(['/carrello']);
          return;
        }
        this.calcolaSconti();
      })
    );

    this.caricaTavoliDisponibili();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * CARICAMENTO TAVOLI
   */
  async caricaTavoliDisponibili(): Promise<void> {
    try {
      this.isLoading = true;
      this.tavoliDisponibili = await this.tavoloService.trovaTavoliDisponibili().toPromise() || [];
      
      // Debug: stampa i tavoli ricevuti dal backend
      console.log('Tavoli disponibili ricevuti dal backend:', this.tavoliDisponibili);
      
      // Verifica che i tavoli abbiano i campi necessari
      this.tavoliDisponibili.forEach((tavolo, index) => {
        console.log(`Tavolo ${index}:`, {
          id: tavolo.id,
          disponibile: tavolo.disponibile
        });
      });
      
    } catch (error) {
      console.error('Errore nel caricamento tavoli:', error);
      this.snackBar.open('Errore nel caricamento tavoli disponibili', 'Chiudi', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * CALCOLO SCONTISTICHE
   */
  async calcolaSconti(): Promise<void> {
    if (!this.utenteCorrente) return;

    const isPrimoOrdine = await this.verificaPrimoOrdine();

    this.prezzoOriginale = this.carrello.prezzoTotaleOriginale;
    this.scontoStudente = 0;
    this.scontoPunti = 0;
    this.scontoPrimoOrdine = 0;

    // 1. SCONTO STUDENTE (20%)
    if (this.utenteCorrente.ruolo === 'studente') {
      this.scontoStudente = this.prezzoOriginale * 0.20;
    }

    // 2. SCONTO PUNTI (10% ogni 100 punti)
    const puntiUtente = this.utenteCorrente.punti || 0;
    const scontiPunti = Math.floor(puntiUtente / 100);
    if (scontiPunti > 0) {
      this.scontoPunti = this.prezzoOriginale * 0.10 * scontiPunti;
    }

    // 3. SCONTO PRIMO ORDINE (10%) 
    this.scontoPrimoOrdine = isPrimoOrdine ? this.prezzoOriginale * 0.10 : 0;

    this.scontoTotale = this.scontoStudente + this.scontoPunti + this.scontoPrimoOrdine;
    this.prezzoFinale = Math.max(0, this.prezzoOriginale - this.scontoTotale);
  }

  /**
   * VERIFICA PRIMO ORDINE
   */
  async verificaPrimoOrdine(): Promise<boolean> {
    if (!this.utenteCorrente?.id) return false;
    
    try {
      const ordiniUtente = await this.ordineService.trovaOrdiniPerUtente(this.utenteCorrente.id).toPromise() || [];
      return ordiniUtente.length === 0;
    } catch (error) {
      console.error('Errore verifica primo ordine:', error);
      return false;
    }
  }

  /**
   * GESTIONE SELEZIONE TAVOLO/ASPORTO
   */
  onTavoloSelezionato(tavoloSelezionato: Tavolo): void {
    console.log('Tavolo selezionato:', tavoloSelezionato);
    this.tavoloSelezionato = tavoloSelezionato;
    // Il numero del tavolo è il suo id
    this.numeroTavoloSelezionato = tavoloSelezionato.id || null;
    this.isAsporto = false;
    console.log('Numero tavolo impostato:', this.numeroTavoloSelezionato);
  }

  onAsportoSelezionato(): void {
    this.isAsporto = true;
    this.isDelivery = false;
    this.tavoloSelezionato = null;
    this.numeroTavoloSelezionato = null;
  }

  onDeliverySelezionato(): void {
    this.isDelivery = true;
    this.isAsporto = false;
    this.tavoloSelezionato = null;
    this.numeroTavoloSelezionato = null;
  }

  /**
   * VALIDAZIONE FORM
   */
  isFormValid(): boolean {
    return (this.tavoloSelezionato !== null || this.isAsporto || this.isDelivery) && this.carrello.items.length > 0;
  }





  /**
   * CREAZIONE ORDINE
   */
  async confermaOrdine(): Promise<void> {
    if (!this.isFormValid() || !this.utenteCorrente) {
      if (!this.tavoloSelezionato && !this.isAsporto) {
        this.snackBar.open('Seleziona un tavolo o l\'asporto per continuare', 'Chiudi', { duration: 3000 });
      } else if (this.carrello.items.length === 0) {
        this.snackBar.open('Il carrello è vuoto!', 'Chiudi', { duration: 3000 });
      }
      return;
    }

    console.log('Conferma ordine - Tavolo selezionato:', this.tavoloSelezionato);
    console.log('Conferma ordine - Numero tavolo:', this.numeroTavoloSelezionato);
    console.log('Conferma ordine - È asporto:', this.isAsporto);

    try {
      this.isProcessingOrder = true;

      // Verifica se è il primo ordine per applicare sconto
      await this.calcolaSconti();
      console.log('Sconti applicati');

      // Crea l'ordine solo dopo aver calcolato gli sconti
      const nuovoOrdine: Ordine = {
        utenteId: this.utenteCorrente.id,
        nTavolo: (this.isAsporto || this.isDelivery) ? null : (this.numeroTavoloSelezionato || 0), // null per asporto o delivery
        delivery: this.isDelivery,
        note: this.note.trim() || undefined,
        status: 'pending',
        prezzoTotale: this.prezzoFinale
      };

      console.log('Dati ordine da inviare:', nuovoOrdine);

      const ordineCreato = await this.ordineService.creaOrdine(nuovoOrdine).toPromise();
      console.log('Ordine creato dal backend:', ordineCreato);
      
      if (ordineCreato?.id) {
        // Crea gli ordine-item
        await this.creaOrdineItems(ordineCreato.id);

        // Attendi brevemente per garantire la persistenza degli ordine-item
        await new Promise(res => setTimeout(res, 250));

        // Ricalcola il prezzo e i punti dell'ordine lato backend
        const ordineAggiornato = await this.ordineService.ricalcolaPrezzoOrdine(ordineCreato.id).toPromise();
        console.log('Ordine aggiornato dal backend:', ordineAggiornato);

        // Attendi per permettere al backend di processare
        await new Promise(resolve => setTimeout(resolve, 300));

        // Refresh dei punti utente dal backend
        await this.sessionService.aggiornaPuntiUtente();
        
        // Aggiorna l'utente locale
        this.utenteCorrente = this.sessionService.getLoggedUser();

        // Svuota il carrello
        this.carrelloService.svuotaCarrello();

        this.snackBar.open('Ordine confermato con successo!', 'Chiudi', { duration: 3000 });
        this.router.navigate(['/storico-ordini']);
      }

    } catch (error) {
      console.error('Errore nella creazione ordine:', error);
      this.snackBar.open('Errore nella creazione dell\'ordine. Riprova.', 'Chiudi', { duration: 5000 });
    } finally {
      this.isProcessingOrder = false;
    }
  }



  
  /**
   * CREAZIONE ORDINE ITEMS
   */
  async creaOrdineItems(ordineId: number): Promise<void> {
    console.log('Creazione ordine-item per ordine:', ordineId);
    console.log('Items del carrello:', this.carrello.items);

    try {
      // Crea un ordine-item per ogni item nel carrello
      for (const item of this.carrello.items) {
        let itemId: number;

        // Determina l'ID corretto in base al tipo di item
        if (item.tipo === 'piatto' && item.piatto?.id) {
          itemId = item.piatto.id; // ID del piatto nella tabella piatto
        } else if (item.tipo === 'bevanda' && item.bevanda?.id) {
          itemId = item.bevanda.id; // ID della bevanda nell'inventario
        } else {
          console.error('Item non valido nel carrello:', item);
          continue; // Salta questo item se non ha un ID valido
        }

        // Richiesta semplificata: solo ordineId, itemId e quantita
        // Il backend calcolerà automaticamente prezzo e tipoItem
        const ordineItem = {
          ordineId: ordineId,
          itemId: itemId,
          quantita: item.quantita
        };

        console.log('Creando ordine-item:', ordineItem);

        try {
          // Crea l'ordine-item
          await this.ordineItemService.creaOrdineItem(ordineItem).toPromise();
          console.log('Ordine-item creato con successo per item:', itemId);
        } catch (itemError) {
          console.error('Errore nella creazione del singolo ordine-item:', itemError);
          console.error('Dati dell\'item che ha causato l\'errore:', ordineItem);
          // Continua con gli altri item invece di fermare tutto
          continue;
        }
      }
    } catch (error) {
      console.error('Errore nella creazione ordine-items:', error);
      throw error; // Rilancia l'errore per gestirlo nel metodo chiamante
    }
  }

  /**
   * AGGIORNAMENTO PUNTI UTENTE 
   * Scalati in base agli sconti applicati
   */
  async aggiornaPuntiUtente(): Promise<void> {
    if (!this.utenteCorrente || this.scontoPunti === 0) return;

    console.log('Aggiornamento punti utente per:', this.utenteCorrente);
    console.log('Punti attuali:', this.utenteCorrente.punti);
    console.log('Sconto punti applicato:', this.scontoPunti);
    const puntiDaScalare = Math.floor((this.utenteCorrente.punti || 0) / 100) * 100;
    const nuoviPunti = (this.utenteCorrente.punti || 0) - puntiDaScalare;

    try {
      // Usa .toPromise() per ottenere l'oggetto Utente aggiornato
      this.utenteCorrente = (await this.utenteService.aggiornaPunti(this.utenteCorrente.id!, -puntiDaScalare).toPromise()) || null;
      this.sessionService.setLoggedUser(this.utenteCorrente!);
      console.log(`Punti scalati: ${puntiDaScalare}, nuovi punti: ${nuoviPunti}`);
    } catch (error) {
      console.error('Errore aggiornamento punti:', error);
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
    if (item.tipo === 'piatto' && item.piatto?.ingredienti) {
      return item.piatto.ingredienti
        .map(ing => ing.ingrediente?.nome || `Ingrediente ${ing.ingredienteId}`)
        .join(', ');
    }
    return '';
  }

  getPuntiDisponibili(): number {
    return Math.floor((this.utenteCorrente?.punti || 0) / 100) * 100;
  }

  getScontiAttivi(): string[] {
    const sconti: string[] = [];
    if (this.scontoStudente > 0) sconti.push('Sconto Studente (20%)');
    if (this.scontoPunti > 0) sconti.push(`Sconto Punti (${Math.floor((this.utenteCorrente?.punti || 0) / 100) * 10}%)`);
    if (this.scontoPrimoOrdine > 0) sconti.push('Sconto Primo Ordine (10%)');
    return sconti;
  }

  getPercentualeScoutoPunti(): number {
    return Math.floor((this.utenteCorrente?.punti || 0) / 100) * 10;
  }

  /**
   * REFRESH PUNTI UTENTE
   * Ricarica i punti dell'utente dal backend dopo la creazione dell'ordine
   */
  async refreshPuntiUtente(): Promise<void> {
    try {
      if (this.utenteCorrente?.id) {
        console.log('Refresh punti utente in corso...');
        
        // Ricarica l'utente dal backend per ottenere i punti aggiornati
        const utenteAggiornato = await this.utenteService.trovaUtentePerId(this.utenteCorrente.id).toPromise();
        
        if (utenteAggiornato) {
          // Aggiorna l'utente nella sessione
          this.sessionService.setLoggedUser(utenteAggiornato);
          this.utenteCorrente = utenteAggiornato;
          
          console.log('Punti utente aggiornati:', utenteAggiornato.punti);
        }
      }
    } catch (error) {
      console.error('Errore nel refresh dei punti utente:', error);
      // Non blocchiamo il flusso per questo errore non critico
    }
  }

  /**
   * NAVIGAZIONE
   */
  tornaAlCarrello(): void {
    this.router.navigate(['/carrello']);
  }
}
