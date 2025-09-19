import { PiattoItem } from './piatto-item.model';

export interface Piatto {
  id?: number; 
  nome: string;
  prezzo: number; 
  utenteId?: number;
  descrizione?: string;
  dataCreazione?: Date;
  isFavorito?: boolean;
  numeroRiordini?: number;
  
  // Lista degli ingredienti che compongono il piatto
  ingredienti?: PiattoItem[];
}