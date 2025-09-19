package it.unife.ingsw20242025.YourPasta.model;

import jakarta.persistence.*; // importa tutte le annotazioni JPA per mapping oggetto-relazione
import lombok.Data; // genera automaticamente getter, setter, toString, equals e hashcode
import lombok.NoArgsConstructor; // genera un costruttore senza parametri
import lombok.AllArgsConstructor; // genera automaticamente un costruttore con tutti i parametri

@Entity // Indica che questa classe è una tabella del database
@Table(name = "inventario") // Nome della tabella nel database
@Data // Genera automaticamente getter, setter, toString, equals e hashCode
@NoArgsConstructor // Genera costruttore vuoto (richiesto da JPA)
@AllArgsConstructor // Genera costruttore con tutti i parametri
public class Inventario {
    
    @Id // Chiave primaria
    @Column(name = "id")
    private Integer id; // Usiamo Integer come per Utente, gestito manualmente con contatore
    
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;
    
    @Enumerated(EnumType.STRING) // Salva l'enum come stringa nel database
    
    @Column(name = "categoria", nullable = false)
    private Categoria categoria;
    
    @Column(name = "quantita", nullable = false)
    private Integer quantita;
    
    @Column(name = "prezzo_unitario", nullable = false)
    private Double prezzoUnitario; // Double per i prezzi
    
    // Enum per le categorie
    public enum Categoria {
        pasta,
        condimento_pronto,
        condimento_base,
        proteine,
        ingrediente_base,
        topping,
        bevande
    }
}