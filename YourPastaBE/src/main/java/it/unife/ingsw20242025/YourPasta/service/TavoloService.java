package it.unife.ingsw20242025.YourPasta.service;

import it.unife.ingsw20242025.YourPasta.model.Tavolo;
import it.unife.ingsw20242025.YourPasta.repository.TavoloRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TavoloService {
    private final TavoloRepository tavoloRepository;

    public TavoloService(TavoloRepository tavoloRepository) {
        this.tavoloRepository = tavoloRepository;
    }

    public List<Tavolo> trovaTuttiITavoli() {
        return tavoloRepository.findAll();
    }

    public Optional<Tavolo> trovaTavoloPerId(Integer id) {
        return tavoloRepository.findById(id);
    }

    public List<Tavolo> trovaTavoliDisponibili() {
        return tavoloRepository.findByDisponibileTrue();
    }

    public Tavolo cambiaDisponibilita(Integer id, boolean disponibile) {
        Tavolo tavolo = tavoloRepository.findById(id).orElseThrow(() -> new RuntimeException("Tavolo non trovato con ID: " + id));
        tavolo.setDisponibile(disponibile);
        return tavoloRepository.save(tavolo);
    }
}