import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrdineItem } from '../dto/ordine-item.model';

@Injectable({
  providedIn: 'root'
})
export class OrdineItemService {
  private readonly API = 'http://localhost:8080/api/ordine-item';

  constructor(private http: HttpClient) {}

  // Trova item per ordine
  // Prende l'id ordine dal frontend, manda una richiesta GET e riceve una lista di item dal backend
  trovaItemPerOrdine(ordineId: number): Observable<OrdineItem[]> {
    return this.http.get<OrdineItem[]>(`${this.API}/ordine/${ordineId}`);
  }

  // Crea nuovo ordine item
  // Prende un oggetto item dal frontend, manda una richiesta POST e riceve l'oggetto creato dal backend
  creaOrdineItem(item: any): Observable<OrdineItem> {
    return this.http.post<OrdineItem>(`${this.API}/nuovo`, item);
  }
}