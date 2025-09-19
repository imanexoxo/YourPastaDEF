import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CarrelloItem, Carrello } from '../dto/carrello.model';
import { Piatto } from '../dto/piatto.model';
import { Inventario } from '../dto/inventario.model';
import { SessionService } from './session.service';

/**
 * SERVIZIO CARRELLO - Gestisce il carrello utente con piatti personalizzati e bevande
 * 
 * FUNZIONALITÀ:
 * - Aggiunta piatti personalizzati al carrello
 * - Aggiunta bevande al carrello
 * - Modifica quantità item
 * - Calcolo prezzi con sconto studente automatico
 * - Persistenza locale del carrello
 * - Gestione preferiti
 */
@Injectable({
  providedIn: 'root'
})
export class CarrelloService {
  private readonly SCONTO_STUDENTE_PERCENTUALE = 20;
  private readonly STORAGE_KEY = 'yourpasta_carrello';
  
  private carrelloSubject = new BehaviorSubject<Carrello>(this.getCarrelloVuoto());
  public carrello$ = this.carrelloSubject.asObservable();

  constructor(private sessionService: SessionService) {
    this.caricaCarrelloDaStorage();
  }

  /**
   * AGGIUNGE PIATTO PERSONALIZZATO AL CARRELLO
   */
  aggiungiPiatto(piatto: Piatto, quantita: number = 1): void {
    const carrello = this.carrelloSubject.value;
    
    // Cerca se esiste già un piatto identico nel carrello
    const esistente = carrello.items.find(item => 
      item.tipo === 'piatto' && 
      item.piatto?.id === piatto.id
    );
    
    if (esistente) {
      esistente.quantita += quantita;
      esistente.prezzoTotale = esistente.prezzoUnitario * esistente.quantita;
    } else {
      const nuovoItem: CarrelloItem = {
        tipo: 'piatto',
        quantita: quantita,
        prezzoUnitario: piatto.prezzo,
        prezzoTotale: piatto.prezzo * quantita,
        piatto: piatto,
        dataAggiunta: new Date()
      };
      carrello.items.push(nuovoItem);
    }
    
    this.aggiornaCarrello(carrello);
  }

  /**
   * AGGIUNGE BEVANDA AL CARRELLO
   */
  aggiungiBevanda(bevanda: Inventario, quantita: number = 1): void {
    const carrello = this.carrelloSubject.value;
    
    // Cerca se esiste già la stessa bevanda nel carrello
    const esistente = carrello.items.find(item => 
      item.tipo === 'bevanda' && 
      item.bevanda?.id === bevanda.id
    );
    
    if (esistente) {
      // Verifica stock disponibile
      const nuovaQuantita = esistente.quantita + quantita;
      if (nuovaQuantita <= bevanda.quantita) {
        esistente.quantita = nuovaQuantita;
        esistente.prezzoTotale = esistente.prezzoUnitario * esistente.quantita;
      } else {
        throw new Error(`Stock insufficiente per ${bevanda.nome}. Disponibili: ${bevanda.quantita}`);
      }
    } else {
      if (quantita <= bevanda.quantita) {
        const nuovoItem: CarrelloItem = {
          tipo: 'bevanda',
          quantita: quantita,
          prezzoUnitario: bevanda.prezzoUnitario,
          prezzoTotale: bevanda.prezzoUnitario * quantita,
          bevanda: bevanda,
          dataAggiunta: new Date()
        };
        carrello.items.push(nuovoItem);
      } else {
        throw new Error(`Stock insufficiente per ${bevanda.nome}. Disponibili: ${bevanda.quantita}`);
      }
    }
    
    this.aggiornaCarrello(carrello);
  }

  /**
   * MODIFICA QUANTITÀ ITEM NEL CARRELLO
   */
  modificaQuantita(itemIndex: number, nuovaQuantita: number): void {
    const carrello = this.carrelloSubject.value;
    
    if (itemIndex >= 0 && itemIndex < carrello.items.length) {
      const item = carrello.items[itemIndex];
      
      if (nuovaQuantita <= 0) {
        // Rimuovi item se quantità è 0 o negativa
        carrello.items.splice(itemIndex, 1);
      } else {
        // Verifica stock per bevande
        if (item.tipo === 'bevanda' && item.bevanda) {
          if (nuovaQuantita > item.bevanda.quantita) {
            throw new Error(`Stock insufficiente per ${item.bevanda.nome}. Disponibili: ${item.bevanda.quantita}`);
          }
        }
        
        item.quantita = nuovaQuantita;
        item.prezzoTotale = item.prezzoUnitario * nuovaQuantita;
      }
      
      this.aggiornaCarrello(carrello);
    }
  }

  /**
   * RIMUOVE ITEM DAL CARRELLO
   */
  rimuoviItem(itemIndex: number): void {
    const carrello = this.carrelloSubject.value;
    
    if (itemIndex >= 0 && itemIndex < carrello.items.length) {
      carrello.items.splice(itemIndex, 1);
      this.aggiornaCarrello(carrello);
    }
  }

  /**
   * SVUOTA COMPLETAMENTE IL CARRELLO
   */
  svuotaCarrello(): void {
    this.aggiornaCarrello(this.getCarrelloVuoto());
  }

  /**
   * MARCA/SMARCA PIATTO COME PREFERITO
   */
  togglePreferito(itemIndex: number): void {
    const carrello = this.carrelloSubject.value;
    
    if (itemIndex >= 0 && itemIndex < carrello.items.length) {
      const item = carrello.items[itemIndex];
      if (item.tipo === 'piatto' && item.piatto) {
        item.piatto.isFavorito = !item.piatto.isFavorito;
        this.aggiornaCarrello(carrello);
      }
    }
  }

  /**
   * OTTIENE IL CARRELLO CORRENTE
   */
  getCarrello(): Carrello {
    return this.carrelloSubject.value;
  }

  /**
   * VERIFICA SE IL CARRELLO È VUOTO
   */
  isCarrelloVuoto(): boolean {
    return this.carrelloSubject.value.items.length === 0;
  }

  /**
   * OTTIENE NUMERO TOTALE ITEM NEL CARRELLO
   */
  getNumeroTotaleItem(): number {
    return this.carrelloSubject.value.numeroTotaleItem;
  }

  /**
   * AGGIORNA CARRELLO E RICALCOLA TOTALI
   */
  private aggiornaCarrello(carrello: Carrello): void {
    // Calcola prezzo totale originale (senza applicare sconti)
    carrello.prezzoTotaleOriginale = carrello.items.reduce(
      (total, item) => total + item.prezzoTotale, 0
    );
    
    // NON applicare sconti qui - verranno applicati solo nel checkout finale
    carrello.scontoApplicato = 0;
    carrello.prezzoTotaleFinale = carrello.prezzoTotaleOriginale;
    
    // Calcola numero totale item
    carrello.numeroTotaleItem = carrello.items.reduce(
      (total, item) => total + item.quantita, 0
    );
    
    // Aggiorna BehaviorSubject
    this.carrelloSubject.next(carrello);
    
    // Salva nel localStorage
    this.salvaCarrelloInStorage(carrello);
  }

  /**
   * CALCOLA PREZZO SCONTATO PER VISUALIZZAZIONE (senza modificare il carrello)
   */
  calcolaPrezzoScontatoPerVisualizzazione(): { prezzoOriginale: number, prezzoScontato: number, sconto: number } {
    const carrello = this.carrelloSubject.value;
    const prezzoOriginale = carrello.prezzoTotaleOriginale;
    
    const utente = this.sessionService.getLoggedUser();
    const isStudente = utente?.ruolo === 'studente';
    
    if (isStudente) {
      const sconto = prezzoOriginale * this.SCONTO_STUDENTE_PERCENTUALE / 100;
      const prezzoScontato = prezzoOriginale - sconto;
      return { prezzoOriginale, prezzoScontato, sconto };
    }
    
    return { prezzoOriginale, prezzoScontato: prezzoOriginale, sconto: 0 };
  }

  /**
   * CREA CARRELLO VUOTO
   */
  private getCarrelloVuoto(): Carrello {
    return {
      items: [],
      prezzoTotaleOriginale: 0,
      scontoApplicato: 0,
      prezzoTotaleFinale: 0,
      numeroTotaleItem: 0
    };
  }

  /**
   * SALVA CARRELLO NEL LOCAL STORAGE
   */
  private salvaCarrelloInStorage(carrello: Carrello): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(carrello));
    } catch (error) {
      console.warn('Impossibile salvare carrello nel localStorage:', error);
    }
  }

  /**
   * CARICA CARRELLO DAL LOCAL STORAGE
   */
  private caricaCarrelloDaStorage(): void {
    try {
      const carrelloSalvato = localStorage.getItem(this.STORAGE_KEY);
      if (carrelloSalvato) {
        const carrello: Carrello = JSON.parse(carrelloSalvato);
        // Riconverti le date
        carrello.items.forEach(item => {
          if (item.dataAggiunta) {
            item.dataAggiunta = new Date(item.dataAggiunta);
          }
        });
        this.carrelloSubject.next(carrello);
      }
    } catch (error) {
      console.warn('Impossibile caricare carrello dal localStorage:', error);
      this.carrelloSubject.next(this.getCarrelloVuoto());
    }
  }
}