import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { OrdineService } from '../../service/ordine.service';
import { UtenteService } from '../../service/utente.service';
import { OrdineItemService } from '../../service/ordine-item.service';
import { InventarioService } from '../../service/inventario.service';
import { Ordine } from '../../dto/ordine.model';
import { Utente } from '../../dto/utente.model';
import { OrdineItem } from '../../dto/ordine-item.model';
import { Inventario } from '../../dto/inventario.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-storico-ordini',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <div class="storico-container">
      <div class="header-section">
        <h2>
          <mat-icon>history</mat-icon>
          Storico Ordini Completo
        </h2>
        
        <!-- Filtri -->
        <div class="filtri-section">
          <mat-form-field>
            <mat-label>Stato Ordine</mat-label>
            <mat-select [(value)]="filtroStato" (selectionChange)="applicaFiltri()">
              <mat-option value="">Tutti</mat-option>
              <mat-option value="pending">In Attesa</mat-option>
              <mat-option value="preparazione">In Preparazione</mat-option>
              <mat-option value="servito">Servito</mat-option>
              <mat-option value="chiuso">Chiuso</mat-option>
              <mat-option value="annullato">Annullato</mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field>
            <mat-label>Numero Tavolo</mat-label>
            <mat-input type="number" [(ngModel)]="filtroTavolo" (input)="applicaFiltri()" placeholder="Es. 5"></mat-input>
          </mat-form-field>
          
          <button mat-icon-button (click)="caricaOrdini()" [disabled]="isLoading" title="Aggiorna">
            <mat-icon [class.spinning]="isLoading">refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Statistiche -->
      <div class="stats-cards">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ ordiniFiltrati.length }}</div>
            <div class="stat-label">Ordini Totali</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ calcolaFatturatoTotale() | currency:'EUR':'symbol':'1.2-2' }}</div>
            <div class="stat-label">Fatturato Totale</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-value">{{ calcolaMediaOrdine() | currency:'EUR':'symbol':'1.2-2' }}</div>
            <div class="stat-label">Media per Ordine</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-icon>hourglass_empty</mat-icon>
        <p>Caricamento storico ordini...</p>
      </div>

      <!-- Tabella ordini -->
      <div *ngIf="!isLoading" class="tabella-container">
        <mat-table [dataSource]="ordiniFiltrati" class="ordini-table" matSort>
          
          <!-- Colonna ID -->
          <ng-container matColumnDef="id">
            <mat-header-cell *matHeaderCellDef mat-sort-header>ID</mat-header-cell>
            <mat-cell *matCellDef="let ordine">#{{ ordine.id }}</mat-cell>
          </ng-container>

          <!-- Colonna Tavolo -->
          <ng-container matColumnDef="tavolo">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Tavolo</mat-header-cell>
            <mat-cell *matCellDef="let ordine">{{ ordine.nTavolo }}</mat-cell>
          </ng-container>

          <!-- Colonna Cliente -->
          <ng-container matColumnDef="cliente">
            <mat-header-cell *matHeaderCellDef>Cliente</mat-header-cell>
            <mat-cell *matCellDef="let ordine">
              <div *ngIf="utenti[ordine.utenteId]" class="cliente-info">
                <span class="nome">{{ utenti[ordine.utenteId].nome }} {{ utenti[ordine.utenteId].cognome }}</span>
                <mat-chip [color]="getRuoloColor(utenti[ordine.utenteId].ruolo)" class="ruolo-chip">
                  {{ utenti[ordine.utenteId].ruolo }}
                </mat-chip>
              </div>
              <span *ngIf="!utenti[ordine.utenteId]">Cliente #{{ ordine.utenteId }}</span>
            </mat-cell>
          </ng-container>

          <!-- Colonna Data -->
          <ng-container matColumnDef="data">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Data e Ora</mat-header-cell>
            <mat-cell *matCellDef="let ordine">
              <div class="data-info">
                <span class="data">{{ formatDate(ordine.dataOrdine) }}</span>
                <span class="ora">{{ formatTime(ordine.dataOrdine) }}</span>
              </div>
            </mat-cell>
          </ng-container>

          <!-- Colonna Ingredienti -->
          <ng-container matColumnDef="ingredienti">
            <mat-header-cell *matHeaderCellDef>Ingredienti</mat-header-cell>
            <mat-cell *matCellDef="let ordine">
              <div class="ingredienti-preview">
                <span *ngIf="hasIngredienti(ordine.id!)" class="ingredienti-testo">
                  {{ getIngredientiBreve(ordine.id!) }}
                </span>
                <span *ngIf="!hasIngredienti(ordine.id!)" class="loading-text">
                  Caricamento...
                </span>
              </div>
            </mat-cell>
          </ng-container>

          <!-- Colonna Stato -->
          <ng-container matColumnDef="stato">
            <mat-header-cell *matHeaderCellDef>Stato</mat-header-cell>
            <mat-cell *matCellDef="let ordine">
              <mat-chip [style.background-color]="getStatoColor(ordine.status)" class="stato-chip">
                {{ getStatoLabel(ordine.status) }}
              </mat-chip>
            </mat-cell>
          </ng-container>

          <!-- Colonna Prezzo -->
          <ng-container matColumnDef="prezzo">
            <mat-header-cell *matHeaderCellDef mat-sort-header>Prezzo</mat-header-cell>
            <mat-cell *matCellDef="let ordine">
              <span class="prezzo-value">{{ ordine.prezzoTotale | currency:'EUR':'symbol':'1.2-2' }}</span>
            </mat-cell>
          </ng-container>

          <!-- Colonna Azioni -->
          <ng-container matColumnDef="azioni">
            <mat-header-cell *matHeaderCellDef>Azioni</mat-header-cell>
            <mat-cell *matCellDef="let ordine">
              <button mat-icon-button 
                      color="primary" 
                      title="Visualizza dettagli"
                      (click)="visualizzaDettagli(ordine)">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button 
                      color="warn" 
                      title="Elimina ordine"
                      (click)="eliminaOrdine(ordine)"
                      *ngIf="ordine.status === 'annullato'">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
          
        </mat-table>
      </div>

      <!-- Nessun ordine -->
      <div *ngIf="!isLoading && ordiniFiltrati.length === 0" class="no-ordini">
        <mat-icon>receipt_long</mat-icon>
        <h3>Nessun ordine trovato</h3>
        <p>Non ci sono ordini che corrispondono ai filtri selezionati</p>
      </div>
    </div>
  `,
  styles: [`
    .storico-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-section h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #333;
      margin: 0;
    }

    .filtri-section {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filtri-section mat-form-field {
      min-width: 150px;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      text-align: center;
    }

    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #1976d2;
    }

    .stat-label {
      color: #666;
      font-size: 0.9em;
      margin-top: 8px;
    }

    .loading-container {
      text-align: center;
      padding: 60px;
      color: #666;
    }

    .loading-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .tabella-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .ordini-table {
      width: 100%;
    }

    .cliente-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nome {
      font-weight: 500;
    }

    .ruolo-chip {
      font-size: 0.7em !important;
      height: 20px !important;
      line-height: 20px !important;
    }

    .data-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .data {
      font-weight: 500;
    }

    .ora {
      font-size: 0.85em;
      color: #666;
    }

    .ingredienti-preview {
      max-width: 200px;
    }

    .ingredienti-testo {
      font-size: 0.85em;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .loading-text {
      font-style: italic;
      color: #999;
    }

    .stato-chip {
      color: white !important;
      font-weight: 500;
      font-size: 0.8em;
    }

    .prezzo-value {
      font-weight: 600;
      color: #2e7d32;
    }

    .no-ordini {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-ordini mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      color: #ccc;
    }

    @media (max-width: 768px) {
      .storico-container {
        padding: 10px;
      }
      
      .header-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filtri-section {
        justify-content: center;
      }
      
      .stats-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StoricoOrdiniComponent implements OnInit {
  
  ordini: Ordine[] = [];
  ordiniFiltrati: Ordine[] = [];
  utenti: { [key: number]: Utente } = {};
  ordineItems: { [ordineId: number]: OrdineItem[] } = {};
  inventarioItems: { [itemId: number]: Inventario } = {};
  
  // Filtri
  filtroStato = '';
  filtroTavolo?: number;
  
  displayedColumns: string[] = ['id', 'tavolo', 'cliente', 'data', 'ingredienti', 'stato', 'prezzo', 'azioni'];
  isLoading = false;

  constructor(
    private ordineService: OrdineService,
    private utenteService: UtenteService,
    private ordineItemService: OrdineItemService,
    private inventarioService: InventarioService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.caricaOrdini();
  }

  async caricaOrdini() {
    this.isLoading = true;
    
    try {
      // Carica tutti gli ordini
      this.ordini = await lastValueFrom(this.ordineService.trovaTuttiGliOrdini());
      this.ordiniFiltrati = [...this.ordini];
      
      // Carica tutti gli utenti
      const utentiArray = await lastValueFrom(this.utenteService.trovaTuttiGliUtenti());
      utentiArray.forEach(utente => {
        if (utente.id) {
          this.utenti[utente.id] = utente;
        }
      });

      // Carica inventario
      const inventario = await lastValueFrom(this.inventarioService.trovaTuttiGliArticoli());
      inventario.forEach((item: Inventario) => {
        if (item.id) {
          this.inventarioItems[item.id] = item;
        }
      });

      // Carica items per ogni ordine
      for (const ordine of this.ordini) {
        if (ordine.id) {
          try {
            const items = await lastValueFrom(
              this.ordineItemService.trovaItemPerOrdine(ordine.id)
            );
            this.ordineItems[ordine.id] = items;
          } catch (error) {
            this.ordineItems[ordine.id] = [];
          }
        }
      }
      
    } catch (error) {
      console.error('Errore nel caricamento storico ordini:', error);
      this.snackBar.open('Errore nel caricamento storico ordini', 'Chiudi', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  applicaFiltri() {
    this.ordiniFiltrati = this.ordini.filter(ordine => {
      const matchStato = !this.filtroStato || ordine.status === this.filtroStato;
      const matchTavolo = !this.filtroTavolo || ordine.nTavolo === this.filtroTavolo;
      
      return matchStato && matchTavolo;
    });
  }

  // Calcoli statistiche
  calcolaFatturatoTotale(): number {
    return this.ordiniFiltrati.reduce((total, ordine) => total + (ordine.prezzoTotale || 0), 0);
  }

  calcolaMediaOrdine(): number {
    if (this.ordiniFiltrati.length === 0) return 0;
    return this.calcolaFatturatoTotale() / this.ordiniFiltrati.length;
  }

  // Utility functions
  formatDate(dateString?: string): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  formatTime(dateString?: string): string {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
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

  getStatoLabel(stato: string): string {
    switch (stato) {
      case 'pending': return 'In Attesa';
      case 'preparazione': return 'In Preparazione';
      case 'servito': return 'Servito';
      case 'chiuso': return 'Chiuso';
      case 'annullato': return 'Annullato';
      default: return stato;
    }
  }

  getRuoloColor(ruolo: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (ruolo) {
      case 'admin': return 'warn';
      case 'studente': return 'accent';
      case 'cuoco':
      case 'cameriere': return 'primary';
      default: return undefined;
    }
  }

  hasIngredienti(ordineId: number): boolean {
    return this.ordineItems[ordineId] && this.ordineItems[ordineId].length > 0;
  }

  getIngredientiBreve(ordineId: number): string {
    const items = this.ordineItems[ordineId] || [];
    if (items.length === 0) return '';
    
    const nomi = items.map(item => {
      const inventarioItem = this.inventarioItems[item.itemId];
      return inventarioItem ? inventarioItem.nome : `Item #${item.itemId}`;
    });
    
    if (nomi.length <= 3) {
      return nomi.join(', ');
    } else {
      return nomi.slice(0, 3).join(', ') + ` e altri ${nomi.length - 3}...`;
    }
  }

  visualizzaDettagli(ordine: Ordine) {
    // TODO: Aprire dialog con dettagli completi
    this.snackBar.open(`Dettagli ordine #${ordine.id} - Tavolo ${ordine.nTavolo}`, 'Chiudi', { duration: 3000 });
  }

  async eliminaOrdine(ordine: Ordine) {
    if (confirm(`Sei sicuro di voler eliminare l'ordine #${ordine.id}?`)) {
      try {
        // TODO: Implementare eliminazione ordine nel backend
        this.snackBar.open('Funzionalità in sviluppo', 'Chiudi', { duration: 2000 });
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
        this.snackBar.open('Errore nell\'eliminazione', 'Chiudi', { duration: 3000 });
      }
    }
  }
}
