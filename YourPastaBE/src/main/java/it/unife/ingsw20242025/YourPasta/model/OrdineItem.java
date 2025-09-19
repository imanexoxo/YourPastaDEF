package it.unife.ingsw20242025.YourPasta.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * MODELLO ORDINE ITEM - Rappresenta un singolo elemento all'interno di un ordine
 * 
 * PROBLEMA ARCHITETTURALE RISOLTO:
 * - itemId poteva riferirsi sia a piatti personalizzati che a bevande dall'inventario
 * - Senza distinzione era impossibile sapere in quale tabella cercare l'item
 * 
 * SOLUZIONE IMPLEMENTATA:
 * - Campo tipoItem distingue tra PIATTO (tabella piatto) e BEVANDA (tabella inventario)
 * - Enum TipoItem con valori PIATTO/BEVANDA
 * - Default su PIATTO per compatibilità con dati esistenti
 * - Classificazione automatica gestita dal service layer
 * 
 * GESTIONE PREZZI:
 * - Campo prezzo contiene il totale per questo item (prezzoUnitario * quantità)
 * - Tutti i prezzi unitari sono centralizzati nella tabella inventario
 */

@Entity
@Table(name = "ordine_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdineItem {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "ordine_id", nullable = false)
    private Integer ordineId;

    @Column(name = "item_id", nullable = false)
    private Integer itemId; // Può essere piatto_id o inventario_id (per bevande)

    @Column(name = "quantita", nullable = false)
    private Integer quantita;

    @Column(name = "prezzo", nullable = false)
    private Double prezzo;
    
    // CAMPO CHIAVE: Disambigua il riferimento di itemId
    // Nuovo campo per distinguere tra piatti e bevande
    // senza di esso non sapremmo se itemId si riferisce all'id della tabella "piatto" o della tabella "inventario"
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_item", nullable = false)
    private TipoItem tipoItem;
    
    // Enum per definire il tipo di item
    // SOLUZIONE IMPLEMENTATA PER DISTINGUERE TRA PIATTI E BEVANDE NELLO STESSO ORDINE
    // FUNZIONAMENTO: PIATTO → cerca in tabella "piatto", BEVANDA → cerca in tabella "inventario"
    public enum TipoItem {
        PIATTO,   // Riferisce a tabella "piatto"
        BEVANDA   // Riferisce a tabella "inventario" con categoria "bevande"
    }
}