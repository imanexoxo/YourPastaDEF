package it.unife.ingsw20242025.YourPasta.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "ordine")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ordine {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "utente_id", nullable = false)
    private Integer utenteId;

    @Column(name = "data_ordine", nullable = false)
    private LocalDateTime dataOrdine;

    @Column(name = "prezzo_totale", nullable = false)
    private Double prezzoTotale;

    @Column(name = "n_tavolo", nullable = true)
    @JsonProperty("nTavolo")
    private Integer nTavolo;

    @Column(name = "note")
    private String note;

    @Column(name = "punti", nullable = false)
    private Integer punti;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "is_delivery", nullable = false)
    private boolean delivery = false;

    public enum Status {
        pending,
        preparazione,
        servito,    // il cibo è stato servito al tavolo
        chiuso, // il tavolo è nuovamente libero dopo che l'ordine è stato pagato
        annullato
    }
}