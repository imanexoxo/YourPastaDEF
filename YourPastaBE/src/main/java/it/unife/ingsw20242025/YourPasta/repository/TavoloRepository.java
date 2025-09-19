package it.unife.ingsw20242025.YourPasta.repository;

import it.unife.ingsw20242025.YourPasta.model.Tavolo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TavoloRepository extends JpaRepository<Tavolo, Integer> {
    List<Tavolo> findByDisponibileTrue();
}

// findAll e findAllById sono dati da Spring Data JPA