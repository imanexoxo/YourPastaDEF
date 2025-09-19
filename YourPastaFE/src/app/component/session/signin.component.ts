import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { UtenteService } from '../../service/utente.service';
import { SessionService } from '../../service/session.service';
import { Utente } from '../../dto/utente.model';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  
  // Dati del form di registrazione
  nuovoUtente: Utente = {
    nome: '',
    cognome: '',
    username: '',
    password: '',
    email: '',
    dataNascita: '',
    ruolo: 'cliente'
  };

  // Conferma password
  confermaPassword: string = '';

  // Messaggio di errore
  errore: string = '';

  // Messaggio di successo
  successo: string = '';

  constructor(
    private utenteService: UtenteService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  // Effettua la registrazione
  registra(): void {
    // Validazione base
    if (this.nuovoUtente.password !== this.confermaPassword) {
      this.errore = 'Le password non corrispondono';
      return;
    }

    if (!this.nuovoUtente.nome || !this.nuovoUtente.cognome || 
        !this.nuovoUtente.username || !this.nuovoUtente.password || 
        !this.nuovoUtente.email || !this.nuovoUtente.dataNascita) {
      this.errore = 'Tutti i campi sono obbligatori';
      return;
    }

    // Validazione dominio mail per studenti
    if (this.nuovoUtente.ruolo === 'studente') {
      const email = this.nuovoUtente.email.trim().toLowerCase();
      if (!email.endsWith('unife.it')) {
        this.errore = 'Per registrarti come studente devi inserire la mail istituzionale che termina con "unife.it"';
        return;
      }
    }

    // Log per debug - cosa stiamo inviando al backend
    console.log('Dati utente da inviare:', this.nuovoUtente);
    console.log('Data nascita formato:', typeof this.nuovoUtente.dataNascita, this.nuovoUtente.dataNascita);

    // Converti la data nel formato corretto per il backend (YYYY-MM-DD)
    const utentePerBackend = { ...this.nuovoUtente };
    if (this.nuovoUtente.dataNascita && typeof this.nuovoUtente.dataNascita === 'object') {
      const dataObj = this.nuovoUtente.dataNascita as any;
      utentePerBackend.dataNascita = dataObj.toISOString().split('T')[0];
    }
    
    console.log('Dati convertiti per backend:', utentePerBackend);

    this.utenteService.creaUtente(utentePerBackend).subscribe({
      next: (utente: Utente) => {
        this.successo = 'Registrazione completata con successo!';
        this.errore = '';
        
        // Dopo la registrazione, effettua automaticamente il login
        setTimeout(() => {
          this.sessionService.setLoggedUser(utente);
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (err) => {
        console.log('Errore completo:', err);
        console.log('Messaggio errore:', err.error?.message);
        console.log('Status:', err.status);
        
        if (err.status === 0) {
          this.errore = 'Impossibile contattare il server. Verifica che il backend sia avviato.';
        } else if (err.error?.error) {
          this.errore = err.error.error;
        } else if (err.error?.message) {
          this.errore = err.error.message;
        } else {
          this.errore = `Errore durante la registrazione (Status: ${err.status})`;
        }
        this.successo = '';
      }
    });
  }

  // Pulisce i campi del form
  clearForm(): void {
    this.nuovoUtente = {
      nome: '',
      cognome: '',
      username: '',
      password: '',
      email: '',
      dataNascita: '',
      ruolo: 'cliente'
    };
    this.confermaPassword = '';
    this.errore = '';
    this.successo = '';
  }
}