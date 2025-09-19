import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

export interface Notifica {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titolo: string;
  messaggio: string;
  timestamp: Date;
  azione?: {
    testo: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private notifiche$ = new BehaviorSubject<Notifica[]>([]);
  private contatore = 0;

  constructor(private snackBar: MatSnackBar) {}

  getNotifiche() {
    return this.notifiche$.asObservable();
  }

  private aggiungiNotifica(notifica: Omit<Notifica, 'id' | 'timestamp'>) {
    const nuovaNotifica: Notifica = {
      ...notifica,
      id: (++this.contatore).toString(),
      timestamp: new Date()
    };

    const notificheAttuali = this.notifiche$.value;
    this.notifiche$.next([nuovaNotifica, ...notificheAttuali]);

    // Rimuovi notifica dopo 10 secondi se non è critica
    if (notifica.tipo !== 'error') {
      setTimeout(() => {
        this.rimuoviNotifica(nuovaNotifica.id);
      }, 10000);
    }

    return nuovaNotifica.id;
  }

  rimuoviNotifica(id: string) {
    const notificheAttuali = this.notifiche$.value;
    this.notifiche$.next(notificheAttuali.filter(n => n.id !== id));
  }

  pulisciTutte() {
    this.notifiche$.next([]);
  }

  // Metodi per mostrare diversi tipi di notifiche
  success(titolo: string, messaggio: string, azione?: { testo: string; callback: () => void }) {
    this.mostraSnackBar(titolo, 'success');
    return this.aggiungiNotifica({
      tipo: 'success',
      titolo,
      messaggio,
      azione
    });
  }

  error(titolo: string, messaggio: string, azione?: { testo: string; callback: () => void }) {
    this.mostraSnackBar(titolo, 'error');
    return this.aggiungiNotifica({
      tipo: 'error',
      titolo,
      messaggio,
      azione
    });
  }

  warning(titolo: string, messaggio: string, azione?: { testo: string; callback: () => void }) {
    this.mostraSnackBar(titolo, 'warning');
    return this.aggiungiNotifica({
      tipo: 'warning',
      titolo,
      messaggio,
      azione
    });
  }

  info(titolo: string, messaggio: string, azione?: { testo: string; callback: () => void }) {
    this.mostraSnackBar(titolo, 'info');
    return this.aggiungiNotifica({
      tipo: 'info',
      titolo,
      messaggio,
      azione
    });
  }

  private mostraSnackBar(messaggio: string, tipo: string) {
    const config: MatSnackBarConfig = {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`snackbar-${tipo}`]
    };

    this.snackBar.open(messaggio, 'Chiudi', config);
  }

  // Metodi di utilità per casi comuni
  ordineCreato(numeroOrdine: number) {
    this.success(
      'Ordine Creato',
      `Il tuo ordine #${numeroOrdine} è stato creato con successo!`
    );
  }

  ordineAggiornato(numeroOrdine: number) {
    this.info(
      'Ordine Aggiornato',
      `Lo stato dell'ordine #${numeroOrdine} è cambiato`
    );
  }

  erroreConnessione() {
    this.error(
      'Errore di Connessione',
      'Impossibile contattare il server. Riprova più tardi.',
      {
        testo: 'Riprova',
        callback: () => window.location.reload()
      }
    );
  }

  sessioneScaduta() {
    this.warning(
      'Sessione Scaduta',
      'La tua sessione è scaduta. Effettua nuovamente il login.',
      {
        testo: 'Login',
        callback: () => window.location.href = '/login'
      }
    );
  }
}
