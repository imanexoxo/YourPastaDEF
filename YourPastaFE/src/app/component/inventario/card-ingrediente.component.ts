import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { Inventario } from '../../dto/inventario.model';
import { ImageService } from '../../service/image.service';

/**
 * COMPONENTE CARD INGREDIENTE - Visualizzazione singolo prodotto con gestione immagini ottimizzata
 * 
 * FUNZIONAMENTO:
 * - Mostra immagine, nome, categoria, prezzo, quantità disponibile
 * - Integrato con ImageService per immagini ottimizzate
 * - Gestione errori immagini con fallback robusto
 * - Supporta modalità diverse: compatta, clickable, con azioni admin
 * 
 * FIX IMPLEMENTATI:
 * - Risolto problema placeholder.jpg → 404 errors
 * - Migliorata gestione fallback immagini
 * - Integrazione con sistema immagini ottimizzate
 */

@Component({
  selector: 'app-card-ingrediente',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './card-ingrediente.component.html',
  styleUrls: ['./card-ingrediente.component.css']
})
export class CardIngredienteComponent {
  @Input() ingrediente!: Inventario;
  @Input() clickable: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showAddToCart: boolean = false;
  @Input() compactView: boolean = false;

  @Output() cardClick = new EventEmitter<Inventario>();
  @Output() dettagliClick = new EventEmitter<Inventario>();
  @Output() aggiungiCarrello = new EventEmitter<Inventario>();

  constructor(private imageService: ImageService) {}

  getImageUrl(): string {
    return this.imageService.getImageById(this.ingrediente.id);
  }

  getImageAlt(): string {
    return this.imageService.getImageAlt(this.ingrediente.nome);
  }

  onCardClick() {
    if (this.clickable) {
      this.cardClick.emit(this.ingrediente);
    }
  }

  onDettagliClick(event: Event) {
    event.stopPropagation();
    this.dettagliClick.emit(this.ingrediente);
  }

  onAggiungiCarrelloClick(event: Event) {
    event.stopPropagation();
    this.aggiungiCarrello.emit(this.ingrediente);
  }

  isDisponibile(): boolean {
    return this.ingrediente.quantita > 0;
  }

  getPrezzoFormattato(): string {
    return this.ingrediente.prezzoUnitario?.toFixed(2) || '0.00';
  }

  getCategoriaIcon(): string {
    const iconMap: { [key: string]: string } = {
      'pasta': 'restaurant',
      'condimento_pronto': 'local_dining',
      'proteine': 'set_meal',
      'ingrediente_base': 'eco',
      'topping': 'add_circle',
      'bevande': 'local_bar'
    };
    
    return iconMap[this.ingrediente.categoria] || 'restaurant_menu';
  }

  getCategoriaDisplayName(): string {
    const nameMap: { [key: string]: string } = {
      'pasta': 'Pasta',
      'condimento_pronto': 'Condimenti',
      'condimento_base': 'Condimenti',
      'proteine': 'Proteine',
      'ingrediente_base': 'Verdure e Formaggi',
      'topping': 'Topping',
      'bevande': 'Bevande'
    };
    
    return nameMap[this.ingrediente.categoria] || this.ingrediente.categoria;
  }

  /**
   * GESTIONE ERRORI IMMAGINI - FALLBACK SISTEMA RIPARATO
   * 
   * PROBLEMA RISOLTO: 
   * - Prima utilizzava 'placeholder.jpg' che non esisteva → 404 errors
   * - Causava loop infiniti di errori nella console
   * 
   * SOLUZIONE ATTUALE:
   * - Fallback sull'immagine di default locale
   * - Previene cascata di errori 404
   * - Garantisce che l'utente veda sempre un'immagine
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      // Usa l'immagine di default locale invece del placeholder di Pixabay
      target.src = this.imageService.getDefaultImage();
    }
  }
}