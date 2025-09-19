package it.unife.ingsw20242025.YourPasta.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "tavolo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tavolo {
    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "disponibile", nullable = false)
    private boolean disponibile;
}