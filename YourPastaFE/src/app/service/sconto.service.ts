import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InfoSconto {
  prezzoOriginale: number;
  prezzoFinale: number;
  importoSconto: number;
  haSconto: boolean;
  ruoloUtente: string;
  percentualeSconto?: number;
  tipoSconto?: string;
}

export interface InfoScontiGenerali {
  scontoStudentePercentuale: number;
  ruoliConSconto: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ScontoService {
  private readonly API = 'http://localhost:8080/api/sconti';

  constructor(private http: HttpClient) {}

  /**
   * Calcola il prezzo finale con eventuale sconto per un utente
   */
  calcolaScontoPerUtente(utenteId: number, prezzoOriginale: number): Observable<InfoSconto> {
    return this.http.get<InfoSconto>(`${this.API}/calcola/${utenteId}?prezzoOriginale=${prezzoOriginale}`);
  }

  /**
   * Ottiene informazioni generali sui tipi di sconto disponibili
   */
  getInfoSconti(): Observable<InfoScontiGenerali> {
    return this.http.get<InfoScontiGenerali>(`${this.API}/info`);
  }

  /**
   * Verifica se un ruolo ha diritto allo sconto
   */
  ruoloHaSconto(ruolo: string): boolean {
    return ruolo === 'studente';
  }

  /**
   * Ottiene il badge descrittivo per il tipo di sconto
   */
  getBadgeSconto(ruolo: string): string {
    switch (ruolo) {
      case 'studente':
        return 'SCONTO STUDENTE';
      default:
        return '';
    }
  }

  /**
   * Calcola lo sconto locale per preview (senza chiamata backend)
   * Utile per calcoli rapidi nell'interfaccia
   */
  calcolaScontoLocale(prezzoOriginale: number, ruolo: string, percentualeSconto: number = 10): number {
    if (ruolo === 'studente') {
      return prezzoOriginale * (percentualeSconto / 100);
    }
    return 0;
  }

  /**
   * Calcola il prezzo finale locale per preview
   */
  calcolaPrezzoFinaleLocale(prezzoOriginale: number, ruolo: string, percentualeSconto: number = 10): number {
    const sconto = this.calcolaScontoLocale(prezzoOriginale, ruolo, percentualeSconto);
    return prezzoOriginale - sconto;
  }
}
