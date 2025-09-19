import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';

import { OrdineService } from '../../service/ordine.service';
import { OrdineItemService } from '../../service/ordine-item.service';
import { InventarioService } from '../../service/inventario.service';
import { PiattoService } from '../../service/piatto.service';
import { PiattoItemService } from '../../service/piatto-item.service';

import { Ordine } from '../../dto/ordine.model';
import { OrdineItem } from '../../dto/ordine-item.model';
import { Inventario } from '../../dto/inventario.model';
import { Piatto } from '../../dto/piatto.model';
import { PiattoItem } from '../../dto/piatto-item.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-ordini-cucina',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule,
    MatBadgeModule
  ],
  templateUrl: './ordini-cucina.component.html',
  styleUrls: ['./ordini-cucina.component.css']
})
export class OrdiniCucinaComponent implements OnInit {
  
  ordiniPending: Ordine[] = [];
  ordiniInPreparazione: Ordine[] = [];
  ordiniPronti: Ordine[] = [];
  
  displayedColumns: string[] = ['id', 'tavolo', 'dataOrdine', 'cliente', 'items', 'tempo', 'actions'];
  
  // Dati ingredienti
  ordineItems: { [ordineId: number]: OrdineItem[] } = {};

  // lista di coppie che associa l'id dell'ingrediente all'oggetto Inventario
  inventarioItems: { [itemId: number]: Inventario } = {};

  piattiPerId: { [piattoId: number]: Piatto } = {};
  piattoItemsPerPiatto: { [piattoId: number]: PiattoItem[] } = {};
  ingredientiPerId: { [ingredienteId: number]: Inventario } = {};
  
  
  // Auto refresh
  refreshInterval: any;
  isLoading = false;

  constructor(
    private ordineService: OrdineService,
    private ordineItemService: OrdineItemService,
    private inventarioService: InventarioService,
    private piattoService: PiattoService,
    private piattoItemService: PiattoItemService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.caricaOrdini();
    
    // Auto refresh ogni 30 secondi
    this.refreshInterval = setInterval(() => {
      this.caricaOrdini();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  async caricaOrdini() {
    this.isLoading = true;
    try {
      // Carica inventario
      const inventario = await lastValueFrom(this.inventarioService.trovaTuttiGliArticoli());
      inventario.forEach((item: Inventario) => {
        if (item.id) {
          this.inventarioItems[item.id] = item;
          this.ingredientiPerId[item.id] = item;
        }
      });

      // Carica ordini per stato
      this.ordiniPending = await lastValueFrom(this.ordineService.trovaOrdiniPerStatus('pending'));
      this.ordiniInPreparazione = await lastValueFrom(this.ordineService.trovaOrdiniPerStatus('preparazione'));
      this.ordiniPronti = await lastValueFrom(this.ordineService.trovaOrdiniPerStatus('servito'));


      // Carica gli items per tutti gli ordini e i dettagli dei piatti/ingredienti
      const tuttiOrdini = [...this.ordiniPending, ...this.ordiniInPreparazione, ...this.ordiniPronti];
      
      for (const ordine of tuttiOrdini) {
        if (ordine.id) {
          try {
            // trova gli oridineItems per l'ordine specificato
            const items = await lastValueFrom(this.ordineItemService.trovaItemPerOrdine(ordine.id));
            this.ordineItems[ordine.id] = items;
            for (const item of items) {
              if (item.tipoItem === 'PIATTO') {
                if (!this.piattiPerId[item.itemId]) 
                {
                  this.piattiPerId[item.itemId] = await lastValueFrom(this.piattoService.getPiattoPerId(item.itemId));
                }

                if (!this.piattoItemsPerPiatto[item.itemId]) 
                {
                  this.piattoItemsPerPiatto[item.itemId] = await lastValueFrom(this.piattoItemService.getPerPiattoId(item.itemId));
                }
                // nel caso sia un piatto recupera i suoi ingredienti dall'inventario
                for (const piattoItem of this.piattoItemsPerPiatto[item.itemId]) {
                  if (!this.ingredientiPerId[piattoItem.ingredienteId])
                  {
                    this.ingredientiPerId[piattoItem.ingredienteId] = await lastValueFrom(this.inventarioService.trovaArticoloPerId(piattoItem.ingredienteId));
                  }
                }
              } else if (item.tipoItem === 'BEVANDA') {
                if (!this.ingredientiPerId[item.itemId]) {
                  this.ingredientiPerId[item.itemId] = await lastValueFrom(this.inventarioService.trovaArticoloPerId(item.itemId));
                }
              }
            }
          } catch (error) {
            this.ordineItems[ordine.id] = [];
          }
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento ordini:', error);
      this.snackBar.open('Errore nel caricamento ordini', 'Chiudi', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  // Cambio stato ordine
  async cambiaStato(ordine: Ordine, nuovoStato: string) {
    try {
      await lastValueFrom(
        this.ordineService.aggiornaStatoOrdine(ordine.id!, nuovoStato)
      );
      
      await this.caricaOrdini();
      
      const messaggi = {
        'preparazione': 'Ordine preso in carico',
        'servito': 'Ordine completato e servito',
        'chiuso': 'Ordine chiuso',
        'annullato': 'Ordine annullato'
      };
      
      this.snackBar.open(
        messaggi[nuovoStato as keyof typeof messaggi] || 'Stato aggiornato', 
        'Chiudi', 
        { duration: 2000 }
      );
      
    } catch (error) {
      console.error('Errore nell\'aggiornamento stato:', error);
      this.snackBar.open('Errore nell\'aggiornamento', 'Chiudi', { duration: 3000 });
    }
  }


  // Metodi specifici per la gestione degli stati
  async iniziaPreparazione(ordine: Ordine) {
    await this.cambiaStato(ordine, 'preparazione');
  }

  async completaPreparazione(ordine: Ordine) {
    await this.cambiaStato(ordine, 'servito');
  }

  async annullaOrdine(ordine: Ordine) {
    if (confirm(`Sei sicuro di voler annullare l'ordine #${ordine.id}?`)) {
      await this.cambiaStato(ordine, 'annullato');
    }
  }

  // Utility functions
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  calcolaTempoTrascorso(dataOrdine: string): string {
    const ora = new Date();
    const ordine = new Date(dataOrdine);
    const diffMinuti = Math.floor((ora.getTime() - ordine.getTime()) / 60000);
    
    if (diffMinuti < 60) {
      return `${diffMinuti}m`;
    } else {
      const ore = Math.floor(diffMinuti / 60);
      const minutiRimanenti = diffMinuti % 60;
      return `${ore}h ${minutiRimanenti}m`;
    }
  }

  getTempoColor(dataOrdine: string): string {
    const diffMinuti = Math.floor((new Date().getTime() - new Date(dataOrdine).getTime()) / 60000);
    
    if (diffMinuti < 15) return 'green';
    if (diffMinuti < 30) return 'orange';
    return 'red';
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

  getTotalOrdiniAttivi(): number {
    return this.ordiniPending.length + this.ordiniInPreparazione.length + this.ordiniPronti.length;
  }

  hasIngredienti(ordineId: number): boolean {
    return this.ordineItems[ordineId] && this.ordineItems[ordineId].length > 0;
  }
}
