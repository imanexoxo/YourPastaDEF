package it.unife.ingsw20242025.YourPasta.controller;

import it.unife.ingsw20242025.YourPasta.model.Piatto;
import it.unife.ingsw20242025.YourPasta.service.PiattoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/piatto")
public class PiattoController {
    private final PiattoService piattoService;

    public PiattoController(PiattoService piattoService) {
        this.piattoService = piattoService;
    }

    @PostMapping("/nuovo")
    public ResponseEntity<Piatto> creaPiatto(@RequestBody java.util.Map<String, Object> request) {
        String nome = (String) request.get("nome");
        Double prezzo = Double.valueOf(request.get("prezzo").toString());
        Integer utenteId = request.get("utenteId") != null ? Integer.valueOf(request.get("utenteId").toString()) : null;
        String descrizione = (String) request.get("descrizione");
        
        // Crea il piatto usando il service
        Piatto nuovo = piattoService.creaPiatto(nome, prezzo, utenteId);
        
        // Aggiorna la descrizione se fornita
        if (descrizione != null && !descrizione.trim().isEmpty()) {
            nuovo.setDescrizione(descrizione);
            nuovo = piattoService.aggiornaPiatto(nuovo);
        }
        
        return ResponseEntity.ok(nuovo);
    }
    @GetMapping("/utente/{utenteId}")
    public ResponseEntity<List<Piatto>> getPiattiPerUtente(@PathVariable Integer utenteId) {
        return ResponseEntity.ok(piattoService.trovaPiattiPerUtente(utenteId));
    }

    @GetMapping("")
    public ResponseEntity<List<Piatto>> getTuttiPiatti() {
        return ResponseEntity.ok(piattoService.trovaTuttiPiatti());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Piatto> getPiattoPerId(@PathVariable Integer id) {
        return piattoService.trovaPiattoPerId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cerca")
    public ResponseEntity<List<Piatto>> cercaPerNome(@RequestParam String nome) {
        return ResponseEntity.ok(piattoService.cercaPerNome(nome));
    }
}