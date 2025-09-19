package it.unife.ingsw20242025.YourPasta.service;

import it.unife.ingsw20242025.YourPasta.model.Inventario;
import it.unife.ingsw20242025.YourPasta.repository.InventarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Servizio che gestisce la logica di business per l'inventario

public class InventarioService {
    
    // Dipendenze: repository e servizio contatore, iniettate tramite costruttore
    private final InventarioRepository inventarioRepository;
    private final ContatoreService contatoreService; // Per generare gli ID
    
    public InventarioService(InventarioRepository inventarioRepository, ContatoreService contatoreService) {
        this.inventarioRepository = inventarioRepository;
        this.contatoreService = contatoreService;
    }
    
    // Crea un nuovo articolo in inventario
    // non lo chiamo ingrediente perche ci sono anche le bevande (non so se sia stata una furbata in effetti)
    public Inventario creaArticolo(String nome, Inventario.Categoria categoria, Integer quantita, Double prezzoUnitario) {
        
        // Genera un nuovo ID usando il contatore
        Integer nuovoId = contatoreService.getNextId("inventario");
        
        // Crea l'articolo
        Inventario articolo = new Inventario();
        articolo.setId(nuovoId);
        articolo.setNome(nome);
        articolo.setCategoria(categoria);
        articolo.setQuantita(quantita);
        articolo.setPrezzoUnitario(prezzoUnitario);
        
        return inventarioRepository.save(articolo);
    }
    
    // Trova articolo per ID
    public Optional<Inventario> trovaArticoloPerId(Integer id) {
        return inventarioRepository.findById(id);
    }
    
    // Trova tutti gli articoli
    public List<Inventario> trovaTuttiGliArticoli() {
        return inventarioRepository.findAll();
    }
    
    // Trova articoli per categoria
    public List<Inventario> trovaArticoliPerCategoria(Inventario.Categoria categoria) {
        return inventarioRepository.findByCategoria(categoria);
    }
    
    // Trova articoli per nome (ricerca parziale)
    public List<Inventario> trovaArticoliPerNome(String nome) {
        return inventarioRepository.findByNomeContainingIgnoreCase(nome);
    }
    
    // Aggiorna quantità di un articolo
    public Inventario aggiornaQuantita(Integer id, Integer nuovaQuantita) {
        Inventario articolo = inventarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Articolo non trovato con ID: " + id));
        
        articolo.setQuantita(nuovaQuantita);
        return inventarioRepository.save(articolo);
    }
    
    // Aggiorna prezzo di un articolo
    public Inventario aggiornaPrezzo(Integer id, Double nuovoPrezzo) {
        Inventario articolo = inventarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Articolo non trovato con ID: " + id));
        
        articolo.setPrezzoUnitario(nuovoPrezzo);
        return inventarioRepository.save(articolo);
    }
    

    // Aggiorna tutti i campi di un articolo
    public Inventario aggiornaArticolo(Integer id, String nome, Inventario.Categoria categoria, Integer quantita, Double prezzoUnitario) {
        Inventario articolo = inventarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Articolo non trovato con ID: " + id));

        articolo.setNome(nome);
        articolo.setCategoria(categoria);
        articolo.setQuantita(quantita);
        articolo.setPrezzoUnitario(prezzoUnitario);
        return inventarioRepository.save(articolo);
    }

    // Elimina articolo
    public void eliminaArticolo(Integer id) {
        if (!inventarioRepository.existsById(id)) {
            throw new RuntimeException("Articolo non trovato con ID: " + id);
        }
        inventarioRepository.deleteById(id);
    }
}