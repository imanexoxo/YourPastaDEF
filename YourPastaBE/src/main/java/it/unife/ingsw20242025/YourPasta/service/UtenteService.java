package it.unife.ingsw20242025.YourPasta.service;

import it.unife.ingsw20242025.YourPasta.model.Utente;
import it.unife.ingsw20242025.YourPasta.repository.UtenteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service // Servizio che gestisce la logica di business per gli utenti

public class UtenteService {
    
    // Dipendenze: repository e servizio contatore, iniettate tramite costruttore direttamente da Spring
    private final UtenteRepository utenteRepository;
    private final ContatoreService contatoreService; // Per generare gli ID
    
    public UtenteService(UtenteRepository utenteRepository, ContatoreService contatoreService) {
        this.utenteRepository = utenteRepository;
        this.contatoreService = contatoreService;
    }
    
    // Crea un nuovo utente
    public Utente creaUtente(String nome, String cognome, String username, String password, String email, LocalDate dataNascita, Utente.Ruolo ruolo) {
        
        // Controlla se username esiste già
        if (utenteRepository.existsByUsername(username)) {
            throw new RuntimeException("Username già esistente: " + username);
        }
        
        // Genera un nuovo ID usando il contatore
        Integer nuovoId = contatoreService.getNextId("utente");
        
        // Crea l'utente
        Utente utente = new Utente();
        utente.setId(nuovoId);
        utente.setNome(nome);
        utente.setCognome(cognome);
        utente.setUsername(username);
        utente.setPassword(password); // In un progetto reale andrà criptata
        utente.setEmail(email);
        utente.setDataNascita(dataNascita);
        utente.setRuolo(ruolo);
        utente.setPunti(0); // Inizia con 0 punti
        
        return utenteRepository.save(utente);
    }
    
    // Login con distinzione tra username non trovato e password errata
    public Utente login(String username, String password) {
        // Cerca utente per username
        Optional<Utente> utente = utenteRepository.findByUsername(username);
        
        // Controlla se username esiste
        if (utente.isEmpty()) {
            throw new RuntimeException("Username non trovato");
        }
        
        // Controlla password
        if (!utente.get().getPassword().equals(password)) {
            throw new RuntimeException("Password errata");
        }
        
        // Login riuscito, restituisce l'utente completo
        return utente.get();
    }
    
    // Trova utente per ID
    public Optional<Utente> trovaUtentePerId(Integer id) {
        return utenteRepository.findById(id);
    }
    
    // Trova utente per username (utile per login)
    public Optional<Utente> trovaUtentePerUsername(String username) {
        return utenteRepository.findByUsername(username);
    }
    
    // Trova tutti gli utenti
    public List<Utente> trovaTuttiGliUtenti() {
        return utenteRepository.findAll();
    }
    
    
    // Aggiorna punti utente (aggiunge i punti passati a quelli già presenti)
    public Utente aggiornaPunti(Integer utenteId, Integer puntiDaAggiungere) {
        Utente utente = utenteRepository.findById(utenteId).orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + utenteId));
        // Aggiunge i punti a quelli già presenti
        Integer puntiAttuali = utente.getPunti();
        Integer nuoviPunti = puntiAttuali + puntiDaAggiungere;
        utente.setPunti(nuoviPunti);
        return utenteRepository.save(utente);
    }
    
    // Elimina utente
    public void eliminaUtente(Integer id) {
        if (!utenteRepository.existsById(id)) {
            throw new RuntimeException("Utente non trovato con ID: " + id);
        }
        utenteRepository.deleteById(id);
    }
    
    // Blocca/Sblocca utente
    public Utente cambiaStatoUtente(Integer utenteId, Boolean bloccato) {
        Utente utente = utenteRepository.findById(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + utenteId));
        utente.setBloccato(bloccato);
        return utenteRepository.save(utente);
    }
    
    // Aggiorna dati utente (per amministratori)
    public Utente aggiornaUtente(Integer utenteId, String nome, String cognome, String email, Utente.Ruolo ruolo) {
        Utente utente = utenteRepository.findById(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + utenteId));
        
        if (nome != null) utente.setNome(nome);
        if (cognome != null) utente.setCognome(cognome);
        if (email != null) utente.setEmail(email);
        if (ruolo != null) utente.setRuolo(ruolo);
        
        return utenteRepository.save(utente);
    }
}