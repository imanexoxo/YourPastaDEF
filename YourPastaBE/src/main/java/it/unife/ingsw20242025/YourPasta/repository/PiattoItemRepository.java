package it.unife.ingsw20242025.YourPasta.repository;

import it.unife.ingsw20242025.YourPasta.model.PiattoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PiattoItemRepository extends JpaRepository<PiattoItem, Integer> {
    List<PiattoItem> findByPiattoId(Integer piattoId);
}