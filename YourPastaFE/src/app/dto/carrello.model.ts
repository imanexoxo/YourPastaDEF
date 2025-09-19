import { Piatto } from './piatto.model';
import { Inventario } from './inventario.model';

/**
 * CARRELLO ITEM - Rappresenta un elemento nel carrello utente
 * Può essere:
 * - Un piatto personalizzato (con i suoi ingredienti)
 * - Una bevanda dall'inventario
 */
export interface CarrelloItem {
    id?: number;
    tipo: 'piatto' | 'bevanda';
    quantita: number;
    prezzoUnitario: number;
    prezzoTotale: number;
    
    // Per piatti personalizzati
    piatto?: Piatto;
    
    // Per bevande
    bevanda?: Inventario;
    
    // Metadati
    dataAggiunta?: Date;
    note?: string;
}

/**
 * CARRELLO - Raccolta di tutti gli item dell'utente
 */
export interface Carrello {
    items: CarrelloItem[];
    prezzoTotaleOriginale: number;
    scontoApplicato: number;
    prezzoTotaleFinale: number;
    numeroTotaleItem: number;
}
