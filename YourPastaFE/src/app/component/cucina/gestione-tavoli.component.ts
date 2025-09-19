import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';

import { TavoloService } from '../../service/tavolo.service';
import { OrdineService } from '../../service/ordine.service';
import { InventarioService } from '../../service/inventario.service';
import { OrdineItemService } from '../../service/ordine-item.service';
import { PiattoService } from '../../service/piatto.service';
import { PiattoItemService } from '../../service/piatto-item.service';

import { Tavolo } from '../../dto/tavolo.model';
import { Ordine } from '../../dto/ordine.model';
import { OrdineItem } from '../../dto/ordine-item.model';
import { Inventario } from '../../dto/inventario.model';
import { Piatto } from '../../dto/piatto.model';
import { PiattoItem } from '../../dto/piatto-item.model';


import { ScontrinoDialogComponent, ScontrinoDialogData } from '../dialogs/scontrino-dialog.component';
import { lastValueFrom, Observable } from 'rxjs';


@Component({
  selector: 'app-gestione-tavoli',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule
  ],
  templateUrl: './gestione-tavoli.component.html',
  styleUrls: ['./gestione-tavoli.component.css']
})
export class GestioneTavoliComponent implements OnInit {
  
  tavoli: Tavolo[] = [];
  // Inizializzata così perché usiamo gli ID dei tavoli come chiavi
  ordiniPerTavolo: { [key: number]: Ordine[] } = {};

  // Per visualizzare gli ingredienti degli item degli ordini
  ordineItemsPerOrdine: { [ordineId: number]: OrdineItem[] } = {};

  piattiPerId: { [piattoId: number]: Piatto } = {};

  piattoItemsPerPiatto: { [piattoId: number]: PiattoItem[] } = {};

  ingredientiPerId: { [ingredienteId: number]: Inventario } = {};
  
  // Stats
  tavoliLiberi = 0;
  tavoliOccupati = 0;
  
  // Auto refresh
  refreshInterval: any;
  isLoading = false;

  constructor(
    private tavoloService: TavoloService,
    private ordineService: OrdineService,
    private ordineItemService: OrdineItemService,
    private inventarioService: InventarioService,
    private piattoService: PiattoService,
    private piattoItemService: PiattoItemService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.caricaTavoli();
    
    // Auto refresh ogni 60 secondi
    this.refreshInterval = setInterval(() => {
      this.caricaTavoli();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }


  // Funzione chiamata all'avvio del compoenente e ogni 60 secondi per caricare i tavoli
  async caricaTavoli() {
    this.isLoading = true;
    try {
      this.tavoli = await lastValueFrom(this.tavoloService.trovaTuttiITavoli());
      this.ordiniPerTavolo = {};
      this.ordineItemsPerOrdine = {};
      this.piattiPerId = {};
      this.ingredientiPerId = {};

      for (const tavolo of this.tavoli) {
        if (tavolo.id) {
          try {
            const ordini = await lastValueFrom(this.ordineService.trovaOrdiniPerTavolo(tavolo.id));
            const ordiniAttivi = ordini.filter(o => !['chiuso', 'annullato'].includes(o.status));
            this.ordiniPerTavolo[tavolo.id] = ordiniAttivi;

            // Carica tutti gli item per ogni ordine
            for (const ordine of ordiniAttivi) {

              // recupera tutti gli ordine items per l'ordine selezionato
              const items = await lastValueFrom(this.ordineItemService.trovaItemPerOrdine(ordine.id!));
              // memorizza gli item per l'ordine
              this.ordineItemsPerOrdine[ordine.id!] = items;

              // per ogni ordineItem
              for (const item of items) 
              {
                if (item.tipoItem === 'PIATTO') 
                {
                  if (!this.piattiPerId[item.itemId]) 
                  {
                    this.piattiPerId[item.itemId] = await lastValueFrom(this.piattoService.getPiattoPerId(item.itemId));
                    console.log('Loaded piatto:', this.piattiPerId[item.itemId]);
                  }

                  const piatto = this.piattiPerId[item.itemId];
                  this.piattoItemsPerPiatto[item.itemId] = await lastValueFrom(this.piattoItemService.getPerPiattoId(piatto.id!));
                  // piatto non ha la proprietà ingredienti
                  if (piatto) {
                    for (const ingrediente of this.piattoItemsPerPiatto[item.itemId]) {
                      if (!this.ingredientiPerId[ingrediente.ingredienteId]) {
                        this.ingredientiPerId[ingrediente.ingredienteId] = await lastValueFrom(
                          this.inventarioService.trovaArticoloPerId(ingrediente.ingredienteId)
                        );
                      }
                    }
                  }
                } else if (item.tipoItem === 'BEVANDA') {
                  if (!this.ingredientiPerId[item.itemId]) {
                    this.ingredientiPerId[item.itemId] = await lastValueFrom(this.inventarioService.trovaArticoloPerId(item.itemId));
                  }
                }
              }
            }
          } catch (error) {
            this.ordiniPerTavolo[tavolo.id] = [];
          }
        }
      }
      this.calcolaStatistiche();
    } catch (error) {
      console.error('Errore nel caricamento tavoli:', error);
      this.snackBar.open('Errore nel caricamento tavoli', 'Chiudi', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  getOrdineItems(ordineId: number): OrdineItem[] {
    return this.ordineItemsPerOrdine[ordineId] || [];
  }

  getPiatto(itemId: number): Piatto | undefined {
    return this.piattiPerId[itemId];
  }

  getPiattoItemsByPiattoId(piattoId: number): PiattoItem[] {
    return this.piattoItemsPerPiatto[piattoId] || [];
  }



  getIngrediente(ingredienteId: number): Inventario | undefined {
    console.log('Getting ingrediente for ID:', ingredienteId, this.ingredientiPerId);
    return this.ingredientiPerId[ingredienteId];
  }



  // servivano prima
  trovaItemPerOrdine(ordineId: number): Observable<OrdineItem[]> {
    return this.ordineItemService.trovaItemPerOrdine(ordineId);
  }

  trovaArticoloPerId(ingredienteId: number): Observable<Inventario> {
    return this.inventarioService.trovaArticoloPerId(ingredienteId);
  }


  getPiattoPerId(piattoId: number): Observable<Piatto> {
    return this.piattoService.getPiattoPerId(piattoId);
  }

  calcolaStatistiche() {
    this.tavoliLiberi = this.tavoli.filter(t => this.isTavoloLibero(t)).length;
    this.tavoliOccupati = this.tavoli.length - this.tavoliLiberi;
  }




  // E' GIUSTO? 
  // IL FATTO CHE SIA LIBERO O OCCUPATO SERVE GIUSTO A RISERVARE DELLE PRENOTAZIONI
  isTavoloLibero(tavolo: Tavolo): boolean {
    const tavoloId = tavolo.id!;
    const ordiniAttivi = this.ordiniPerTavolo[tavoloId] || [];
    return ordiniAttivi.length === 0;
  }

  getOrdiniAttivi(tavoloId: number): Ordine[] {
    return this.ordiniPerTavolo[tavoloId] || [];
  }

  getTotaleFatturato(tavoloId: number): number {
    const ordini = this.getOrdiniAttivi(tavoloId);
    return ordini.reduce((total, ordine) => total + (ordine.prezzoTotale || 0), 0);
  }



  async cambiaDisponibilita(tavolo: Tavolo, disponibile: boolean) {
    try {
      await lastValueFrom(
        this.tavoloService.cambiaDisponibilita(tavolo.id!, disponibile)
      );
      
      await this.caricaTavoli();
      
      const messaggio = disponibile ? 'Tavolo liberato' : 'Tavolo occupato';
      this.snackBar.open(messaggio, 'Chiudi', { duration: 2000 });
      
    } catch (error) {
      console.error('Errore nel cambio disponibilità:', error);
      this.snackBar.open('Errore nell\'aggiornamento', 'Chiudi', { duration: 3000 });
    }
  }




  async liberaTavolo(tavolo: Tavolo) {
    try {
      // Prima ottieni tutti gli ordini del tavolo (inclusi quelli completati)
      const tuttiOrdini = await lastValueFrom(
        this.ordineService.trovaOrdiniPerTavolo(tavolo.id!)
      );

      // Apri il dialog dello scontrino
      const dialogRef = this.dialog.open(ScontrinoDialogComponent, {
        width: '600px',
        maxHeight: '90vh',
        data: {
          tavolo: tavolo,
          ordini: tuttiOrdini
        } as ScontrinoDialogData,
        disableClose: false
      });

      // Aspetta che l'utente confermi
      const result = await lastValueFrom(dialogRef.afterClosed());
      
      if (result && result.action === 'libera') {
        // Chiudi tutti gli ordini attivi
        const ordiniAttivi = this.getOrdiniAttivi(tavolo.id!);
        
        for (const ordine of ordiniAttivi) {
          await lastValueFrom(
            this.ordineService.aggiornaStatoOrdine(ordine.id!, 'chiuso')
          );
        }

        // Libera il tavolo
        await this.cambiaDisponibilita(tavolo, true);
        
        this.snackBar.open(
          `Tavolo ${tavolo.id} liberato con successo`, 
          'Chiudi', 
          { duration: 3000 }
        );
      }

    } catch (error) {
      console.error('Errore nella liberazione del tavolo:', error);
      this.snackBar.open('Errore nella liberazione del tavolo', 'Chiudi', { duration: 3000 });
    }
  }




  getStatoColor(stato: string): string {
    switch (stato) {
      case 'pending': return '#ff9800';
      case 'preparazione': return '#2196f3';
      case 'servito': return '#4caf50';
      case 'chiuso': return '#607d8b';
      case 'annullato': return '#f44336';
      default: return '#9e9e9e';
    }
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
}
