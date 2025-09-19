package it.unife.ingsw20242025.YourPasta.repository;

import it.unife.ingsw20242025.YourPasta.model.Piatto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PiattoRepository extends JpaRepository<Piatto, Integer> {
    List<Piatto> findByNomeContainingIgnoreCase(String nome);
    List<Piatto> findByUtenteId(Integer utenteId);
}

// metodo per trovare un piatto attraverso il suo nome