import { Injectable } from '@angular/core';
// BehaviorSubject classe di RxJS usata per notificare i cambiamenti di stato in modo reattivo
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { Utente } from '../dto/utente.model';
import { UtenteService } from './utente.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  
  // BehaviorSubject per notificare cambiamenti utente
  private utenteLoggatoSubject = new BehaviorSubject<Utente | null>(null);
  public utenteLoggato$ = this.utenteLoggatoSubject.asObservable();

  constructor(private utenteService: UtenteService) {
    // Carica utente dal localStorage all'avvio
    this.caricaUtenteLoggato();
  }

  // Carica utente dal localStorage
  private caricaUtenteLoggato(): void {
    const raw = localStorage.getItem('utente');
    const utente = raw ? JSON.parse(raw) as Utente : null;
    this.utenteLoggatoSubject.next(utente);
  }

  // Restituisce l'utente loggato salvato in localStorage
  getLoggedUser(): Utente | null {
    return this.utenteLoggatoSubject.value;
  }

  // Salva l'utente loggato in localStorage dopo il login
  setLoggedUser(user: Utente): void {
    localStorage.setItem('utente', JSON.stringify(user));
    this.utenteLoggatoSubject.next(user);  // notifica i componenti se e cambiato
  }

  // Rimuove l'utente salvato in localStorage dopo il logout
  clearLoggedUser(): void {
    localStorage.removeItem('utente'); // pulisce storage
    this.utenteLoggatoSubject.next(null);  // pulisce il BehaviorSubject
    console.log('Logout effettuato, utente rimosso'); 
  }

  // Aggiorna i punti dell'utente corrente chiamando il backend
  async aggiornaPuntiUtente(): Promise<void> {
    const utenteCorrente = this.getLoggedUser();
    if (utenteCorrente && utenteCorrente.id) {
      try {
        const utenteAggiornato = await lastValueFrom(this.utenteService.trovaUtentePerId(utenteCorrente.id));
        if (utenteAggiornato) {
          // Aggiorna solo i punti mantenendo le altre informazioni
          const utenteConPuntiAggiornati = { ...utenteCorrente, punti: utenteAggiornato.punti };
          this.setLoggedUser(utenteConPuntiAggiornati);
          console.log('Punti aggiornati nel SessionService:', utenteAggiornato.punti);
        }
      } catch (error) {
        console.error('Errore nell\'aggiornamento punti utente:', error);
      }
    }
  }
}