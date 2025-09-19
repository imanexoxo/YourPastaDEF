package it.unife.ingsw20242025.YourPasta.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "piatto_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PiattoItem {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "ingrediente_id", nullable = false)
    private Integer ingredienteId;

    @Column(name = "piatto_id", nullable = false)
    private Integer piattoId;

    @Column(name = "quantita", nullable = false)
    private Integer quantita;

    @Column(name = "prezzo", nullable = false)
    private Double prezzo;
}