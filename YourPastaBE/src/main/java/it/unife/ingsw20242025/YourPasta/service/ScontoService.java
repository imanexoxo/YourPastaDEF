package it.unife.ingsw20242025.YourPasta.service;

import it.unife.ingsw20242025.YourPasta.model.Utente;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ScontoService {
    
    @Value("${yourpasta.sconto.studente:10.0}")
    private Double scontoStudentePercentuale;
    
    private final UtenteService utenteService;
    
    public ScontoService(UtenteService utenteService) {
        this.utenteService = utenteService;
    }
    
    /**
     * Calcola il prezzo finale applicando eventuali sconti basati sul ruolo utente
     * @param prezzoOriginale prezzo originale senza sconti
     * @param utenteId ID dell'utente per verificare il ruolo
     * @return prezzo finale con sconto applicato
     */
    public Double calcolaPrezzoConSconto(Double prezzoOriginale, Integer utenteId) {
        if (prezzoOriginale == null || utenteId == null) {
            return prezzoOriginale;
        }
        
        Utente utente = utenteService.trovaUtentePerId(utenteId).orElse(null);
        if (utente == null) {
            return prezzoOriginale;
        }
        
        return calcolaPrezzoConSconto(prezzoOriginale, utente.getRuolo());
    }
    
    /**
     * Calcola il prezzo finale applicando eventuali sconti basati sul ruolo
     * @param prezzoOriginale prezzo originale senza sconti
     * @param ruolo ruolo dell'utente
     * @return prezzo finale con sconto applicato
     */
    public Double calcolaPrezzoConSconto(Double prezzoOriginale, Utente.Ruolo ruolo) {
        if (prezzoOriginale == null || ruolo == null) {
            return prezzoOriginale;
        }
        
        switch (ruolo) {
            case studente:
                return applicaScontoStudente(prezzoOriginale);
            case cliente:
            case admin:
            case cuoco:
            case cameriere:
            default:
                return prezzoOriginale;
        }
    }
    
    /**
     * Applica lo sconto studente al prezzo
     * @param prezzoOriginale prezzo senza sconto
     * @return prezzo con sconto studente applicato
     */
    private Double applicaScontoStudente(Double prezzoOriginale) {
        double moltiplicatore = (100.0 - scontoStudentePercentuale) / 100.0;
        return prezzoOriginale * moltiplicatore;
    }
    
    /**
     * Calcola l'importo dello sconto per un determinato ruolo
     * @param prezzoOriginale prezzo originale
     * @param ruolo ruolo dell'utente
     * @return importo dello sconto
     */
    public Double calcolaImportoSconto(Double prezzoOriginale, Utente.Ruolo ruolo) {
        if (prezzoOriginale == null || ruolo == null) {
            return 0.0;
        }
        
        Double prezzoConSconto = calcolaPrezzoConSconto(prezzoOriginale, ruolo);
        return prezzoOriginale - prezzoConSconto;
    }
    
    /**
     * Verifica se un utente ha diritto allo sconto
     * @param ruolo ruolo dell'utente
     * @return true se ha diritto allo sconto
     */
    public Boolean hasDirittoSconto(Utente.Ruolo ruolo) {
        return ruolo == Utente.Ruolo.studente;
    }
    
    /**
     * Ottiene la percentuale di sconto per gli studenti
     * @return percentuale sconto studenti
     */
    public Double getScontoStudentePercentuale() {
        return scontoStudentePercentuale;
    }
}
