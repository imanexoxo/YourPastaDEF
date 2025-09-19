import { Carrello } from './carrello.model';

export interface Ordine {
  id?: number; 
  utenteId?: number;
  dataOrdine?: string; // Opzionale perché viene impostata automaticamente dal backend (LocalDateTime)
  prezzoTotale?: number; // Opzionale perché viene calcolata dal backend
  // ntavolo null in caso di asporto
  // RICORDA DI GESTIRLO NEL BACKEND
  nTavolo ?: number | null; // Questo corrisponde a "ntavolo" nel backend
  ntavolo?: number | null; // Campo effettivo che arriva dal backend (minuscolo)
  delivery: boolean; // Indica se l'ordine è per consegna a domicilio
  note?: string; // Opzionale nel backend
  punti?: number; // Opzionale perché viene calcolato dal backend
  status: 'pending' | 'preparazione' | 'servito' | 'chiuso' | 'annullato'; // Stati dal backend
  // Proprietà aggiuntive per la visualizzazione
  tavolo?: {
    numero: number;
    id?: number;
  }; // Oggetto tavolo per la visualizzazione
  carrello?: Carrello; // Carrello associato all'ordine
}