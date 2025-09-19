import { Inventario } from './inventario.model';

export interface OrdineItem {
  id?: number; 
  ordineId: number;
  itemId: number;
  quantita: number;
  prezzo?: number; 
  piatto?: Inventario; // Dati del piatto per la visualizzazione
  tipoItem?: 'PIATTO' | 'BEVANDA'; // Nuovo campo per distinguere piatti e bevande
}

export enum TipoItem {
  PIATTO = 'PIATTO',
  BEVANDA = 'BEVANDA'
}