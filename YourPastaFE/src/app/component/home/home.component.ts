import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { lastValueFrom } from 'rxjs';

import { SessionService } from '../../service/session.service';
import { InventarioService } from '../../service/inventario.service';
import { CarrelloService } from '../../service/carrello.service';
import { ImageService } from '../../service/image.service';
import { PiattoService } from '../../service/piatto.service';
import { UtenteService } from '../../service/utente.service';
import { Utente } from '../../dto/utente.model';
import { Inventario } from '../../dto/inventario.model';
import { Piatto } from '../../dto/piatto.model';
import { CardIngredienteComponent } from '../inventario/card-ingrediente.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule, MatBadgeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  
  utenteLoggato: Utente | null = null;
  
  // Cache per ingredienti
  piattiConIngredienti: Map<number, {immagini: string[], nomi: string[]}> = new Map();
  
  // Cache per nomi utenti
  utentiNomi: Map<number, string> = new Map();

  // Variabili per i dati
  pasteConsigliate: Inventario[] = [];
  abbinamenti: Inventario[] = [];
  mieiPiatti: Piatto[] = [];
  creazioniAltriClienti: Piatto[] = [];

  constructor(
    private sessionService: SessionService,
    private inventarioService: InventarioService,
    private carrelloService: CarrelloService,
    private imageService: ImageService,
    private piattoService: PiattoService,
    private utenteService: UtenteService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.sessionService.utenteLoggato$.subscribe(utente => {
      this.utenteLoggato = utente;
      // Ricarica i dati quando cambia l'utente
      this.caricaDatiConsigli();
    });
  }

  private async caricaDatiConsigli(): Promise<void> {
    try {
      // Carica le paste consigliate con ID specifici
      await this.caricaPasteConsigliate();
      
      // Carica gli abbinamenti con ID specifici  
      await this.caricaAbbinamenti();
      
      // Carica i piatti dell'utente se loggato
      if (this.utenteLoggato) {
        await this.caricaMieiPiatti();
      }
      
      // Carica sempre le creazioni degli altri clienti
      await this.caricaCreazioniAltriClienti();
      
    } catch (error) {
      console.error('Errore nel caricamento dei dati consigli:', error);
    }
  }

  private async caricaPasteConsigliate(): Promise<void> {
    try {
      const idsPasteConsigliate = [6, 5, 1]; // Ripristinati tutti e 3 i prodotti originali
      this.pasteConsigliate = [];
      
      for (const id of idsPasteConsigliate) {
    try {
          const pasta = await lastValueFrom(this.inventarioService.trovaArticoloPerId(id));
          if (pasta && pasta.quantita > 0) {
            this.pasteConsigliate.push(pasta);
          }
        } catch (error) {
          console.warn(`Pasta con ID ${id} non trovata:`, error);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento paste consigliate:', error);
    }
  }

  private async caricaAbbinamenti(): Promise<void> {
    try {
      const idsAbbinamenti = [9, 10, 12]; // Ripristinati tutti e 3 i prodotti originali
      this.abbinamenti = [];
      
      for (const id of idsAbbinamenti) {
        try {
          const condimento = await lastValueFrom(this.inventarioService.trovaArticoloPerId(id));
          if (condimento && condimento.quantita > 0) {
            this.abbinamenti.push(condimento);
          }
        } catch (error) {
          console.warn(`Condimento con ID ${id} non trovato:`, error);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento abbinamenti:', error);
    }
  }

  private async caricaMieiPiatti(): Promise<void> {
    try {
      if (this.utenteLoggato && this.utenteLoggato.id) {
        const piatti = await lastValueFrom(this.piattoService.getPiattiPerUtente(this.utenteLoggato.id));
        this.mieiPiatti = piatti.slice(0, 3); // Mostra solo i primi 3
        
        // Carica gli ingredienti per ogni piatto
        await this.caricaIngredientiPerPiatti(this.mieiPiatti);
        
        // Debug: log per verificare se gli ingredienti sono inclusi
        console.log('Miei piatti caricati:', this.mieiPiatti);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei miei piatti:', error);
      this.mieiPiatti = [];
    }
  }

  private async caricaCreazioniAltriClienti(): Promise<void> {
    try {
      const tuttiPiatti = await lastValueFrom(this.piattoService.getTuttiPiatti());
      // Filtra i piatti degli altri utenti (non dell'utente corrente)
      const piattiAltriClienti = this.utenteLoggato 
        ? tuttiPiatti.filter((p: Piatto) => p.utenteId !== this.utenteLoggato!.id)
        : tuttiPiatti;
      
      this.creazioniAltriClienti = piattiAltriClienti.slice(0, 3); // Mostra solo i primi 3
      
      // Carica gli ingredienti per ogni piatto
      await this.caricaIngredientiPerPiatti(this.creazioniAltriClienti);
      
      // Carica i nomi degli utenti creatori
      await this.caricaNomiUtenti(this.creazioniAltriClienti);
      
      // Debug: log per verificare se gli ingredienti sono inclusi
      console.log('Creazioni altri clienti caricate:', this.creazioniAltriClienti);
    } catch (error) {
      console.error('Errore nel caricamento creazioni altri clienti:', error);
      this.creazioniAltriClienti = [];
    }
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('it-IT');
  }

  getSaluto(): string {
    const ora = new Date().getHours();
    if (ora < 12) return 'Buongiorno';
    if (ora < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  }

  creaOrdine() {
    this.router.navigate(['/crea-ordine']);
  }

  // Metodi per il carrello
  getTotalItemsCarrello(): number {
    return this.carrelloService.getNumeroTotaleItem();
  }

  getPrezzoTotaleCarrello(): number {
    return this.carrelloService.getCarrello().prezzoTotaleFinale;
  }

  vaiAlCarrello() {
    this.router.navigate(['/carrello']);
  }

  // Naviga all'inventario generale
  scopriMenu() {
    this.router.navigate(['/inventario']);
  }

  // Metodo per ottenere l'immagine tramite ImageService
  getImageById(id: number): string {
    return this.imageService.getImageById(id);
  }

  // Gestisce errori di caricamento immagini
  onImageError(event: any): void {
    console.log('Errore caricamento immagine:', event.target.src);
    event.target.src = this.imageService.getDefaultImage();
  }

  // Gestisce il click su un piatto
  onPiattoClick(piatto: Piatto): void {
    if (piatto.id) {
      // Naviga alla pagina del piatto (puoi personalizzare il routing)
      this.router.navigate(['/piatto', piatto.id]);
      console.log('Navigating to piatto:', piatto.id);
    }
  }

  // Ottiene le immagini degli ingredienti per un piatto
  getImmaginiIngredienti(piatto: Piatto): string[] {
    const cached = this.piattiConIngredienti.get(piatto.id || 0);
    return cached ? cached.immagini : [this.imageService.getImageById(1)];
  }

  // Ottiene i nomi degli ingredienti per un piatto
  getNomiIngredienti(piatto: Piatto): string[] {
    const cached = this.piattiConIngredienti.get(piatto.id || 0);
    return cached ? cached.nomi : ['Ingredienti in caricamento...'];
  }

  // Carica gli ingredienti per una lista di piatti
  private async caricaIngredientiPerPiatti(piatti: Piatto[]): Promise<void> {
    for (const piatto of piatti) {
      if (piatto.id) {
        try {
          const [immagini, nomi] = await Promise.all([
            this.piattoService.getImmaginiIngredienti(piatto),
            this.piattoService.getNomiIngredienti(piatto)
          ]);
          
          this.piattiConIngredienti.set(piatto.id, { immagini, nomi });
        } catch (error) {
          console.error(`Errore nel caricamento ingredienti per piatto ${piatto.id}:`, error);
          // Fallback con dati di esempio
          this.piattiConIngredienti.set(piatto.id, {
            immagini: [this.imageService.getImageById(1), this.imageService.getImageById(5)],
            nomi: ['Pasta x100g', 'Pomodoro x50g']
          });
        }
      }
    }
  }

  // Aggiunge un piatto al carrello
  aggiungiPiattoAlCarrello(piatto: Piatto, event: Event): void {
    event.stopPropagation(); // Evita che si attivi anche onPiattoClick
    
    this.carrelloService.aggiungiPiatto(piatto, 1);
    console.log('Piatto aggiunto al carrello:', piatto.nome);
    
    // Potresti aggiungere qui una notifica o toast
    // this.snackBar.open(`${piatto.nome} aggiunto al carrello!`, 'Chiudi', { duration: 2000 });
  }

  // Metodi per la navigazione ai piatti
  navigateToMieiPiatti(): void {
    // Naviga verso il componente dei miei piatti
    this.router.navigate(['/miei-piatti']);
  }

  navigateToTuttiPiatti(): void {
    // Per utenti non loggati mostra tutti i piatti
    this.router.navigate(['/tutti-piatti']);
  }

  navigateToAltriPiatti(): void {
    // Per utenti loggati mostra piatti degli altri
    this.router.navigate(['/piatti-altri-utenti']);
  }

  // Carica i nomi degli utenti per una lista di piatti
  private async caricaNomiUtenti(piatti: Piatto[]): Promise<void> {
    for (const piatto of piatti) {
      if (piatto.utenteId && !this.utentiNomi.has(piatto.utenteId)) {
        try {
          const utente: Utente = await lastValueFrom(this.utenteService.trovaUtentePerId(piatto.utenteId));
          this.utentiNomi.set(piatto.utenteId, utente.username);
        } catch (error) {
          console.error(`Errore nel caricamento utente ${piatto.utenteId}:`, error);
          this.utentiNomi.set(piatto.utenteId, 'Utente sconosciuto');
        }
      }
    }
  }

  // Ottiene il nome utente per un piatto
  getNomeUtenteCreatore(piatto: Piatto): string {
    if (piatto.utenteId) {
      return this.utentiNomi.get(piatto.utenteId) || 'Caricamento...';
    }
    return 'Utente sconosciuto';
  }

  // Verifica se l'utente corrente è uno studente
  isUtenteStudente(): boolean {
    return this.utenteLoggato?.ruolo === 'studente';
  }

  // Calcola il prezzo originale di un piatto (sempre uguale al prezzo dal backend)
  getPrezzoOriginale(piatto: Piatto): number {
    return piatto.prezzo || 0;
  }

  // Calcola il prezzo scontato per studenti
  getPrezzoScontato(piatto: Piatto): number {
    if (!piatto.prezzo) return 0;
    
    // Applica sconto studente del 20%
    if (this.isUtenteStudente()) {
      return piatto.prezzo * 0.8;
    }
    
    return piatto.prezzo;
  }

  // Apre il link alle recensioni MagnaFrara
  apriRecensioni(): void {
    window.open('https://magnafrara.it/recensioni', '_blank');
  }
}