import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from '../dto/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private readonly API = 'http://localhost:8080/api/inventario';

  constructor(private http: HttpClient) {}

  // Crea nuovo articolo
  // Prende un oggetto articolo dal frontend, manda una richiesta POST e riceve l'articolo creato dal backend
  creaArticolo(articolo: Inventario): Observable<Inventario> {
    return this.http.post<Inventario>(this.API, articolo);
  }

  // Trova tutti gli articoli
  // Non prende nulla dal frontend, manda una richiesta GET e riceve una lista di articoli dal backend
  trovaTuttiGliArticoli(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(this.API);
  }

  // Trova articolo per ID
  // Prende l'id dal frontend, manda una richiesta GET e riceve l'articolo corrispondente dal backend
  trovaArticoloPerId(id: number): Observable<Inventario> {
    return this.http.get<Inventario>(`${this.API}/${id}`);
  }

  // Trova articoli per categoria
  // Prende la categoria dal frontend, manda una richiesta GET e riceve una lista di articoli filtrati dal backend
  trovaArticoliPerCategoria(categoria: string): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.API}/categoria/${categoria}`);
  }

  // Cerca articoli per nome
  // Prende il nome dal frontend, manda una richiesta GET con query param e riceve una lista di articoli dal backend
  cercaArticoliPerNome(nome: string): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.API}/cerca?nome=${nome}`);
  }

  // Aggiorna quantità articolo
  // Prende id e quantità dal frontend, manda una richiesta PUT e riceve l'articolo aggiornato dal backend
  aggiornaQuantita(id: number, quantita: number): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.API}/${id}/quantita`, { quantita });
  }

  // Aggiorna prezzo articolo
  // Prende id e prezzo dal frontend, manda una richiesta PUT e riceve l'articolo aggiornato dal backend
  aggiornaPrezzo(id: number, prezzo: number): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.API}/${id}/prezzo`, { prezzo });
  }

  // Aggiorna inventario completo
  // Prende id e oggetto inventario dal frontend, manda una richiesta PUT e riceve l'inventario aggiornato dal backend
  aggiornaInventario(id: number, inventario: Inventario): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.API}/${id}`, inventario);
  }

  // Elimina articolo
  // Prende l'id dal frontend, manda una richiesta DELETE e riceve conferma di eliminazione dal backend
  eliminaArticolo(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }
}