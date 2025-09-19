package it.unife.ingsw20242025.YourPasta.controller;

import it.unife.ingsw20242025.YourPasta.model.OrdineItem;
import it.unife.ingsw20242025.YourPasta.service.OrdineItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordine-item")
public class OrdineItemController {
    private final OrdineItemService ordineItemService;

    public OrdineItemController(OrdineItemService ordineItemService) {
        this.ordineItemService = ordineItemService;
    }

    @GetMapping("/ordine/{ordineId}")
    public List<OrdineItem> trovaItemPerOrdine(@PathVariable Integer ordineId) {
        return ordineItemService.trovaItemPerOrdine(ordineId);
    }

    // Crea un nuovo OrdineItem (solo per item inventario)
    @PostMapping("/nuovo")
    public OrdineItem creaOrdineItem(@RequestBody java.util.Map<String, Object> request) {
        Integer ordineId = (Integer) request.get("ordineId");
        Integer itemId = (Integer) request.get("itemId");
        Integer quantita = (Integer) request.get("quantita");
        return ordineItemService.creaOrdineItem(ordineId, itemId, quantita);
    }
}