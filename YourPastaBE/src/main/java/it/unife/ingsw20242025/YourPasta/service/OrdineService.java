
package it.unife.ingsw20242025.YourPasta.service;
import it.unife.ingsw20242025.YourPasta.repository.OrdineItemRepository;
import it.unife.ingsw20242025.YourPasta.model.Ordine;
import it.unife.ingsw20242025.YourPasta.model.Utente;
import it.unife.ingsw20242025.YourPasta.repository.UtenteRepository;
import it.unife.ingsw20242025.YourPasta.repository.OrdineRepository;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrdineService {
    private final OrdineRepository ordineRepository;
    private final ContatoreService contatoreService;
    private final UtenteService utenteService;
    private final OrdineItemRepository ordineItemRepository;
    private final UtenteRepository utenteRepository;
        private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    // Sconto del 20% per gli studenti
    private static final double SCONTO_STUDENTE_PERCENTUALE = 20.0;

    // Costruttore
    public OrdineService(OrdineRepository ordineRepository, ContatoreService contatoreService, UtenteService utenteService, OrdineItemRepository ordineItemRepository, UtenteRepository utenteRepository) {
        this.ordineRepository = ordineRepository;
        this.contatoreService = contatoreService;
        this.utenteService = utenteService;
        this.ordineItemRepository = ordineItemRepository;
        this.utenteRepository = utenteRepository;
    }



    
    // Ricalcola il prezzo totale dell'ordine e aggiorna i punti utente
    public void ricalcolaPrezzoTotaleOrdine(Integer ordineId) {
        Ordine ordine = ordineRepository.findById(ordineId).orElseThrow(() -> new EntityNotFoundException("Ordine not found"));
        Double totaleOriginale = ordineItemRepository.findByOrdineId(ordineId)
                .stream()
                .mapToDouble(item -> item.getPrezzo() * item.getQuantita())
                .sum();
        

        // Applica sconto del 20% se l'utente è uno studente
        Double totaleFinale = totaleOriginale;
        try {
            Optional<Utente> utenteOpt = utenteService.trovaUtentePerId(ordine.getUtenteId());
            if (utenteOpt.isPresent()) {
                Utente utente = utenteOpt.get();
                if (utente.getRuolo() == Utente.Ruolo.studente) {
                    totaleFinale = totaleOriginale * (100.0 - SCONTO_STUDENTE_PERCENTUALE) / 100.0;
                }
                
                // Verifica se è il primo ordine dell'utente (sconto 10%)
                List<Ordine> ordiniPrecedenti = trovaOrdiniPerUtente(utente.getId());
                // Esclude l'ordine corrente dal conteggio
                long ordiniCompletati = ordiniPrecedenti.stream()
                    .filter(o -> !o.getId().equals(ordineId))
                    .count();
                
                if (ordiniCompletati == 0) {
                    // È il primo ordine, applica sconto aggiuntivo del 10%
                    totaleFinale = totaleFinale * 0.9;
                }
            }
        } catch (Exception e) {
            // Se non riusciamo a recuperare l'utente, manteniamo il prezzo originale
            System.err.println("Errore nel recupero utente per ordine " + ordineId + ": " + e.getMessage());
        }

        // Applica lo sconto legato ai punti (ogni 100 punti = 10% di sconto, 200 punti = 20% etc)
        try {
            Utente utente = utenteService.trovaUtentePerId(ordine.getUtenteId())
                    .orElseThrow(() -> new EntityNotFoundException("Utente not found"));
            Integer puntiUtente = utente.getPunti();
            int decineDiPunti = puntiUtente / 100; // Ogni 100 punti
            if (decineDiPunti > 0) {
                double scontoPuntiPercentuale = decineDiPunti * 10.0; 
                totaleFinale = totaleFinale * (100.0 - scontoPuntiPercentuale) / 100.0;

                // Se lo sconto viene applicato togliamo i punti usati all'utente
                utente = utenteService.aggiornaPunti(ordine.getUtenteId(), -decineDiPunti * 100);
                utenteRepository.save(utente);
            }
        } catch (Exception e) {
            // Se non riusciamo a recuperare i punti, manteniamo il prezzo calcolato finora
            System.err.println("Errore nel recupero punti utente per ordine " + ordineId + ": " + e.getMessage());
        }
        
        ordine.setPrezzoTotale(totaleFinale);
        
        // Calcola i punti da assegnare: 1 punto per ogni euro speso (arrotonda per difetto)
        Integer puntiDaAssegnare = (int) Math.floor(totaleFinale);
        ordine.setPunti(puntiDaAssegnare);

        ordineRepository.save(ordine);
    }

    // Crea un nuovo ordine seguendo lo stile di UtenteService
    // Crea un nuovo ordine, i punti vengono calcolati dal BE
    public Ordine creaOrdine(Integer utenteId, Double prezzoTotale, Integer nTavolo, String note, Ordine.Status status, boolean isDelivery) {
    Integer nuovoId = contatoreService.getNextId("ordine");
    Ordine ordine = new Ordine();
    ordine.setId(nuovoId);
    ordine.setUtenteId(utenteId);
    ordine.setDataOrdine(LocalDateTime.now());
    ordine.setPrezzoTotale(prezzoTotale);
    ordine.setNTavolo(nTavolo);
    ordine.setNote(note);
    ordine.setPunti((int) Math.floor(prezzoTotale));
    ordine.setStatus(status);
    ordine.setDelivery(isDelivery);
    Ordine ordineSalvato = ordineRepository.save(ordine);
    return ordineSalvato;
    }

    public List<Ordine> trovaTuttiGliOrdini() {
        return ordineRepository.findAll();
    }

    public Optional<Ordine> trovaOrdinePerId(Integer id) {
        return ordineRepository.findById(id);
    }

    public List<Ordine> trovaOrdiniPerUtente(Integer utenteId) {
        return ordineRepository.findByUtenteId(utenteId);
    }

    public List<Ordine> trovaOrdiniPerTavolo(Integer nTavolo) {
    return ordineRepository.findBynTavolo(nTavolo);
    }

    public List<Ordine> trovaOrdiniPerStatus(Ordine.Status status) {
        return ordineRepository.findByStatus(status);
    }

    // Aggiorna lo stato di un ordine esistente e assegna punti se chiuso
    public Ordine aggiornaStatoOrdine(Integer ordineId, Ordine.Status nuovoStato) {
        Ordine ordine = ordineRepository.findById(ordineId).orElseThrow(() -> new RuntimeException("Ordine non trovato con ID: " + ordineId));
        Ordine.Status statoVecchio = ordine.getStatus();
        ordine.setStatus(nuovoStato);
        // Se l'ordine viene completato (servito o chiuso), assegna i punti all'utente
        if ((nuovoStato == Ordine.Status.chiuso) && (statoVecchio != Ordine.Status.chiuso)) {
            Integer puntiDaAssegnare = ordine.getPunti();
            if (puntiDaAssegnare > 0) {
                try {
                    utenteService.aggiornaPunti(ordine.getUtenteId(), puntiDaAssegnare);
                    System.out.println("Assegnati " + puntiDaAssegnare + " punti all'utente " + ordine.getUtenteId() + " per l'ordine " + ordineId);
                } catch (Exception e) {
                    System.err.println("Errore nell'assegnazione punti per ordine " + ordineId + ": " + e.getMessage());
                }
            }
               // Se è un ordine delivery, chiama il servizio Mockoon
               if (ordine.isDelivery()) {
                   try {
                       String url = "http://localhost:3001/api/delivery";
                       java.util.Map<String, Object> payload = new java.util.HashMap<>();
                       payload.put("ordineId", ordine.getId());
                       payload.put("utenteId", ordine.getUtenteId());
                       payload.put("prezzoTotale", ordine.getPrezzoTotale());
                       payload.put("note", ordine.getNote());
                       payload.put("dataOrdine", ordine.getDataOrdine().toString());
                       org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(url, payload, String.class);
                       System.out.println("[OrdineService] Mockoon delivery API response: " + response.getStatusCode() + " - " + response.getBody());
                   } catch (Exception e) {
                       System.err.println("[OrdineService] Errore chiamata Mockoon delivery API: " + e.getMessage());
                   }
               }
        }
        return ordineRepository.save(ordine);
    }
}