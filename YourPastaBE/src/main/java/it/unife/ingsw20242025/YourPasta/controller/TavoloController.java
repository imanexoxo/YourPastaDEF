package it.unife.ingsw20242025.YourPasta.controller;

import it.unife.ingsw20242025.YourPasta.model.Tavolo;
import it.unife.ingsw20242025.YourPasta.service.TavoloService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tavoli")
public class TavoloController {
    private final TavoloService tavoloService;

    public TavoloController(TavoloService tavoloService) {
        this.tavoloService = tavoloService;
    }

    @GetMapping
    public List<Tavolo> trovaTuttiITavoli() {
        return tavoloService.trovaTuttiITavoli();
    }

    @GetMapping("/disponibili")
    public List<Tavolo> trovaTavoliDisponibili() {
        return tavoloService.trovaTavoliDisponibili();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> trovaTavolo(@PathVariable Integer id) {
        Optional<Tavolo> tavolo = tavoloService.trovaTavoloPerId(id);
        if (tavolo.isPresent()) {
            return ResponseEntity.ok(tavolo.get());
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Tavolo non trovato con ID: " + id));
        }
    }

    @PutMapping("/{id}/disponibilita")
    public ResponseEntity<?> cambiaDisponibilita(@PathVariable Integer id, @RequestParam boolean disponibile) {
        try {
            Tavolo tavolo = tavoloService.cambiaDisponibilita(id, disponibile);
            return ResponseEntity.ok(tavolo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}