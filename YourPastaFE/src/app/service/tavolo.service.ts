import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tavolo } from '../dto/tavolo.model';

@Injectable({
  providedIn: 'root'
})
export class TavoloService {
  private readonly API = 'http://localhost:8080/api/tavoli';

  constructor(private http: HttpClient) {}

  // Trova tutti i tavoli
  // Non prende nulla dal frontend, manda una richiesta GET e riceve una lista di tavoli dal backend
  trovaTuttiITavoli(): Observable<Tavolo[]> {
    return this.http.get<Tavolo[]>(this.API);
  }

  // Trova tavoli disponibili
  // Non prende nulla dal frontend, manda una richiesta GET e riceve una lista di tavoli disponibili dal backend
  trovaTavoliDisponibili(): Observable<Tavolo[]> {
    return this.http.get<Tavolo[]>(`${this.API}/disponibili`);
  }

  // Trova tavolo per ID
  // Prende l'id dal frontend, manda una richiesta GET e riceve il tavolo corrispondente dal backend
  trovaTavoloPerId(id: number): Observable<Tavolo> {
    return this.http.get<Tavolo>(`${this.API}/${id}`);
  }

  // Cambia disponibilita tavolo
  // Prende id e disponibilita dal frontend, manda una richiesta PUT e riceve la risposta dal backend
  cambiaDisponibilita(id: number, disponibile: boolean): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}/disponibilita?disponibile=${disponibile}`, {});
  }
}