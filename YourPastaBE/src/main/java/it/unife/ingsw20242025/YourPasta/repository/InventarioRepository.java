package it.unife.ingsw20242025.YourPasta.repository;

import it.unife.ingsw20242025.YourPasta.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository // Annotazione per indicare che è un repository Spring
public interface InventarioRepository extends JpaRepository<Inventario, Integer> {
    
    // Metodi automatici ereditati da JpaRepository:
    // - findById(Integer id): Optional<Inventario>
    // - findAll(): List<Inventario>
    // - save(Inventario inventario): Inventario
    // - deleteById(Integer id): void
    // - existsById(Integer id): boolean
    // non vanno esplicitati, gia disponibili e pronti da usare in service
    
    // Metodi personalizzati usando le naming conventions di Spring Data JPA
    
    // Trova tutti gli articoli per categoria
    List<Inventario> findByCategoria(Inventario.Categoria categoria);
    
    // Trova articoli per nome che contiene una stringa (ricerca parziale)
    List<Inventario> findByNomeContainingIgnoreCase(String nome);
}