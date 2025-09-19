import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';

import { Piatto } from '../../dto/piatto.model';
import { Utente } from '../../dto/utente.model';
import { PiattoService } from '../../service/piatto.service';
import { CarrelloService } from '../../service/carrello.service';
import { ImageService } from '../../service/image.service';
import { SessionService } from '../../service/session.service';
import { UtenteService } from '../../service/utente.service';

@Component({
  selector: 'app-piatto',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './piatto.component.html',
  styleUrl: './piatto.component.css'
})
export class PiattoComponent implements OnInit {

  // Cache per ingredienti ESATTAMENTE COME NELLA HOME
  piattiConIngredienti: Map<number, {immagini: string[], nomi: string[]}> = new Map();
  
  // Cache per nomi utenti
  utentiNomi: Map<number, string> = new Map();
  
  // Stato generale
  isLoading = true;
  
  // Dati
  piatti: Piatto[] = [];
  utenteCorrente: Utente | null = null;
  
  // Alias per compatibilità con il template
  get utenteLoggato(): Utente | null {
    return this.utenteCorrente;
  }
  
  // Vista corrente determinata dalla route
  vistaCorrente: 'tutti-piatti' | 'miei-piatti' | 'piatti-altri-utenti' = 'tutti-piatti';
  titoloPagina = '';

  constructor(
    private piattoService: PiattoService,
    private carrelloService: CarrelloService,
    private imageService: ImageService,
    private sessionService: SessionService,
    private utenteService: UtenteService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.inizializzaComponente();
  }

  private async inizializzaComponente(): Promise<void> {
    try {
      // Determina la vista corrente dalla route
      this.determinaVistaCorrente();
      
      // Carica l'utente corrente se loggato
      this.utenteCorrente = this.sessionService.getLoggedUser();
      
      // Carica i piatti
      await this.caricaPiatti();
      
    } catch (error) {
      console.error('Errore nell\'inizializzazione del componente:', error);
      this.mostraMessaggio('Errore nel caricamento della pagina', 'error');
    }
  }

  private determinaVistaCorrente(): void {
    const url = this.router.url;
    
    if (url.includes('/tutti-piatti')) {
      this.vistaCorrente = 'tutti-piatti';
      this.titoloPagina = 'Tutte le creazioni';
    } else if (url.includes('/miei-piatti')) {
      this.vistaCorrente = 'miei-piatti';
      this.titoloPagina = 'I miei piatti';
    } else if (url.includes('/piatti-altri-utenti')) {
      this.vistaCorrente = 'piatti-altri-utenti';
      this.titoloPagina = 'Creazioni degli altri clienti';
    }
  }

  private async caricaPiatti(): Promise<void> {
    this.isLoading = true;
    
    try {
      let piatti: Piatto[] = [];
      
      switch (this.vistaCorrente) {
        case 'miei-piatti':
          if (!this.utenteCorrente || !this.utenteCorrente.id) {
            this.router.navigate(['/login']);
            return;
          }
          piatti = await lastValueFrom(this.piattoService.getPiattiPerUtente(this.utenteCorrente.id));
          break;
          
        case 'piatti-altri-utenti':
          if (!this.utenteCorrente || !this.utenteCorrente.id) {
            this.router.navigate(['/login']);
            return;
          }
          const tuttiPiatti = await lastValueFrom(this.piattoService.getTuttiPiatti());
          // Filtra i piatti degli altri utenti (stesso filtro della home)
          piatti = tuttiPiatti.filter(p => p.utenteId !== this.utenteCorrente!.id);
          break;
          
        case 'tutti-piatti':
        default:
          piatti = await lastValueFrom(this.piattoService.getTuttiPiatti());
          break;
      }

      this.piatti = piatti;
      
      // Carica gli ingredienti per ogni piatto ESATTAMENTE COME NELLA HOME
      await this.caricaIngredientiPerPiatti(this.piatti);
      
      // Carica i nomi degli utenti se siamo nella vista "piatti-altri-utenti" O se l'utente non è loggato
      if (this.vistaCorrente === 'piatti-altri-utenti' || !this.utenteLoggato) {
        await this.caricaNomiUtenti(this.piatti);
      }
      
      // Forza il change detection per evitare errori
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Errore caricamento piatti:', error);
      this.mostraMessaggio('Errore nel caricamento dei piatti', 'error');
      this.piatti = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Ottiene le immagini degli ingredienti per un piatto (COPIATO IDENTICO DALLA HOME)
  getImmaginiIngredienti(piatto: Piatto): string[] {
    const cached = this.piattiConIngredienti.get(piatto.id || 0);
    return cached ? cached.immagini : [this.imageService.getImageById(1)];
  }

  // Ottiene i nomi degli ingredienti per un piatto (COPIATO IDENTICO DALLA HOME)
  getNomiIngredienti(piatto: Piatto): string[] {
    const cached = this.piattiConIngredienti.get(piatto.id || 0);
    return cached ? cached.nomi : ['Ingredienti in caricamento...'];
  }

  // Carica gli ingredienti per una lista di piatti (COPIATO IDENTICO DALLA HOME)
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
    this.mostraMessaggio(`${piatto.nome} aggiunto al carrello!`, 'success');
    console.log('Piatto aggiunto al carrello:', piatto.nome);
  }

  // Gestisce il click su un piatto
  onPiattoClick(piatto: Piatto): void {
    if (piatto.id) {
      this.router.navigate(['/piatto', piatto.id]);
      console.log('Navigating to piatto:', piatto.id);
    }
  }

  // Gestisce errori di caricamento immagini
  onImageError(event: any): void {
    console.log('Errore caricamento immagine:', event.target.src);
    event.target.src = this.imageService.getDefaultImage();
  }

  private mostraMessaggio(messaggio: string, tipo: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(messaggio, 'Chiudi', {
      duration: 3000,
      panelClass: [`snackbar-${tipo}`]
    });
  }

  // Carica i nomi degli utenti per una lista di piatti
  private async caricaNomiUtenti(piatti: Piatto[]): Promise<void> {
    for (const piatto of piatti) {
      if (piatto.utenteId && !this.utentiNomi.has(piatto.utenteId)) {
        try {
          const utente: Utente = await lastValueFrom(this.utenteService.trovaUtentePerId(piatto.utenteId));
          this.utentiNomi.set(piatto.utenteId, utente.username);
          // Forza aggiornamento interfaccia dopo ogni caricamento
          this.cdr.detectChanges();
        } catch (error) {
          console.error(`Errore nel caricamento utente ${piatto.utenteId}:`, error);
          this.utentiNomi.set(piatto.utenteId, 'Utente sconosciuto');
          this.cdr.detectChanges();
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

  // Ottiene il prezzo originale di un piatto (sempre quello dal backend)
  getPrezzoOriginale(piatto: Piatto): number {
    return piatto.prezzo || 0;
  }

  // Calcola il prezzo scontato per gli studenti (solo per visualizzazione)
  getPrezzoScontato(piatto: Piatto): number {
    if (!piatto.prezzo) return 0;
    
    if (this.isUtenteStudente()) {
      return piatto.prezzo * 0.8; // Sconto del 20%
    }
    
    return piatto.prezzo;
  }
}