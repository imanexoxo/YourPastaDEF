package it.unife.ingsw20242025.YourPasta.controller;

import it.unife.ingsw20242025.YourPasta.model.Inventario;
import it.unife.ingsw20242025.YourPasta.service.InventarioService;
import org.springframework.http.ResponseEntity; // Classe per gestire le risposte HTTP
import org.springframework.web.bind.annotation.*; // Importa le annotazioni per i controller REST

import java.util.List; // Per liste di articoli
import java.util.Map; // Per creare risposte JSON semplici
import java.util.Optional; // Per gestire valori che possono essere null

@RestController // Indica che questa classe è un controller REST, gestisce richieste HTTP e risposte JSON
// gestisce api rest e converte automaticamente oggetti Java in JSON e viceversa
@RequestMapping("/api/inventario") // tutte le rotte in questo controller iniziano con /api/inventario

public class InventarioController {
    
    // Dipendenza dal service, iniettata da Spring
    private final InventarioService inventarioService;
    
    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }
    
    // Crea un nuovo articolo
    @PostMapping
    public ResponseEntity<?> creaArticolo(@RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            Inventario.Categoria categoria = Inventario.Categoria.valueOf((String) request.get("categoria")); // non chiedetemi cosa sia questo tipo ma converte la stringa in enum
            Integer quantita = (Integer) request.get("quantita");
            Double prezzoUnitario = Double.valueOf(request.get("prezzoUnitario").toString());
            
            Inventario articolo = inventarioService.creaArticolo(nome, categoria, quantita, prezzoUnitario);
            return ResponseEntity.ok(articolo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Trova tutti gli articoli
    @GetMapping
    public List<Inventario> trovaTuttiGliArticoli() {
        return inventarioService.trovaTuttiGliArticoli();
    }
    
    // Trova articolo per id
    @GetMapping("/{id}")
    public ResponseEntity<?> trovaArticolo(@PathVariable Integer id) {
        Optional<Inventario> articolo = inventarioService.trovaArticoloPerId(id);
        
        if (articolo.isPresent()) {
            return ResponseEntity.ok(articolo.get());
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Articolo non trovato con ID: " + id));
        }
    }
    
    // Trova articoli per categoria
    @GetMapping("/categoria/{categoria}")
    public List<Inventario> trovaArticoliPerCategoria(@PathVariable String categoria) {
        try {
            Inventario.Categoria cat = Inventario.Categoria.valueOf(categoria.toLowerCase());
            return inventarioService.trovaArticoliPerCategoria(cat);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Categoria non valida: " + categoria + ". Valori possibili: pasta, condimento_pronto, condimento_base, proteine, ingrediente_base, topping, bevande");
        }
    }
    
    // Trova articoli per nome (ricerca parziale)
    @GetMapping("/cerca")
    public List<Inventario> cercaArticoliPerNome(@RequestParam String nome) {
        return inventarioService.trovaArticoliPerNome(nome);
    }
    
    // Aggiorna quantità
    @PutMapping("/{id}/quantita")
    public ResponseEntity<?> aggiornaQuantita(@PathVariable Integer id, @RequestBody Map<String, Integer> request) {
        try {
            Integer quantita = request.get("quantita");
            Inventario articolo = inventarioService.aggiornaQuantita(id, quantita);
            return ResponseEntity.ok(articolo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    // Aggiorna prezzo
    @PutMapping("/{id}/prezzo")
    public ResponseEntity<?> aggiornaPrezzo(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            Double prezzo = Double.valueOf(request.get("prezzo").toString());
            Inventario articolo = inventarioService.aggiornaPrezzo(id, prezzo);
            return ResponseEntity.ok(articolo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", e.getMessage()));
        }
    }


    // Aggiorna articolo (nome, categoria, quantita, prezzo)
    @PutMapping("/{id}")
    public ResponseEntity<?> aggiornaArticolo(@PathVariable Integer id, @RequestBody Map<String, Object> request) {
        try {
            String nome = (String) request.get("nome");
            Inventario.Categoria categoria = Inventario.Categoria.valueOf((String) request.get("categoria"));
            Integer quantita = (Integer) request.get("quantita");
            Double prezzoUnitario = Double.valueOf(request.get("prezzoUnitario").toString());

            Inventario articolo = inventarioService.aggiornaArticolo(id, nome, categoria, quantita, prezzoUnitario);
            return ResponseEntity.ok(articolo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", e.getMessage()));
        }
    }


    // Elimina articolo
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminaArticolo(@PathVariable Integer id) {
        try {
            inventarioService.eliminaArticolo(id);
            return ResponseEntity.ok(Map.of("message", "Articolo eliminato con successo"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", e.getMessage()));
        }
    }
}