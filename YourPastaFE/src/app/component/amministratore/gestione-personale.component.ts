import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { UtenteService } from '../../service/utente.service';
import { Utente } from '../../dto/utente.model';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-gestione-personale',
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
    MatDialogModule,
    MatTooltipModule,
  MatChipsModule,
  MatFormFieldModule,
  MatInputModule
  ],
  templateUrl: './gestione-personale.component.html',
  styleUrls: ['./gestione-personale.component.css']
})

export class GestionePersonaleComponent implements OnInit {
  cuochi: Utente[] = [];
  camerieri: Utente[] = [];
  displayedColumns: string[] = ['nome', 'cognome', 'username', 'password', 'email', 'dataNascita', 'stato', 'actions'];

  // Stato per modifica/aggiunta utente
  modalitaModifica: boolean = false;
  modalitaAggiunta: boolean = false;
  utenteSelezionato: Utente | null = null;
  showPassword: boolean = false;
  modificaUtenteModel: {
    id: number;
    nome: string;
    cognome: string;
    username: string;
    password: string;
    email: string;
    dataNascita: string;
    ruolo: string;
    bloccato: boolean;
  } = {
    id: 0,
    nome: '',
    cognome: '',
    username: '',
    password: '',
    email: '',
    dataNascita: '',
    ruolo: '',
    bloccato: false
  };

  aggiungiUtenteModel: {
    nome: string;
    cognome: string;
    username: string;
    password: string;
    email: string;
    dataNascita: string;
    ruolo: string;
    bloccato: boolean;
  } = {
    nome: '',
    cognome: '',
    username: '',
    password: '',
    email: '',
    dataNascita: '',
    ruolo: '',
    bloccato: false
  };

  apriFormAggiungiUtente() {
    this.aggiungiUtenteModel = {
      nome: '',
      cognome: '',
      username: '',
      password: '',
      email: '',
      dataNascita: '',
      ruolo: '',
      bloccato: false
    };
    this.modalitaAggiunta = true;
    this.modalitaModifica = false;
    this.utenteSelezionato = null;
    this.showPassword = false;
  }

  chiudiFormAggiungiUtente() {
    this.modalitaAggiunta = false;
    this.showPassword = false;
  }

  async onSubmitAggiungiUtente() {
    try {
      await lastValueFrom(this.utenteService.creaUtente({
        nome: this.aggiungiUtenteModel.nome,
        cognome: this.aggiungiUtenteModel.cognome,
        username: this.aggiungiUtenteModel.username,
        password: this.aggiungiUtenteModel.password,
        email: this.aggiungiUtenteModel.email,
        dataNascita: this.aggiungiUtenteModel.dataNascita,
        ruolo: this.aggiungiUtenteModel.ruolo as Utente['ruolo'],
        bloccato: this.aggiungiUtenteModel.bloccato
      }));
      await this.caricaPersonale();
      this.snackBar.open('Dipendente aggiunto con successo', 'Chiudi', { duration: 2000 });
      this.chiudiFormAggiungiUtente();
    } catch (error) {
      console.error('Errore nell\'aggiunta:', error);
      this.snackBar.open('Errore nell\'aggiunta', 'Chiudi', { duration: 3000 });
    }
  }

  constructor(
    private utenteService: UtenteService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    await this.caricaPersonale();
  }

  async caricaPersonale() {
    try {
      const tuttiUtenti = await lastValueFrom(this.utenteService.trovaTuttiGliUtenti());
      
  this.cuochi = tuttiUtenti.filter(u => u.ruolo === 'cuoco').map(u => ({ ...u, _showPassword: false }));
  this.camerieri = tuttiUtenti.filter(u => u.ruolo === 'cameriere').map(u => ({ ...u, _showPassword: false }));
    } catch (error) {
      console.error('Errore nel caricamento personale:', error);
    }
  }

  async eliminaPersonale(id: number) {
    if (confirm('Sei sicuro di voler eliminare questo membro del personale?')) {
      try {
        await lastValueFrom(this.utenteService.eliminaUtente(id));
        await this.caricaPersonale();
        this.snackBar.open('Membro del personale eliminato con successo', 'Chiudi', { duration: 2000 });
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
        this.snackBar.open('Errore nell\'eliminazione', 'Chiudi', { duration: 3000 });
      }
    }
  }

  async cambiaStatoPersonale(utente: Utente) {
    try {
      const nuovoStato = !utente.bloccato;
      await lastValueFrom(this.utenteService.cambiaStatoUtente(utente.id!, nuovoStato));
      await this.caricaPersonale();
      
      const messaggio = nuovoStato ? 'Personale bloccato' : 'Personale sbloccato';
      this.snackBar.open(messaggio, 'Chiudi', { duration: 2000 });
    } catch (error) {
      console.error('Errore nel cambio stato:', error);
      this.snackBar.open('Errore nel cambio stato', 'Chiudi', { duration: 3000 });
    }
  }

  modificaPersonale(utente: Utente) {
    this.utenteSelezionato = utente;
    this.modificaUtenteModel = {
      id: utente.id!,
      nome: utente.nome,
      cognome: utente.cognome,
      username: utente.username,
      password: utente.password,
      email: utente.email,
      dataNascita: utente.dataNascita,
      ruolo: utente.ruolo ?? '',
      bloccato: !!utente.bloccato
    };
    this.modalitaModifica = true;
    this.showPassword = false;
  }

  chiudiFormModificaUtente() {
    this.modalitaModifica = false;
    this.utenteSelezionato = null;
    this.showPassword = false;
  }

  async onSubmitModificaUtente() {
    try {
      await lastValueFrom(this.utenteService.aggiornaUtente(this.modificaUtenteModel.id, {
        nome: this.modificaUtenteModel.nome,
        cognome: this.modificaUtenteModel.cognome,
        username: this.modificaUtenteModel.username,
        password: this.modificaUtenteModel.password,
        email: this.modificaUtenteModel.email,
        dataNascita: this.modificaUtenteModel.dataNascita,
  ruolo: this.modificaUtenteModel.ruolo as Utente['ruolo'],
  bloccato: this.modificaUtenteModel.bloccato
      }));
      await this.caricaPersonale();
      this.snackBar.open('Dati aggiornati con successo', 'Chiudi', { duration: 2000 });
      this.chiudiFormModificaUtente();
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      this.snackBar.open('Errore nell\'aggiornamento', 'Chiudi', { duration: 3000 });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }
}
