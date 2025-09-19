package it.unife.ingsw20242025.YourPasta.service;

import it.unife.ingsw20242025.YourPasta.model.PiattoItem;
import it.unife.ingsw20242025.YourPasta.repository.PiattoItemRepository;
import it.unife.ingsw20242025.YourPasta.repository.InventarioRepository;
import it.unife.ingsw20242025.YourPasta.model.Inventario;

import org.springframework.stereotype.Service;
import java.util.List;

@Service

public class PiattoItemService {
    private final PiattoItemRepository piattoItemRepository;
    private final ContatoreService contatoreService;
    private final InventarioRepository inventarioRepository;
    private final PiattoService piattoService;

    // iniezione di taaaaaante dipendenze
    // Costruttore
    public PiattoItemService(PiattoItemRepository piattoItemRepository,
                             ContatoreService contatoreService,
                             InventarioRepository inventarioRepository,
                             PiattoService piattoService) {
        this.piattoItemRepository = piattoItemRepository;
        this.contatoreService = contatoreService;
        this.inventarioRepository = inventarioRepository;
        this.piattoService = piattoService;
    }

    public PiattoItem creaPiattoItem(Integer ingredienteId, Integer piattoId, Integer quantita) {
        Integer nuovoId = contatoreService.getNextId("piatto_item");
        Inventario ingrediente = inventarioRepository.findById(ingredienteId).orElseThrow(() -> new RuntimeException("Ingrediente non trovato con ID: " + ingredienteId));
        double prezzoUnitario = ingrediente.getPrezzoUnitario();
        double prezzoTotale = prezzoUnitario * quantita;
        PiattoItem piattoItem = new PiattoItem();
        piattoItem.setId(nuovoId);
        piattoItem.setIngredienteId(ingredienteId);
        piattoItem.setPiattoId(piattoId);
        piattoItem.setQuantita(quantita);
        piattoItem.setPrezzo(prezzoTotale);
        PiattoItem salvato = piattoItemRepository.save(piattoItem);
        // Ricalcola il prezzo del piatto dopo ogni inserimento
        piattoService.ricalcolaPrezzoPiatto(piattoId);
        return salvato;
    }


    public List<PiattoItem> trovaPerPiattoId(Integer piattoId) {
        return piattoItemRepository.findByPiattoId(piattoId);
    }
}