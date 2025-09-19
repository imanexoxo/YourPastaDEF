import { Inventario } from './inventario.model';

export interface PiattoItem {
  id?: number; 
  ingredienteId: number;
  piattoId: number;
  quantita: number;
  prezzo: number;
  
  // Informazioni estese dell'ingrediente
  ingrediente?: Inventario;
}