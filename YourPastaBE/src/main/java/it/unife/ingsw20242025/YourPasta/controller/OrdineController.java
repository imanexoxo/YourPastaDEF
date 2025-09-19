package it.unife.ingsw20242025.YourPasta.controller;

import it.unife.ingsw20242025.YourPasta.model.Ordine;
import it.unife.ingsw20242025.YourPasta.service.OrdineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ordini")
public class OrdineController {
    // Ricalcola il prezzo totale e i punti dell'ordine dopo aver inserito tutti gli ordine-item
    @PutMapping("/{id}/ricalcola-prezzo")
    public ResponseEntity<?> ricalcolaPrezzo(@PathVariable Integer id) {
        try {
            ordineService.ricalcolaPrezzoTotaleOrdine(id);
            Optional<Ordine> ordineAggiornato = ordineService.trovaOrdinePerId(id);
            if (ordineAggiornato.isPresent()) {
                return ResponseEntity.ok(ordineAggiornato.get());
            } else {
                return ResponseEntity.status(404).body(Map.of("error", "Ordine non trovato con ID: " + id));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
    private final OrdineService ordineService;

    public OrdineController(OrdineService ordineService) {
        this.ordineService = ordineService;
    }

    @GetMapping
    public List<Ordine> trovaTuttiGliOrdini() {
        return ordineService.trovaTuttiGliOrdini();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> trovaOrdinePerId(@PathVariable Integer id) {
        Optional<Ordine> ordine = ordineService.trovaOrdinePerId(id);
        if (ordine.isPresent()) {
            return ResponseEntity.ok(ordine.get());
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Ordine non trovato con ID: " + id));
        }
    }

    @GetMapping("/utente/{utenteId}")
    public List<Ordine> trovaOrdiniPerUtente(@PathVariable Integer utenteId) {
        List<Ordine> ordini = ordineService.trovaOrdiniPerUtente(utenteId);
        System.out.println("[OrdineController] Ordini trovati per utente " + utenteId + ": " + ordini.size());
        for (Ordine ordine : ordini) {
            System.out.println("[OrdineController] Ordine ID: " + ordine.getId() + ", nTavolo: " + ordine.getNTavolo() + ", delivery: " + ordine.isDelivery());
        }
        return ordini;
    }

    @GetMapping("/tavolo/{nTavolo}")
    public List<Ordine> trovaOrdiniPerTavolo(@PathVariable Integer nTavolo) {
        return ordineService.trovaOrdiniPerTavolo(nTavolo);
    }

    @GetMapping("/status/{status}")
    public List<Ordine> trovaOrdiniPerStatus(@PathVariable Ordine.Status status) {
        return ordineService.trovaOrdiniPerStatus(status);
    }

    // Crea un nuovo ordine (i punti sono calcolati dal BE, cosi e piu easy)
    @PostMapping
    public ResponseEntity<?> creaOrdine(@RequestBody Map<String, Object> request) {
    System.out.println("[OrdineController] Ricevuta richiesta creaOrdine: " + request);
        try {
            Integer utenteId = (Integer) request.get("utenteId");
            Double prezzoTotale = Double.valueOf(request.get("prezzoTotale").toString());
            Integer nTavolo = null;
            if (request.containsKey("nTavolo")) {
                Object nTavoloObj = request.get("nTavolo");
                if (nTavoloObj == null) {
                    nTavolo = null;
                } else if (nTavoloObj instanceof Number) {
                    nTavolo = ((Number) nTavoloObj).intValue();
                } else if (nTavoloObj instanceof String) {
                    String s = (String) nTavoloObj;
                    if (!s.isEmpty()) {
                        try {
                            nTavolo = Integer.parseInt(s);
                        } catch (NumberFormatException e) {
                            nTavolo = null;
                        }
                    }
                }
            }
            String note = (String) request.get("note");
            Ordine.Status status = Ordine.Status.valueOf((String) request.get("status"));
            boolean delivery = false;
            if (request.containsKey("delivery")) {
                Object deliveryObj = request.get("delivery");
                System.out.println("[OrdineController] deliveryObj: " + deliveryObj + " (" + (deliveryObj != null ? deliveryObj.getClass().getName() : "null") + ")");
                if (deliveryObj instanceof Boolean) {
                    delivery = (Boolean) deliveryObj;
                } else if (deliveryObj instanceof String) {
                    String s = ((String) deliveryObj).trim().toLowerCase();
                    delivery = s.equals("true") || s.equals("1");
                } else if (deliveryObj instanceof Number) {
                    delivery = ((Number) deliveryObj).intValue() != 0;
                } else {
                    System.out.println("[OrdineController] deliveryObj non gestito: " + deliveryObj);
                }
            }
            System.out.println("[OrdineController] delivery finale: " + delivery);
            Ordine ordine = ordineService.creaOrdine(utenteId, prezzoTotale, nTavolo, note, status, delivery);
            return ResponseEntity.ok(ordine);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // Aggiorna lo stato di un ordine
    @PutMapping("/{id}/stato")
    public ResponseEntity<?> aggiornaStatoOrdine(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        try {
            Ordine.Status nuovoStato = Ordine.Status.valueOf(request.get("stato"));
            Ordine ordine = ordineService.aggiornaStatoOrdine(id, nuovoStato);
            return ResponseEntity.ok(ordine);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}