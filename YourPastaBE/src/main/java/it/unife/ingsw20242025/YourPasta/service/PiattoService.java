
package it.unife.ingsw20242025.YourPasta.service;

import it.unife.ingsw20242025.YourPasta.model.Piatto;
import it.unife.ingsw20242025.YourPasta.repository.PiattoRepository;
import it.unife.ingsw20242025.YourPasta.repository.PiattoItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PiattoService {
    private final PiattoRepository piattoRepository;
    private final ContatoreService contatoreService;
    private final PiattoItemRepository piattoItemRepository;

    // Costruttore
    public PiattoService(PiattoRepository piattoRepository, ContatoreService contatoreService, PiattoItemRepository piattoItemRepository) {
        this.piattoRepository = piattoRepository;
        this.contatoreService = contatoreService;
        this.piattoItemRepository = piattoItemRepository;
    }

    // Ricalcola il prezzo del piatto come somma dei prezzi dei suoi piatti item
    public void ricalcolaPrezzoPiatto(Integer piattoId) {
        Piatto piatto = piattoRepository.findById(piattoId)
            .orElseThrow(() -> new RuntimeException("Piatto non trovato con ID: " + piattoId));
        double totale = piattoItemRepository.findByPiattoId(piattoId)
            .stream().mapToDouble(pi -> pi.getPrezzo() != null ? pi.getPrezzo() : 0).sum();
        piatto.setPrezzo(totale);
        piattoRepository.save(piatto);
    }

    public Piatto creaPiatto(String nome, Double prezzo, Integer utenteId) {
        Integer nuovoId = contatoreService.getNextId("piatto");
        Piatto piatto = new Piatto();
        piatto.setId(nuovoId);
        piatto.setNome(nome);
        piatto.setPrezzo(prezzo);
        piatto.setUtenteId(utenteId);
        piatto.setDataCreazione(java.time.LocalDateTime.now());
        piatto.setIsFavorito(false);
        piatto.setNumeroRiordini(0);
        return piattoRepository.save(piatto);
    }

    public Piatto aggiornaPiatto(Piatto piatto) {
        return piattoRepository.save(piatto);
    }


    public List<Piatto> trovaTuttiPiatti() {
        return piattoRepository.findAll();
    }

    public List<Piatto> trovaPiattiPerUtente(Integer utenteId) {
        return piattoRepository.findByUtenteId(utenteId);
    }

    public Optional<Piatto> trovaPiattoPerId(Integer id) {
        return piattoRepository.findById(id);
    }

    public List<Piatto> cercaPerNome(String nome) {
        return piattoRepository.findByNomeContainingIgnoreCase(nome);
    }
}