package it.unife.ingsw20242025.YourPasta.repository;

import it.unife.ingsw20242025.YourPasta.model.Utente; // Import della classe Utente dal package model
import org.springframework.data.jpa.repository.JpaRepository; // Import dell'interfaccia JpaRepository di Spring Data JPA che ci da tutti i metodi CRUD di base
import org.springframework.stereotype.Repository; // Import dell'annotazione Repository di Spring

import java.util.Optional; 

@Repository // classe che si occupa di interagire con il database per operazioni CRUD sulla tabella Utente
public interface UtenteRepository extends JpaRepository<Utente, Integer> { // Integer e il tipo della chiave primaria (id)
    
    // Trova utente per username (per login e ricerche)
    Optional<Utente> findByUsername(String username);
    
    // Controlla se username esiste già (per evitare duplicati)
    boolean existsByUsername(String username);
}



/* 

Operazioni di base

// Salvare/Aggiornare:
save(utente)                    // INSERT o UPDATE
saveAll(listaUtenti)           // INSERT/UPDATE multipli

// Trovare:
findById(1)                    // SELECT WHERE id = 1
findAll()                      // SELECT * FROM utente
findAllById(Arrays.asList(1,2,3)) // SELECT WHERE id IN (1,2,3)

// Contare:
count()                        // SELECT COUNT(*) FROM utente
existsById(1)                  // SELECT COUNT(*) > 0 WHERE id = 1

// Eliminare:
deleteById(1)                  // DELETE WHERE id = 1
delete(utente)                 // DELETE per oggetto
deleteAll()                    // DELETE FROM utente (ATTENZIONE!)
deleteAllById(Arrays.asList(1,2)) // DELETE WHERE id IN (1,2)

*/