import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PiattoItem } from '../dto/piatto-item.model';

@Injectable({
  providedIn: 'root'
})
export class PiattoItemService {
  private readonly API = 'http://localhost:8080/api/piatto-item';

  constructor(private http: HttpClient) {}

  // Crea piatto item
  // Prende un oggetto item dal frontend, manda una richiesta POST e riceve l'oggetto creato dal backend
  creaPiattoItem(item: any): Observable<PiattoItem> {
    return this.http.post<PiattoItem>(`${this.API}/nuovo`, item);
  }

  // Trova item per piatto
  // Prende l'id piatto dal frontend, manda una richiesta GET e riceve una lista di item dal backend
  getPerPiattoId(piattoId: number): Observable<PiattoItem[]> {
    return this.http.get<PiattoItem[]>(`${this.API}/per-piatto/${piattoId}`);
  }
}