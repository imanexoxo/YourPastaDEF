package it.unife.ingsw20242025.YourPasta.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "piatto")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Piatto {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "prezzo", nullable = false)
    private Double prezzo;

    @Column(name = "utente_id")
    private Integer utenteId;
    
    // Nuovi campi per migliorare la gestione
    @Column(name = "descrizione", length = 500)
    private String descrizione;
    
    @Column(name = "data_creazione")
    private LocalDateTime dataCreazione;
    
    @Column(name = "is_favorito") // non utilizzato al momento
    private Boolean isFavorito = false;
    
    @Column(name = "numero_riordini")   // non utilizzato al momento
    private Integer numeroRiordini = 0;
}