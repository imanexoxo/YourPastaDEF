package it.unife.ingsw20242025.YourPasta.repository;

import it.unife.ingsw20242025.YourPasta.model.Contatore; // Import della classe Contatore dal package model
import org.springframework.data.jpa.repository.JpaRepository; // Import dell'interfaccia JpaRepository di Spring Data JPA
import org.springframework.stereotype.Repository; // Import dell'annotazione Repository di Spring

import java.util.Optional; // Import della classe Optional di Java, usata per gestire valori che potrebbero essere nulli

@Repository // Indica che questa interfaccia è un repository Spring, specializzata nella gestione dei dati del DB
public interface ContatoreRepository extends JpaRepository<Contatore, String> {
    
    // Trova un contatore per nome tabella
    Optional<Contatore> findByNomeTabella(String nomeTabella);
    // il metodo restituisce un Optional che puo contenere un oggetto Contatore [contatore.getNomeTabella(), contatore.getUltimoId()] se trovato, altrimenti e vuoto
    // un optional e un contenitore che puo contenere un valore non nullo o essere vuoto, utile per evitare null pointer exception
}