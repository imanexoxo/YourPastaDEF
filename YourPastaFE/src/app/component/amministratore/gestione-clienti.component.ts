import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';


import { UtenteService } from '../../service/utente.service';
import { Utente } from '../../dto/utente.model';
import { lastValueFrom } from 'rxjs';
import { StoricoOrdiniComponent } from '../cliente/storico-ordini.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-gestione-clienti',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    StoricoOrdiniComponent
  ],
  templateUrl: './gestione-clienti.component.html',
  styleUrls: ['./gestione-clienti.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GestioneClientiComponent implements OnInit {
  utentiUnificati: Utente[] = [];
  puntiEdit: number[] = [];
  displayedColumns: string[] = ['nome', 'cognome', 'username', 'email', 'punti', 'stato', 'actions'];
  utenteStorico: Utente | null = null;
  apriStoricoOrdini(utente: Utente) {
    console.log('Apro storico ordini per:', utente);
    this.utenteStorico = utente;
  }

  chiudiStoricoOrdini() {
    this.utenteStorico = null;
  }

  constructor(
    private utenteService: UtenteService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.caricaUtenti();
  }

  async caricaUtenti() {
    try {
      const tuttiUtenti = await lastValueFrom(this.utenteService.trovaTuttiGliUtenti());
      this.utentiUnificati = tuttiUtenti.filter(u => u.ruolo === 'cliente' || u.ruolo === 'studente');
      this.puntiEdit = this.utentiUnificati.map(u => u.punti || 0);
    } catch (error) {
      console.error('Errore nel caricamento utenti:', error);
    }
  }

  async eliminaUtente(id: number) {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      try {
        await lastValueFrom(this.utenteService.eliminaUtente(id));
        await this.caricaUtenti();
        this.snackBar.open('Utente eliminato con successo', 'Chiudi', { duration: 2000 });
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
        this.snackBar.open('Errore nell\'eliminazione utente', 'Chiudi', { duration: 3000 });
      }
    }
  }

  async cambiaStatoUtente(utente: Utente) {
    try {
      const nuovoStato = !utente.bloccato;
      await lastValueFrom(this.utenteService.cambiaStatoUtente(utente.id!, nuovoStato));
      await this.caricaUtenti();
      const messaggio = nuovoStato ? 'Utente bloccato' : 'Utente sbloccato';
      this.snackBar.open(messaggio, 'Chiudi', { duration: 2000 });
    } catch (error) {
      console.error('Errore nel cambio stato:', error);
      this.snackBar.open('Errore nel cambio stato utente', 'Chiudi', { duration: 3000 });
    }
  }

  async salvaPunti(utente: Utente, nuoviPunti: number) {
    try {
      await lastValueFrom(this.utenteService.aggiornaPunti(utente.id!, nuoviPunti));
      await this.caricaUtenti();
      this.snackBar.open('Punti aggiornati con successo', 'Chiudi', { duration: 2000 });
    } catch (error) {
      console.error('Errore nell\'aggiornamento punti:', error);
      this.snackBar.open('Errore nell\'aggiornamento punti', 'Chiudi', { duration: 3000 });
    }
  }
}
