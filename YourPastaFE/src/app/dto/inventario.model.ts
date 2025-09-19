export interface Inventario {
  id?: number; // Opzionale perché viene generato dal backend quando crei un nuovo articolo
  nome: string;
  categoria: 'pasta' | 'condimento_pronto' | 'condimento_base' | 'proteine' | 'ingrediente_base' | 'topping' | 'bevande'; 
  quantita: number;
  prezzoUnitario: number;
}