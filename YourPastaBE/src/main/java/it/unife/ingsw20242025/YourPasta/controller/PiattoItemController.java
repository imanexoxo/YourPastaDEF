package it.unife.ingsw20242025.YourPasta.controller;

import it.unife.ingsw20242025.YourPasta.model.PiattoItem;
import it.unife.ingsw20242025.YourPasta.service.PiattoItemService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/piatto-item")
public class PiattoItemController {
    private final PiattoItemService piattoItemService;

    public PiattoItemController(PiattoItemService piattoItemService) {
        this.piattoItemService = piattoItemService;
    }

    @PostMapping("/nuovo")
    public ResponseEntity<PiattoItem> creaPiattoItem(@RequestBody java.util.Map<String, Object> request) {
        Integer ingredienteId = (Integer) request.get("ingredienteId");
        Integer piattoId = (Integer) request.get("piattoId");
        Integer quantita = (Integer) request.get("quantita");
        PiattoItem nuovo = piattoItemService.creaPiattoItem(ingredienteId, piattoId, quantita);
        return ResponseEntity.ok(nuovo);
    }



    @GetMapping("/per-piatto/{piattoId}")
    public ResponseEntity<List<PiattoItem>> getPerPiattoId(@PathVariable Integer piattoId) {
        return ResponseEntity.ok(piattoItemService.trovaPerPiattoId(piattoId));
    }
}