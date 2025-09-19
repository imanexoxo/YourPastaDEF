package it.unife.ingsw20242025.YourPasta.service;

import it.unife.ingsw20242025.YourPasta.model.Contatore;
import it.unife.ingsw20242025.YourPasta.repository.ContatoreRepository;
import org.springframework.stereotype.Service;

@Service
public class ContatoreService {
    
    private final ContatoreRepository contatoreRepository;
    
    public ContatoreService(ContatoreRepository contatoreRepository) {
        this.contatoreRepository = contatoreRepository;
    }
    
    // Unico metodo necessario: genera il prossimo ID per una tabella
    public Integer getNextId(String nomeTabella) {
        // Cerca il contatore per questa tabella
        Contatore contatore = contatoreRepository.findByNomeTabella(nomeTabella)
                .orElseGet(() -> {
                    // Se non esiste, crea un nuovo contatore partendo da 0
                    Contatore nuovo = new Contatore(nomeTabella);
                    return contatoreRepository.save(nuovo);
                });
        
        // Incrementa l'ID e salva nel database
        Integer nextId = contatore.getNextId();
        contatoreRepository.save(contatore);
        return nextId;
    }
}