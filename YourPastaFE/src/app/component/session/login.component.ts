import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { UtenteService } from '../../service/utente.service';
import { SessionService } from '../../service/session.service';
import { Utente, LoginRequest } from '../../dto/utente.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  // Dati del form
  datiAccesso: LoginRequest = { username: '', password: '' };

  // Messaggio di errore
  errore: string = '';

  constructor(
    private utenteService: UtenteService,
    private sessionService: SessionService,
    private router: Router
  ) {}

 // Effettua il login
  login(): void {
    this.utenteService.login(this.datiAccesso).subscribe({
      next: (utente: Utente) => {
        // Salva utente nella sessione
        this.sessionService.setLoggedUser(utente);
        // Vai alla home
        this.router.navigate(['/home']);
      },
      error: (err) => {
        // Mostra errore
        this.errore = err.error?.errore || 'Username o password errati';
      }
    });
  }

  // Pulisce i campi del form
  clearForm(): void {
    this.datiAccesso.username = '';
    this.datiAccesso.password = '';
    this.errore = '';
  }

}
