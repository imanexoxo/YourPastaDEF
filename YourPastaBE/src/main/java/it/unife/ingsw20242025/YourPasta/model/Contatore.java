package it.unife.ingsw20242025.YourPasta.model;

import jakarta.persistence.*; // importa tutte le annotazioni JPA per mapping oggetto-relazione
import lombok.AllArgsConstructor; // genera automaticamente un costruttore con tutti i parametri
import lombok.Data; // genera automaticamente getter, setter, toString, equals e hashcode
import lombok.NoArgsConstructor; // genera automaticamente un costruttore senza parametri

@Entity //marca questa classe come entita JPA ovvero una tabella del DB
@Table(name = "contatore") //specifica quale tabella
@Data //genera automaticamente getter, setter, toString, equals e hashcode con Integer
@NoArgsConstructor //genera un costruttore vuoto public Contatore() {}
@AllArgsConstructor //genera un costruttore con tutti i campi
public class Contatore { // Aggiornato con Integer
    
    @Id //marca questo campo come chiave primaria della tabella
    @Column(name = "nome_tabella", length = 100)
    private String nomeTabella;
    
    @Column(name = "ultimo_id", nullable = false)
    private Integer ultimoId; // Tipo cambiato da Long a Integer
    
    // Restituisce e incrementa l'ID
    public Integer getNextId() {
        return ++this.ultimoId;  // Prima incrementa, poi restituisce
    }
    
    // Costruttore per inizializzare un contatore per una nuova tabella
    public Contatore(String nomeTabella) {
        this.nomeTabella = nomeTabella;
        this.ultimoId = 0;  // Parte da 0, primo ID sarà 1
    }
}