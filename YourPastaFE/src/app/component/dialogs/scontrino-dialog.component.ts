import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

import { Ordine } from '../../dto/ordine.model';
import { OrdineItemService } from '../../service/ordine-item.service';
import { InventarioService } from '../../service/inventario.service';
import { OrdineItem } from '../../dto/ordine-item.model';
import { Inventario } from '../../dto/inventario.model';
import { lastValueFrom } from 'rxjs';

export interface ScontrinoDialogData {
  tavolo: any;
  ordini: Ordine[];
}

@Component({
  selector: 'app-scontrino-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule
  ],
  template: `
    <div class="scontrino-dialog">
      <div class="scontrino-header">
        <h2 mat-dialog-title>
          <mat-icon>restaurant</mat-icon>
          Scontrino Tavolo {{ data.tavolo.id }}
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="scontrino-content">
          <!-- Header ristorante -->
          <div class="ristorante-header">
            <h3>🍝 YourPasta</h3>
            <p>Via Esempio 123, Ferrara</p>
            <p>Tel: 0532 123456</p>
            <mat-divider></mat-divider>
          </div>

          <!-- Informazioni tavolo -->
          <div class="tavolo-info">
            <div class="info-row">
              <span>Tavolo:</span>
              <span><strong>{{ data.tavolo.id }}</strong></span>
            </div>
            <div class="info-row">
              <span>Data:</span>
              <span>{{ dataCorrente | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-row">
              <span>Ordini:</span>
              <span>{{ data.ordini.length }}</span>
            </div>
            <mat-divider></mat-divider>
          </div>

          <!-- Dettagli ordini -->
          <div class="ordini-dettaglio">
            <div *ngFor="let ordine of data.ordini; let i = index" class="ordine-section">
              <div class="ordine-header">
                <h4>Ordine #{{ ordine.id }}</h4>
                <span class="ordine-time">{{ formatTime(ordine.dataOrdine) }}</span>
              </div>
              
              <!-- Items dell'ordine -->
              <div *ngIf="ordineItems[ordine.id!]" class="items-list">
                <div *ngFor="let item of ordineItems[ordine.id!]" class="item-row">
                  <div class="item-info">
                    <span class="item-name">{{ getItemName(item.itemId) }}</span>
                    <span class="item-qty">x{{ item.quantita }}</span>
                    <span class="item-categoria">{{ getItemCategoria(item.itemId) }}</span>
                  </div>
                  <span class="item-price">{{ item.prezzo | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
                
                <!-- Riepilogo ingredienti per ordine -->
                <div class="ingredienti-summary">
                  <div class="ingredienti-header">
                    <mat-icon>restaurant_menu</mat-icon>
                    <span>Ingredienti ordinati:</span>
                  </div>
                  <div class="ingredienti-list">
                    <span *ngFor="let item of ordineItems[ordine.id!]; let last = last" class="ingrediente-tag">
                      {{ getItemName(item.itemId) }}
                      <span class="qty">(x{{ item.quantita }})</span><span *ngIf="!last">, </span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Loading items -->
              <div *ngIf="!ordineItems[ordine.id!] && isLoadingItems" class="loading-items">
                <mat-icon>hourglass_empty</mat-icon>
                <span>Caricamento items...</span>
              </div>

              <!-- Totale ordine -->
              <div class="ordine-totale">
                <mat-divider></mat-divider>
                <div class="totale-row">
                  <span>Totale Ordine #{{ ordine.id }}:</span>
                  <span class="totale-amount">{{ ordine.prezzoTotale | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Totale generale -->
          <div class="totale-generale">
            <mat-divider></mat-divider>
            <div class="totale-finale">
              <h3>
                <span>TOTALE TAVOLO:</span>
                <span class="amount">{{ getTotaleGenerale() | currency:'EUR':'symbol':'1.2-2' }}</span>
              </h3>
            </div>
          </div>

          <!-- Footer -->
          <div class="scontrino-footer">
            <mat-divider></mat-divider>
            <p>Grazie per aver scelto YourPasta!</p>
            <p class="small">Arrivederci e buona giornata</p>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>
          <mat-icon>print</mat-icon>
          Stampa Scontrino
        </button>
        <button mat-raised-button color="primary" (click)="confermaLiberaTavolo()">
          <mat-icon>check</mat-icon>
          Libera Tavolo
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .scontrino-dialog {
      width: 100%;
      max-width: 500px;
    }

    .scontrino-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px 0;
    }

    .scontrino-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .scontrino-content {
      font-family: 'Courier New', monospace;
      background: white;
      padding: 20px;
      border: 1px solid #ddd;
      max-height: 70vh;
      overflow-y: auto;
    }

    .ristorante-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .ristorante-header h3 {
      margin: 0 0 8px 0;
      font-size: 1.5em;
      font-weight: bold;
    }

    .ristorante-header p {
      margin: 4px 0;
      font-size: 0.9em;
    }

    .tavolo-info {
      margin: 20px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }

    .ordini-dettaglio {
      margin: 20px 0;
    }

    .ordine-section {
      margin-bottom: 20px;
    }

    .ordine-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .ordine-header h4 {
      margin: 0;
      font-size: 1.1em;
    }

    .ordine-time {
      font-size: 0.9em;
      color: #666;
    }

    .items-list {
      margin-left: 10px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 6px 0;
      padding: 4px 0;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .item-name {
      font-weight: 500;
    }

    .item-qty {
      font-size: 0.85em;
      color: #666;
    }

    .item-categoria {
      font-size: 0.75em;
      color: #888;
      font-style: italic;
    }

    .ingredienti-summary {
      margin-top: 15px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid #4caf50;
    }

    .ingredienti-header {
      display: flex;
      align-items: center;
      gap: 5px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #2e7d32;
      font-size: 0.9em;
    }

    .ingredienti-list {
      line-height: 1.4;
    }

    .ingrediente-tag {
      display: inline;
      font-size: 0.85em;
    }

    .qty {
      color: #666;
      font-weight: bold;
    }

    .item-price {
      font-weight: bold;
      text-align: right;
    }

    .loading-items {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      color: #666;
      font-style: italic;
    }

    .ordine-totale {
      margin-top: 10px;
    }

    .totale-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-weight: bold;
    }

    .totale-generale {
      margin-top: 20px;
    }

    .totale-finale {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
    }

    .totale-finale h3 {
      margin: 0;
      display: flex;
      justify-content: space-between;
      font-size: 1.2em;
    }

    .amount {
      color: #d32f2f;
      font-weight: bold;
    }

    .totale-amount {
      color: #2e7d32;
    }

    .scontrino-footer {
      text-align: center;
      margin-top: 20px;
    }

    .scontrino-footer p {
      margin: 8px 0;
    }

    .small {
      font-size: 0.8em;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }

    @media print {
      .scontrino-dialog {
        box-shadow: none;
      }
      
      mat-dialog-actions {
        display: none;
      }
    }
  `]
})
export class ScontrinoDialogComponent {
  dataCorrente = new Date();
  ordineItems: { [ordineId: number]: OrdineItem[] } = {};
  inventarioItems: { [itemId: number]: Inventario } = {};
  isLoadingItems = true;

  constructor(
    public dialogRef: MatDialogRef<ScontrinoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ScontrinoDialogData,
    private ordineItemService: OrdineItemService,
    private inventarioService: InventarioService
  ) {
    this.caricaItemsOrdini();
  }

  async caricaItemsOrdini() {
    this.isLoadingItems = true;
    
    try {
      // Prima carica tutto l'inventario
      const inventario = await lastValueFrom(this.inventarioService.trovaTuttiGliArticoli());
      inventario.forEach((item: Inventario) => {
        if (item.id) {
          this.inventarioItems[item.id] = item;
        }
      });

      // Poi carica gli items per ogni ordine
      for (const ordine of this.data.ordini) {
        if (ordine.id) {
          const items = await lastValueFrom(
            this.ordineItemService.trovaItemPerOrdine(ordine.id)
          );
          this.ordineItems[ordine.id] = items;
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento items ordini:', error);
    } finally {
      this.isLoadingItems = false;
    }
  }

  getTotaleGenerale(): number {
    return this.data.ordini.reduce((total, ordine) => total + (ordine.prezzoTotale || 0), 0);
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  getItemName(itemId: number): string {
    const item = this.inventarioItems[itemId];
    return item ? item.nome : `Item #${itemId}`;
  }

  getItemCategoria(itemId: number): string {
    const item = this.inventarioItems[itemId];
    if (!item) return '';
    
    // Traduciamo le categorie per una migliore presentazione
    const categoriaMap: { [key: string]: string } = {
      'pasta': 'Pasta',
      'condimento_pronto': 'Condimento',
      'condimento_base': 'Base',
      'proteine': 'Proteine',
      'ingrediente_base': 'Ingrediente',
      'topping': 'Topping',
      'bevande': 'Bevanda'
    };
    
    return categoriaMap[item.categoria] || item.categoria;
  }

  confermaLiberaTavolo() {
    this.dialogRef.close({ action: 'libera' });
  }
}
