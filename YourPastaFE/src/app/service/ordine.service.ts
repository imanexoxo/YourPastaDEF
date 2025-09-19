import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ordine} from '../dto/ordine.model';

@Injectable({
  providedIn: 'root'
})
export class OrdineService {
  private readonly API = 'http://localhost:8080/api/ordini';

  constructor(private http: HttpClient) {}

  // Trova tutti gli ordini
  // Non prende nulla dal frontend, manda una richiesta GET e riceve una lista di ordini dal backend
  trovaTuttiGliOrdini(): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(this.API);
  }

  // Trova ordine per ID
  // Prende l'id dal frontend, manda una richiesta GET e riceve l'ordine corrispondente dal backend
  trovaOrdinePerId(id: number): Observable<Ordine> {
    return this.http.get<Ordine>(`${this.API}/${id}`);
  }

  // Trova ordini per utente
  // Prende l'id utente dal frontend, manda una richiesta GET e riceve una lista di ordini dal backend
  trovaOrdiniPerUtente(utenteId: number): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(`${this.API}/utente/${utenteId}`);
  }

  // Trova ordini per tavolo
  // Prende il numero tavolo dal frontend, manda una richiesta GET e riceve una lista di ordini dal backend
  trovaOrdiniPerTavolo(nTavolo: number): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(`${this.API}/tavolo/${nTavolo}`);
  }

  // Trova ordini per status
  // Prende lo status dal frontend, manda una richiesta GET e riceve una lista di ordini dal backend
  trovaOrdiniPerStatus(status: string): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(`${this.API}/status/${status}`);
  }

  // Crea ordine
  // Prende un oggetto ordine dal frontend, manda una richiesta POST e riceve la risposta dal backend
  creaOrdine(ordine: any): Observable<Ordine> {
  // Assicura che delivery sia sempre presente e booleano
  const body = { ...ordine, delivery: !!ordine.delivery };
  delete body.isDelivery;
  return this.http.post<Ordine>(this.API, body);
  }

  // Aggiorna stato ordine
  // Prende id e nuovo stato dal frontend, manda una richiesta PUT e riceve la risposta dal backend
  aggiornaStatoOrdine(id: number, stato: string): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}/stato`, { stato });
  }
  
    // Ricalcola il prezzo e i punti dell'ordine dopo aver inserito tutti gli ordine-item
    ricalcolaPrezzoOrdine(id: number): Observable<Ordine> {
      return this.http.put<Ordine>(`${this.API}/${id}/ricalcola-prezzo`, {});
    }
}