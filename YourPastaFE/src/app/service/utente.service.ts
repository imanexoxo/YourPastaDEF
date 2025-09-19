import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utente } from '../dto/utente.model';
import { LoginRequest } from '../dto/utente.model';

// questa classe puo essere iniettata in altri componenti o servizi
@Injectable({
  providedIn: 'root' // dice ad Angular di fornire questa classe come singleton, root a livello di applicazione globale
  // modo nuovo di angular, vecchio modo da evita providers:[UtenteService]
})
export class UtenteService {
  private readonly API = 'http://localhost:8080/api/utenti';

  constructor(private http: HttpClient) {}

  // Login utente
  // Prende username e password dal frontend, manda una richiesta POST e riceve i dati utente dal backend
  login(credentials: LoginRequest): Observable<Utente> {
    return this.http.post<Utente>(`${this.API}/login`, credentials);
  }

  // Crea nuovo utente
  // Prende un oggetto utente dal frontend, manda una richiesta POST e riceve l'utente creato dal backend
  creaUtente(utente: Utente): Observable<Utente> {
    return this.http.post<Utente>(this.API, utente);
  }

  // Trova utente per ID
  // Prende l'id dal frontend, manda una richiesta GET e riceve l'utente corrispondente dal backend
  trovaUtentePerId(id: number): Observable<Utente> {
    return this.http.get<Utente>(`${this.API}/${id}`);
  }

  // Trova tutti gli utenti
  // Non prende nulla dal frontend, manda una richiesta GET e riceve una lista di utenti dal backend
  trovaTuttiGliUtenti(): Observable<Utente[]> {
    return this.http.get<Utente[]>(this.API);
  }

  // Aggiorna punti utente
  // Prende id e punti dal frontend, manda una richiesta PUT e riceve l'utente aggiornato dal backend
  aggiornaPunti(id: number, punti: number): Observable<Utente> {
    return this.http.put<Utente>(`${this.API}/${id}/punti`, { punti });
  }

  // Elimina utente
  // Prende l'id dal frontend, manda una richiesta DELETE e riceve conferma di eliminazione dal backend
  eliminaUtente(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }

  // Blocca/Sblocca utente
  // Prende id e stato dal frontend, manda una richiesta PUT e riceve l'utente aggiornato dal backend
  cambiaStatoUtente(id: number, bloccato: boolean): Observable<Utente> {
    return this.http.put<Utente>(`${this.API}/${id}/stato`, { bloccato });
  }

  // Aggiorna dati utente
  // Prende id e dati dal frontend, manda una richiesta PUT e riceve l'utente aggiornato dal backend
  aggiornaUtente(id: number, dati: Partial<Utente>): Observable<Utente> {
    return this.http.put<Utente>(`${this.API}/${id}`, dati);
  }
}