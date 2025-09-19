package it.unife.ingsw20242025.YourPasta.repository;

import it.unife.ingsw20242025.YourPasta.model.OrdineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrdineItemRepository extends JpaRepository<OrdineItem, Integer> {
    List<OrdineItem> findByOrdineId(Integer ordineId);
    
    // Nuovi metodi per filtrare per tipo
    List<OrdineItem> findByOrdineIdAndTipoItem(Integer ordineId, OrdineItem.TipoItem tipoItem);
    
    // Trova tutti i piatti di un utente (per storico e favoriti)
    List<OrdineItem> findByTipoItem(OrdineItem.TipoItem tipoItem);
}