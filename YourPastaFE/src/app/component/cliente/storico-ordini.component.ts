import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Models
import { Ordine } from '../../dto/ordine.model';
import { OrdineItem } from '../../dto/ordine-item.model';
import { PiattoItem } from '../../dto/piatto-item.model';
import { Inventario } from '../../dto/inventario.model';
import { Piatto } from '../../dto/piatto.model';

// Services
import { OrdineService } from '../../service/ordine.service';
import { OrdineItemService } from '../../service/ordine-item.service';
import { PiattoItemService } from '../../service/piatto-item.service';
import { InventarioService } from '../../service/inventario.service';
import { PiattoService } from '../../service/piatto.service';
import { SessionService } from '../../service/session.service';

import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-storico-ordini',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './storico-ordini.component.html',
  styleUrls: ['./storico-ordini.component.css']
})
export class StoricoOrdiniComponent implements OnInit {
  
  @Input() utenteId?: number;
  @Input() adminMode?: boolean;
  ordini: Ordine[] = [];
  
  // Modal dettagli
  ordineSelezionato: Ordine | null = null;

  // Array per gli OrdineItem di un ordine
  piattiOrdine: OrdineItem[] = []; // Piatti dell'ordine
  bevandeOrdine: OrdineItem[] = []; // Bevande nell'ordine

  // Array di array di PiattoItem per gli ingredienti
  ingredientiPiatti: PiattoItem[][] = []; // Ingredienti che compongono il piatto

  // Mappa per memorizzare i nomi dei piatti personalizzati
  piattiNomi: Map<number, string> = new Map();

  caricamentoDettagli = false;
  riordinoInCorso = false;

  constructor(
    private ordineService: OrdineService,
    private ordineItemService: OrdineItemService,
    private piattoItemService: PiattoItemService,
    private inventarioService: InventarioService,
    private piattoService: PiattoService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.caricaOrdini();
  }

  async caricaOrdini() {
    try {
      let idUtente: number | undefined = this.utenteId;
      if (!idUtente) {
        const utente = this.sessionService.getLoggedUser();
        idUtente = utente?.id;
      }
      if (idUtente) {
        this.ordini = await lastValueFrom(this.ordineService.trovaOrdiniPerUtente(idUtente));
        this.ordini.reverse(); // Ordina dal più recente al più vecchio
      }
    } catch (error) {
      console.error('Errore nel caricamento ordini:', error);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT') + ' ' + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  getStatoColor(stato: string): string {
    switch (stato) {
      case 'in_preparazione': return 'orange';
      case 'preparazione': return 'orange';
      case 'pronto': return 'green';
      case 'servito': return 'blue';
      case 'consegnato': return 'blue';
      case 'chiuso': return 'green';
      case 'annullato': return 'red';
      default: return 'gray';
    }
  }

  // DA RIVEDERE
  /*
  calcolaPrezzoTotalePiatto(): number {
    return this.piattoIngredienti.reduce((total, item) => total + (item.prezzo || 0), 0);
  }*/


  
  async visualizzaDettagli(ordine: Ordine) {
    this.ordineSelezionato = ordine;
    this.caricamentoDettagli = true;
    this.piattiOrdine = [];
    this.bevandeOrdine = [];
    this.ingredientiPiatti = [];

    try {
      if (ordine.id) {
        // Recupera gli item dell'ordine
        const items = await lastValueFrom(
          this.ordineItemService.trovaItemPerOrdine(ordine.id) 
        );
        console.log('Items ordine caricati:', items);

        for (const item of items) {
          try {
            if (item.tipoItem === 'PIATTO') {
              // I piatti sono sempre piatti personalizzati con ID > 1000
              console.log(`Caricamento piatto personalizzato ${item.itemId}`);
              
              // Carica il nome del piatto personalizzato
              try {
                const piattoDettagli: Piatto = await lastValueFrom(
                  this.piattoService.getPiattoPerId(item.itemId)
                );
                this.piattiNomi.set(item.itemId, piattoDettagli.nome);
                console.log(`Nome piatto ${item.itemId}: ${piattoDettagli.nome}`);
              } catch (error) {
                console.error(`Errore nel caricamento nome piatto ${item.itemId}:`, error);
                this.piattiNomi.set(item.itemId, `Piatto Personalizzato #${item.itemId}`);
              }
              
              // Carica gli ingredienti del piatto personalizzato
              const piattoItems = await lastValueFrom(
                this.piattoItemService.getPerPiattoId(item.itemId)
              );
              
              // Per ogni ingrediente, carica i dettagli dall'inventario
              for (const piattoItem of piattoItems) {
                try {
                  const ingredienteDettagli = await lastValueFrom(
                    this.inventarioService.trovaArticoloPerId(piattoItem.ingredienteId)
                  );
                  piattoItem.ingrediente = ingredienteDettagli;
                } catch (error) {
                  console.error(`Errore nel caricamento ingrediente ${piattoItem.ingredienteId}:`, error);
                }
              }
              
              this.ingredientiPiatti[item.itemId] = piattoItems;
              console.log(`Ingredienti per il piatto personalizzato ${item.itemId}:`, this.ingredientiPiatti[item.itemId]);
              
              this.piattiOrdine.push(item);
              
            } else if (item.tipoItem === 'BEVANDA') {
              // Le bevande sono ingredienti dell'inventario con categoria "bevande"
              console.log(`Caricamento bevanda ${item.itemId}`);
              try {
                const bevandaDettagli = await lastValueFrom(
                  this.inventarioService.trovaArticoloPerId(item.itemId)
                );
                item.piatto = bevandaDettagli; // Nota: usiamo 'piatto' per consistenza, ma è una bevanda
              } catch (error) {
                console.error(`Errore nel caricamento bevanda ${item.itemId}:`, error);
              }
              
              this.bevandeOrdine.push(item);
            }
          } catch (error) {
            console.error(`Errore nel recupero degli ingredienti dell'item ${item.itemId}:`, error);
            // Aggiungi comunque l'item anche se c'è un errore
            if (item.tipoItem === 'PIATTO') {
              this.piattiOrdine.push(item);
            } else if (item.tipoItem === 'BEVANDA') {
              this.bevandeOrdine.push(item);
            }
          }
        }
        console.log('Piatti:', this.piattiOrdine);
        console.log('Bevande:', this.bevandeOrdine);
      }
    } catch (error) {
      console.error('Errore nel caricamento dettagli ordine:', error);
      this.snackBar.open('Errore nel caricamento dei dettagli', 'Chiudi', { duration: 3000 });
    } finally {
      this.caricamentoDettagli = false;
    }
  }

  // la chiamo per ogni piatto nell'html
  getIngredientiPiatto(piattoId: number): PiattoItem[] {
    return this.ingredientiPiatti[piattoId] || [];
  }

  // Metodo per ottenere il nome del piatto personalizzato
  getNomePiatto(piattoId: number): string {
    return this.piattiNomi.get(piattoId) || `Piatto Personalizzato #${piattoId}`;
  }




  chiudiDettagli() {
    this.ordineSelezionato = null;
    this.piattiOrdine = [];
    this.ingredientiPiatti = [];
    this.bevandeOrdine = [];
    this.piattiNomi.clear(); // Pulisce la mappa dei nomi dei piatti
    this.caricamentoDettagli = false;
  }

  
  // funzione per riordinare un piatto appartenente all'ordine selezionato
  async riordinaPiatto(piatto: OrdineItem) {
    if (this.riordinoInCorso) return;

    this.riordinoInCorso = true;

    // DA IMPLEMENTARE
    // Generiamo un nuovo carrelloItem uguale all'OrdineItem passato
  
  }
  // Metodo per ottenere la stringa corretta per tavolo/asporto/delivery
  getTavoloOAsporto(ordine: Ordine): string {
    if (ordine.delivery) {
      return 'Consegna a domicilio';
    }
    
    // Il backend invia il campo come 'ntavolo' (minuscolo)
    const numeroTavolo = ordine.ntavolo || ordine.tavolo?.numero || ordine.nTavolo;
    if (numeroTavolo) {
      return `Tavolo ${numeroTavolo}`;
    }
    
    // Se non ha numero tavolo ed è delivery false, è asporto
    return 'Asporto';
  }

  
}
