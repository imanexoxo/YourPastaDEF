import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { GestioneClientiComponent } from './gestione-clienti.component';
import { GestionePersonaleComponent } from './gestione-personale.component';
import { StoricoOrdiniComponent } from './storico-ordini.component';

import { UtenteService } from '../../service/utente.service';
import { OrdineService } from '../../service/ordine.service';
import { InventarioService } from '../../service/inventario.service';
import { TavoloService } from '../../service/tavolo.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    RouterModule,
    GestioneClientiComponent,
    GestionePersonaleComponent,
    StoricoOrdiniComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="header-section">
        <h1>
          <mat-icon>admin_panel_settings</mat-icon>
          Dashboard Amministratore
        </h1>
        <p class="subtitle">Gestione completa del ristorante YourPasta</p>
      </div>

      <!-- Statistiche generali -->
      <div class="stats-grid">
        <mat-card class="stat-card utenti">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totaleUtenti }}</div>
              <div class="stat-label">Utenti Totali</div>
              <div class="stat-detail">
                <span>Clienti: {{ stats.clienti }}</span>
                <span>Studenti: {{ stats.studenti }}</span>
                <span>Staff: {{ stats.staff }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card ordini">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>restaurant_menu</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.ordiniTotali }}</div>
              <div class="stat-label">Ordini Totali</div>
              <div class="stat-detail">
                <span>Oggi: {{ stats.ordiniOggi }}</span>
                <span>Attivi: {{ stats.ordiniAttivi }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card fatturato">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>euro</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.fatturato | currency:'EUR':'symbol':'1.0-0' }}</div>
              <div class="stat-label">Fatturato Totale</div>
              <div class="stat-detail">
                <span>Media/Ordine: {{ stats.mediaOrdine | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card tavoli">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>table_restaurant</mat-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.tavoliTotali }}</div>
              <div class="stat-label">Tavoli</div>
              <div class="stat-detail">
                <span>Occupati: {{ stats.tavoliOccupati }}</span>
                <span>Liberi: {{ stats.tavoliLiberi }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Azioni rapide -->
      <div class="quick-actions">
        <h3>Azioni Rapide</h3>
        <div class="actions-grid">
          <button mat-raised-button color="primary" (click)="selectedTab = 0">
            <mat-icon>people</mat-icon>
            Gestisci Clienti
          </button>
          <button mat-raised-button color="accent" (click)="selectedTab = 1">
            <mat-icon>badge</mat-icon>
            Gestisci Personale
          </button>
          <button mat-raised-button color="warn" (click)="selectedTab = 2">
            <mat-icon>history</mat-icon>
            Storico Ordini
          </button>
          <button mat-raised-button (click)="aggiornaStatistiche()">
            <mat-icon>refresh</mat-icon>
            Aggiorna Dati
          </button>
        </div>
      </div>

      <!-- Tab delle sezioni -->
      <mat-tab-group [(selectedIndex)]="selectedTab" class="admin-tabs">
        <mat-tab label="Gestione Clienti">
          <div class="tab-content">
            <app-gestione-clienti></app-gestione-clienti>
          </div>
        </mat-tab>

        <mat-tab label="Gestione Personale">
          <div class="tab-content">
            <app-gestione-personale></app-gestione-personale>
          </div>
        </mat-tab>

        <mat-tab label="Storico Ordini">
          <div class="tab-content">
            <app-storico-ordini></app-storico-ordini>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .header-section h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 2.5em;
    }

    .subtitle {
      color: #666;
      font-size: 1.1em;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      transition: all 0.3s ease;
      border-radius: 12px;
      overflow: hidden;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    .stat-card.utenti {
      border-left: 4px solid #2196f3;
    }

    .stat-card.ordini {
      border-left: 4px solid #ff9800;
    }

    .stat-card.fatturato {
      border-left: 4px solid #4caf50;
    }

    .stat-card.tavoli {
      border-left: 4px solid #9c27b0;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px !important;
    }

    .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon mat-icon {
      color: white;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .stat-info {
      flex: 1;
    }

    .stat-value {
      font-size: 2.2em;
      font-weight: 700;
      color: #333;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 1em;
      color: #666;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .stat-detail {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-detail span {
      font-size: 0.85em;
      color: #888;
    }

    .quick-actions {
      margin-bottom: 30px;
    }

    .quick-actions h3 {
      color: #333;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .actions-grid button {
      height: 56px;
      font-size: 1em;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
    }

    .admin-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .tab-content {
      padding: 0;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 10px;
      }

      .header-section h1 {
        font-size: 2em;
        flex-direction: column;
        gap: 8px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-card mat-card-content {
        padding: 16px !important;
      }

      .stat-icon {
        width: 50px;
        height: 50px;
      }

      .stat-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .stat-value {
        font-size: 1.8em;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Loading animation */
    .loading {
      opacity: 0.7;
      pointer-events: none;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .loading .stat-value {
      animation: pulse 1.5s infinite;
    }
  `]
})
export class DashboardAdminComponent implements OnInit {
  
  selectedTab = 0;
  isLoading = false;
  
  stats = {
    totaleUtenti: 0,
    clienti: 0,
    studenti: 0,
    staff: 0,
    ordiniTotali: 0,
    ordiniOggi: 0,
    ordiniAttivi: 0,
    fatturato: 0,
    mediaOrdine: 0,
    tavoliTotali: 0,
    tavoliOccupati: 0,
    tavoliLiberi: 0
  };

  constructor(
    private utenteService: UtenteService,
    private ordineService: OrdineService,
    private inventarioService: InventarioService,
    private tavoloService: TavoloService
  ) {}

  async ngOnInit() {
    await this.aggiornaStatistiche();
  }

  async aggiornaStatistiche() {
    this.isLoading = true;
    
    try {
      // Statistiche utenti
      const utenti = await lastValueFrom(this.utenteService.trovaTuttiGliUtenti());
      this.stats.totaleUtenti = utenti.length;
      this.stats.clienti = utenti.filter(u => u.ruolo === 'cliente').length;
      this.stats.studenti = utenti.filter(u => u.ruolo === 'studente').length;
      this.stats.staff = utenti.filter(u => ['cuoco', 'cameriere'].includes(u.ruolo)).length;

      // Statistiche ordini
      const ordini = await lastValueFrom(this.ordineService.trovaTuttiGliOrdini());
      this.stats.ordiniTotali = ordini.length;
      
      const oggi = new Date().toDateString();
      this.stats.ordiniOggi = ordini.filter(o => 
        new Date(o.dataOrdine!).toDateString() === oggi
      ).length;
      
      this.stats.ordiniAttivi = ordini.filter(o => 
        ['pending', 'preparazione'].includes(o.status)
      ).length;

      // Statistiche fatturato
      this.stats.fatturato = ordini.reduce((total, ordine) => 
        total + (ordine.prezzoTotale || 0), 0
      );
      
      this.stats.mediaOrdine = this.stats.ordiniTotali > 0 ? 
        this.stats.fatturato / this.stats.ordiniTotali : 0;

      // Statistiche tavoli
      const tavoli = await lastValueFrom(this.tavoloService.trovaTuttiITavoli());
      this.stats.tavoliTotali = tavoli.length;
      
      // Per calcolare occupati/liberi, dovremmo avere una logica più complessa
      // Per ora usiamo valori di esempio
      this.stats.tavoliOccupati = Math.floor(this.stats.tavoliTotali * 0.6);
      this.stats.tavoliLiberi = this.stats.tavoliTotali - this.stats.tavoliOccupati;

    } catch (error) {
      console.error('Errore nel caricamento statistiche:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
