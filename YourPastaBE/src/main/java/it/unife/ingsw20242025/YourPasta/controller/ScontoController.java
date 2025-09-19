package it.unife.ingsw20242025.YourPasta.controller;

import it.unife.ingsw20242025.YourPasta.model.Utente;
import it.unife.ingsw20242025.YourPasta.service.ScontoService;
import it.unife.ingsw20242025.YourPasta.service.UtenteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sconti")
@CrossOrigin(origins = "http://localhost:4200")
public class ScontoController {
    
    private final ScontoService scontoService;
    private final UtenteService utenteService;
    
    public ScontoController(ScontoService scontoService, UtenteService utenteService) {
        this.scontoService = scontoService;
        this.utenteService = utenteService;
    }
    
    /**
     * Calcola il prezzo finale con eventuale sconto per un utente
     * @param utenteId ID dell'utente
     * @param prezzoOriginale prezzo senza sconto
     * @return informazioni su prezzo e sconto
     */
    @GetMapping("/calcola/{utenteId}")
    public ResponseEntity<Map<String, Object>> calcolaScontoPerUtente(
            @PathVariable Integer utenteId,
            @RequestParam Double prezzoOriginale) {
        
        try {
            Utente utente = utenteService.trovaUtentePerId(utenteId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + utenteId));
            
            Double prezzoFinale = scontoService.calcolaPrezzoConSconto(prezzoOriginale, utente.getRuolo());
            Double importoSconto = scontoService.calcolaImportoSconto(prezzoOriginale, utente.getRuolo());
            Boolean haSconto = scontoService.hasDirittoSconto(utente.getRuolo());
            
            Map<String, Object> risultato = new HashMap<>();
            risultato.put("prezzoOriginale", prezzoOriginale);
            risultato.put("prezzoFinale", prezzoFinale);
            risultato.put("importoSconto", importoSconto);
            risultato.put("haSconto", haSconto);
            risultato.put("ruoloUtente", utente.getRuolo().toString());
            
            if (haSconto) {
                risultato.put("percentualeSconto", scontoService.getScontoStudentePercentuale());
                risultato.put("tipoSconto", "Sconto Studente");
            }
            
            return ResponseEntity.ok(risultato);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("errore", e.getMessage()));
        }
    }
    
    /**
     * Ottiene informazioni generali sui tipi di sconto disponibili
     * @return informazioni sui sconti
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getInfoSconti() {
        Map<String, Object> info = new HashMap<>();
        info.put("scontoStudentePercentuale", scontoService.getScontoStudentePercentuale());
        info.put("ruoliConSconto", new String[]{"studente"});
        
        return ResponseEntity.ok(info);
    }
}
