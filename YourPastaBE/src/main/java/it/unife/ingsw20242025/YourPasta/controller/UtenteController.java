package it.unife.ingsw20242025.YourPasta.controller;

import it.unife.ingsw20242025.YourPasta.model.Utente;
import it.unife.ingsw20242025.YourPasta.service.UtenteService;
import org.springframework.http.ResponseEntity; // Per gestire le risposte HTTP
import org.springframework.web.bind.annotation.*; // Importa le annotazioni per i controller REST

import java.time.LocalDate; // Per gestire le date
import java.util.List; // Per liste di utenti
import java.util.Map; // Per creare risposte JSON semplici
import java.util.Optional; 

@RestController // Indica che questa classe e un controller REST, gestisce richieste HTTP e risposte JSON
// gestisce api rest e converte automaticamente oggetti Java in JSON e viceversa
@RequestMapping("/api/utenti") // tutte le rotte in questo controller iniziano con /api/utenti

public class UtenteController {
    
    private final UtenteService utenteService;  // Dipendenza iniettata tramite costruttore
    
    public UtenteController(UtenteService utenteService) {
        this.utenteService = utenteService;
    }
    
    // Login utente
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) { // converte il corpo JSON in una mappa chiave-valore per username e password
        try {
            String username = request.get("username"); // estrae username dalla mappa ovvero dal JSON {"username": "imanexoxo", "password": "xoxo"}
            String password = request.get("password"); // estrae password dalla mappa ovvero dal JSON {"username": "imanexoxo", "password": "xoxo"}
            Utente utente = utenteService.login(username, password);
            return ResponseEntity.ok(utente); // 200 OK + l'utente in formato JSON
            
        } catch (RuntimeException e) {
            // Gestisce sia "Username non trovato" che "Password errata"
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage())); // 401 Unauthorized
        }
    }
    
    // Crea un nuovo utente
    @PostMapping
    public ResponseEntity<?> creaUtente(@RequestBody Map<String, Object> request) {
        try {
            // Estrae i campi dalla mappa con cast espliciti
            String nome = (String) request.get("nome");
            String cognome = (String) request.get("cognome");
            String username = (String) request.get("username");
            String password = (String) request.get("password");
            String email = (String) request.get("email");
            LocalDate dataNascita = LocalDate.parse((String) request.get("dataNascita")); // converte la stringa in LocalDate
            Utente.Ruolo ruolo = Utente.Ruolo.valueOf((String) request.get("ruolo")); // converte la stringa in enum
            
            Utente utente = utenteService.creaUtente(nome, cognome, username, password, email, dataNascita, ruolo);
            return ResponseEntity.ok(utente);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage())); // 400 Bad Request con messaggio
        }
    }
    
    // Trova utente per ID
    @GetMapping("/{id}")
    public ResponseEntity<?> trovaUtente(@PathVariable Integer id) { // estrae l'id dalla rotta /api/utenti/{id}
        Optional<Utente> utente = utenteService.trovaUtentePerId(id);
        
        if (utente.isPresent()) {
            return ResponseEntity.ok(utente.get()); // 200 OK
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Utente non trovato con ID: " + id)); // 404 Not Found
        }
    }
    
    // Trova tutti gli utenti
    @GetMapping
    public List<Utente> trovaTuttiGliUtenti() {
        return utenteService.trovaTuttiGliUtenti();
    }
    
    // Aggiorna punti (aggiunge i punti passati a quelli già presenti)
    @PutMapping("/{id}/punti")
    public ResponseEntity<?> aggiornaPunti(@PathVariable Integer id, @RequestBody Map<String, Integer> request) {
        try {
            Integer puntiDaAggiungere = request.get("punti");
            Utente utente = utenteService.aggiornaPunti(id, puntiDaAggiungere);
            return ResponseEntity.ok(utente);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Elimina utente
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminaUtente(@PathVariable Integer id) {
        try {
            utenteService.eliminaUtente(id);
            return ResponseEntity.ok(Map.of("message", "Utente eliminato con successo"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Blocca/Sblocca utente (solo per amministratori)
    @PutMapping("/{id}/stato")
    public ResponseEntity<?> cambiaStatoUtente(@PathVariable Integer id, @RequestBody Map<String, Boolean> request) {
        try {
            Boolean bloccato = request.get("bloccato");
            Utente utente = utenteService.cambiaStatoUtente(id, bloccato);
            return ResponseEntity.ok(utente);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Aggiorna dati utente (solo per amministratori)
    @PutMapping("/{id}")
    public ResponseEntity<?> aggiornaUtente(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            String cognome = (String) request.get("cognome");
            String email = (String) request.get("email");
            Utente.Ruolo ruolo = request.get("ruolo") != null ? 
                Utente.Ruolo.valueOf((String) request.get("ruolo")) : null;
            
            Utente utente = utenteService.aggiornaUtente(id, nome, cognome, email, ruolo);
            return ResponseEntity.ok(utente);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}

// ho usato ? (wildcard) come tipo di ritorno generico per gestire risposte diverse (Utente o Map) senza errori di tipo
// ResponseEntity<?> e piu flessibile di ResponseEntity<Utente> o ResponseEntity<Map<String,String>>