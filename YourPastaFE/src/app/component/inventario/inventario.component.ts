import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InventarioService } from '../../service/inventario.service';
import { ImageService } from '../../service/image.service';
import { CarrelloService } from '../../service/carrello.service';
import { Inventario } from '../../dto/inventario.model';
import { SessionService } from '../../service/session.service';
import { CardIngredienteComponent } from './card-ingrediente.component';
import { AggiungiProdottoDialogComponent } from './aggiungi-prodotto-dialog.component';
import { ModificaProdottoDialogComponent } from './modifica-prodotto-dialog.component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    CardIngredienteComponent
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit, AfterViewInit, OnDestroy {
  
  ingredienti: Inventario[] = [];
  categoria: string = '';
  displayedColumns: string[] = ['immagine', 'nome', 'categoria', 'quantita', 'prezzoUnitario', 'actions'];
  
  // Per la vista dettaglio
  ingredienteSelezionato: Inventario | null = null;
  modalitaDettaglio: boolean = false;

  // Per gestire la posizione di scroll
  private readonly SCROLL_POSITION_KEY = 'inventario_scroll_position';
  private scrollPosition: number = 0;

  constructor(
    private inventarioService: InventarioService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private carrelloService: CarrelloService,
    private sessionService: SessionService,
    private imageService: ImageService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    // Recupera la categoria e i query parameters dalla route
    this.route.params.subscribe(params => {
      this.categoria = params['categoria'] || '';
      this.caricaIngredienti();
    });

    // Gestisce l'auto-aggiunta delle bevande al carrello
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['categoria'] === 'bevande' && queryParams['autoAddToCart'] === 'true') {
        // Mostra un messaggio per incoraggiare l'aggiunta di bevande
        this.mostraMessaggioBevande();
        // Imposta la categoria e forza il filtro con un breve delay
        this.categoria = 'bevande';
        setTimeout(() => {
          this.filtraPerCategoria('bevande');
        }, 100);
        // Forza il filtro se viene da crea-ordine
        if (queryParams['fromCreaOrdine'] === 'true') {
          this.categoria = 'bevande';
        }
      }
      
      // Se arriva da footer, reimposta scroll all'inizio
      if (queryParams['fromFooter'] === 'true') {
        this.scrollPosition = 0;
        sessionStorage.removeItem(this.SCROLL_POSITION_KEY);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    });
  }

  ngAfterViewInit() {
    // Ripristina la posizione di scroll dopo che la vista è stata inizializzata
    this.ripristinaPosizioneScroll();
  }

  ngOnDestroy() {
    // Pulisce la posizione salvata quando il componente viene distrutto
    // per evitare conflitti con altre pagine
    sessionStorage.removeItem(this.SCROLL_POSITION_KEY);
  }

  // Listener per salvare la posizione di scroll durante la navigazione
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    if (!this.modalitaDettaglio) {
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
      this.salvaPosizioneScroll();
    }
  }

  async caricaIngredienti() {
    try {
      if (this.categoria) {
        // Gestione delle categorie unificate
        if (this.categoria === 'condimenti') {
          // Carica sia condimento_pronto che condimento_base
          const [condimentiPronti, condimentiBase] = await Promise.all([
            lastValueFrom(this.inventarioService.trovaArticoliPerCategoria('condimento_pronto')),
            lastValueFrom(this.inventarioService.trovaArticoliPerCategoria('condimento_base'))
          ]);
          this.ingredienti = [...condimentiPronti, ...condimentiBase];
        } else if (this.categoria === 'verdure_formaggi') {
          // Carica ingrediente_base
          this.ingredienti = await lastValueFrom(
            this.inventarioService.trovaArticoliPerCategoria('ingrediente_base')
          );
        } else {
          // Carica ingredienti per categoria specifica normale
        this.ingredienti = await lastValueFrom(
          this.inventarioService.trovaArticoliPerCategoria(this.categoria)
        );
        }
      } else {
        // Carica tutti gli ingredienti
        this.ingredienti = await lastValueFrom(
          this.inventarioService.trovaTuttiGliArticoli()
        );
      }
    } catch (error) {
      console.error('Errore nel caricamento ingredienti:', error);
    }
  }


  

  // Mostra dettagli di un ingrediente
  mostraDettaglio(ingrediente: Inventario) {
    // Salva la posizione corrente prima di mostrare i dettagli
    this.salvaPosizioneScroll();
    this.ingredienteSelezionato = ingrediente;
    this.modalitaDettaglio = true;
  }




  // Torna alla lista
  tornaAllaLista() {
    this.modalitaDettaglio = false;
    this.ingredienteSelezionato = null;
    
    // Ripristina la posizione di scroll dopo un breve delay
    // per dare tempo al DOM di aggiornarsi
    setTimeout(() => {
      this.ripristinaPosizioneScroll();
    }, 100);
  }




  // Salva la posizione di scroll corrente
  private salvaPosizioneScroll() {
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
    sessionStorage.setItem(this.SCROLL_POSITION_KEY, this.scrollPosition.toString());
  }

  // Ripristina la posizione di scroll salvata
  private ripristinaPosizioneScroll() {
    const savedPosition = sessionStorage.getItem(this.SCROLL_POSITION_KEY);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      if (!isNaN(position)) {
        window.scrollTo({
          top: position,
          behavior: 'smooth'
        });
      }
    }
  }




  // Verifica se l'utente è admin
  isAdmin(): boolean {
    const user = this.sessionService.getLoggedUser();
    return user?.ruolo === 'admin';
  }




  // Filtra per categoria
  filtraPerCategoria(categoria: string) {
    this.categoria = categoria;
    // Reset della posizione di scroll quando si cambia categoria
    this.scrollPosition = 0;
    sessionStorage.removeItem(this.SCROLL_POSITION_KEY);
    this.caricaIngredienti();
  }




  // Metodi per gestione admin (modificare, eliminare, aggiungere)
  async eliminaIngrediente(id: number) {
    if (confirm('Sei sicuro di voler eliminare questo ingrediente?')) {
      try {
        await lastValueFrom(this.inventarioService.eliminaArticolo(id));
        this.caricaIngredienti();
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
      }
    }
  }



  // Categorie disponibili per il filtro
  categorie = [
    { valore: '', nome: 'Tutte le categorie' },
    { valore: 'pasta', nome: 'Pasta' },
    { valore: 'condimenti', nome: 'Condimenti' },
    { valore: 'proteine', nome: 'Proteine' },
    { valore: 'verdure_formaggi', nome: 'Verdure e Formaggi' },
    { valore: 'topping', nome: 'Topping' },
    { valore: 'bevande', nome: 'Bevande' }
  ];

  /**
   * Ottiene il nome visualizzato per la categoria
   */
  getCategoriaDisplayName(): string {
    if (!this.categoria) return '';
    const categoriaObj = this.categorie.find(cat => cat.valore === this.categoria);
    return categoriaObj ? categoriaObj.nome : this.categoria;
  }

  /**
   * Naviga al menu completo (tutte le categorie)
   */
  navigaAMenuCompleto(): void {
    this.categoria = '';
    this.caricaIngredienti();
  }


  /**
   * Ottiene l'immagine per un ingrediente
   */
  getImageForIngredient(ingrediente: Inventario): string {
    const imageUrl = this.imageService.getImageById(ingrediente.id);
    console.log(`Ingrediente: ${ingrediente.nome}, ID: ${ingrediente.id}, URL: ${imageUrl}`);
    return imageUrl;
  }

  /**
   * Ottiene il testo alt per l'immagine
   */
  getImageAlt(ingrediente: Inventario): string {
    return this.imageService.getImageAlt(ingrediente.nome);
  }



  /**
   * Ottiene la descrizione per un ingrediente
   */
  getDescriptionForIngredient(ingrediente: Inventario): string {
    return 'Ingrediente fresco di qualità'; // Descrizione generica
  }



  /**
   * Gestisce gli errori di caricamento delle immagini
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = this.imageService.getDefaultImage();
    }
  }


  /*
   * Mostra messaggio per incoraggiare l'aggiunta di bevande
   */
  mostraMessaggioBevande(): void {
    const snackBarRef = this.snackBar.open(
      'Piatto aggiunto al carrello! Vuoi aggiungere delle bevande?', 
      'Vai al carrello', 
      { 
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.router.navigate(['/carrello']);
    });
  }


  /**
   * Aggiunge una bevanda al carrello
   */
  aggiungiBevandaAlCarrello(bevanda: Inventario): void {
    this.carrelloService.aggiungiBevanda(bevanda, 1);
    this.snackBar.open(`${bevanda.nome} aggiunta al carrello!`, 'Chiudi', { 
      duration: 2000 
    });
  }

  
  /**
   * Naviga al carrello per il checkout
   */
  vaiAlCarrello() {
    this.router.navigate(['/carrello']);
  }

  tornaAllaHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Apre il dialog per aggiungere un nuovo prodotto
   */
  apriDialogAggiungiProdotto(): void {
    const dialogRef = this.dialog.open(AggiungiProdottoDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(async (risultato: Inventario) => {
      if (risultato) {
        try {
          await lastValueFrom(this.inventarioService.creaArticolo(risultato));
          this.snackBar.open('Prodotto aggiunto con successo!', 'Chiudi', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Ricarica la lista
          await this.caricaIngredienti();
        } catch (error) {
          console.error('Errore nell\'aggiunta del prodotto:', error);
          this.snackBar.open('Errore nell\'aggiunta del prodotto', 'Chiudi', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  /**
   * Apre il dialog per modificare un prodotto esistente
   */
  apriDialogModificaProdotto(prodotto: Inventario): void {
    const dialogRef = this.dialog.open(ModificaProdottoDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { prodotto: prodotto }
    });

    dialogRef.afterClosed().subscribe(async (risultato: Inventario) => {
      if (risultato) {
        try {
          await lastValueFrom(this.inventarioService.aggiornaInventario(risultato.id!, risultato));
          this.snackBar.open('Prodotto modificato con successo!', 'Chiudi', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Ricarica la lista
          await this.caricaIngredienti();
          // Se eravamo in modalità dettaglio, aggiorna anche l'ingrediente selezionato
          if (this.modalitaDettaglio && this.ingredienteSelezionato?.id === risultato.id) {
            this.ingredienteSelezionato = risultato;
          }
        } catch (error) {
          console.error('Errore nella modifica del prodotto:', error);
          this.snackBar.open('Errore nella modifica del prodotto', 'Chiudi', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }
}