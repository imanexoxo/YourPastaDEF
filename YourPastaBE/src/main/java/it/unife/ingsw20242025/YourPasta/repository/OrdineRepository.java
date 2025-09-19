package it.unife.ingsw20242025.YourPasta.repository;

import it.unife.ingsw20242025.YourPasta.model.Ordine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrdineRepository extends JpaRepository<Ordine, Integer> {
    List<Ordine> findByUtenteId(Integer utenteId);
    List<Ordine> findBynTavolo(Integer nTavolo);
    List<Ordine> findByStatus(Ordine.Status status);
}

// metto solo i metodi personalizzati