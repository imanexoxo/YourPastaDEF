package it.unife.ingsw20242025.YourPasta.service;

import it.unife.ingsw20242025.YourPasta.model.OrdineItem;
import it.unife.ingsw20242025.YourPasta.repository.OrdineItemRepository;
import it.unife.ingsw20242025.YourPasta.repository.InventarioRepository;
import it.unife.ingsw20242025.YourPasta.repository.PiattoRepository;
import it.unife.ingsw20242025.YourPasta.repository.PiattoItemRepository;
import it.unife.ingsw20242025.YourPasta.model.Inventario;
import it.unife.ingsw20242025.YourPasta.model.Piatto;
import it.unife.ingsw20242025.YourPasta.model.PiattoItem;

// import org.hibernate.cache.spi.support.AbstractReadWriteAccess.Item;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * SERVIZIO GESTIONE ORDINE ITEMS - Sistema unificato con classificazione automatica PIATTO/BEVANDA
 * 
 * FUNZIONAMENTO ATTUALE:
 * - Gestisce la creazione di item all'interno degli ordini (sia ingredienti che bevande)
 * - Classifica automaticamente ogni item come PIATTO o BEVANDA basandosi sulla categoria inventario
 * - Calcola prezzi e gestisce ricalcolo automatico del totale ordine
 * - Fornisce metodi separati per recuperare piatti e bevande di un ordine
 * 
 * CLASSIFICAZIONE AUTOMATICA:
 * - Inventario.Categoria.bevande → OrdineItem.TipoItem.BEVANDA
 * - Tutte le altre categorie → OrdineItem.TipoItem.PIATTO
 * 
 * GESTIONE PREZZI:
 * - Tutti i prezzi sono centralizzati nell'inventario
 * - Calcolo automatico: prezzoUnitario * quantità = prezzoTotale item
 * - Ricalcolo automatico del prezzo totale ordine ad ogni inserimento
 */

@Service
public class OrdineItemService {
    private final OrdineItemRepository ordineItemRepository;
    private final InventarioRepository inventarioRepository;
    private final PiattoRepository piattoRepository;
    private final ContatoreService contatoreService;
    private final PiattoItemService piattoItemService;
    private final PiattoItemRepository piattoItemRepository;

    public OrdineItemService(OrdineItemRepository ordineItemRepository, InventarioRepository inventarioRepository, PiattoRepository piattoRepository, PiattoItemRepository piattoItemRepository, ContatoreService contatoreService, PiattoItemService piattoItemService) {
        this.ordineItemRepository = ordineItemRepository;
        this.inventarioRepository = inventarioRepository;
        this.piattoRepository = piattoRepository;
        this.piattoItemRepository = piattoItemRepository;
        this.contatoreService = contatoreService;
        this.piattoItemService = piattoItemService;
    }
    // IMPLEMENTAZIONE PREZZO UNIFICATO

    // **** ERRORE !!!!! *****
    // Non è vero che tutti gli item sono in inventario, le bevande lo sono mentre i piatti si trovano nella tabella piatto
    // Quindi questo metodo va bene per le bevande ma non per i piatti
    // --> CORRETTO IN MODO CHE SELEZIONI IL PREZZO DALLA TABELLA GIUSTA

    // Recupera il prezzo unitario: tutti gli item sono in inventario
    // Nel nostro design, PIATTO include ingredienti (pasta, sugo, etc.) e BEVANDA include bevande
    // Tutti i prezzi sono memorizzati in inventario
    // NOTA: Questo semplifica la gestione prezzi centralizzando tutto nell'inventario
    private double getPrezzoUnitario(Integer itemId, OrdineItem.TipoItem tipoItem) {
        if (tipoItem == OrdineItem.TipoItem.BEVANDA) {
            return inventarioRepository.findById(itemId)
                .map(Inventario::getPrezzoUnitario)
                .orElseThrow(() -> new RuntimeException("Item non trovato in inventario con id: " + itemId));
        } else {
            // Per i piatti, dobbiamo cercare nella tabella piatto
            return piattoRepository.findById(itemId)
                .map(Piatto::getPrezzo)
                .orElseThrow(() -> new RuntimeException("Item non trovato in inventario con id: " + itemId));
        }
    }

    // METODO PRINCIPALE - CLASSIFICAZIONE AUTOMATICA
    // Crea un nuovo OrdineItem con id generato e prezzo calcolato (sia per item inventario che piatto)
    // Il tipo viene determinato automaticamente dalla categoria dell'inventario
    // EVOLUZIONE: Prima il frontend doveva specificare manualmente il tipo, ora è automatico

    // CORREZIONE
    // itemId può rappresentare l'id di un piatto (quindi l'id che lo identifica nell'entità piatto) o di una bevanda (l'id che la identifica nell'inventario)
    public OrdineItem creaOrdineItem(Integer ordineId, Integer itemId, Integer quantita) {
        Integer nuovoId = contatoreService.getNextId("ordine_item");
        OrdineItem ordineItem = new OrdineItem();
        ordineItem.setId(nuovoId);
        ordineItem.setOrdineId(ordineId);
        ordineItem.setItemId(itemId);
        ordineItem.setQuantita(quantita);

        // Determiniamo il valore dell'attributo tipoItem che ci dirà se cercare nella tabella piatto o inventario
        OrdineItem.TipoItem tipoItem = determinaTipoItem(itemId);
        ordineItem.setTipoItem(tipoItem);

        
        // Aggiorniamo le quantità in inventario
        // Se l'item è una bevanda
        if (tipoItem == OrdineItem.TipoItem.BEVANDA) {
            Inventario inventario = inventarioRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item non trovato in inventario con id: " + itemId));
            int nuovaQuantita = inventario.getQuantita() - quantita;
            if (nuovaQuantita < 0) {
                throw new RuntimeException("Quantità insufficiente in inventario per l'item id: " + itemId);
            }
            inventario.setQuantita(nuovaQuantita);
            inventarioRepository.save(inventario);
        }


        // Se l'item è un piatto
        if (tipoItem == OrdineItem.TipoItem.PIATTO) {
            // recuperiamo tutti i piattoItems associati a questo piatto
            List<PiattoItem> piattoItems = this.piattoItemRepository
                .findByPiattoId(itemId);

            // Aggiorno la quantità di ogni ingrediente in inventario
            for (PiattoItem piattoItem : piattoItems) {
                Integer ingredienteId = piattoItem.getIngredienteId();
                Integer quantitaNecessaria = piattoItem.getQuantita() * quantita; // moltiplichiamo per la quantità di piatti ordinati

                Inventario inventario = inventarioRepository.findById(ingredienteId)
                    .orElseThrow(() -> new RuntimeException("Ingrediente non trovato in inventario con id: " + ingredienteId));

                int nuovaQuantita = inventario.getQuantita() - quantitaNecessaria;
                if (nuovaQuantita < 0) {
                    throw new RuntimeException("Quantità insufficiente in inventario per l'ingrediente id: " + ingredienteId);
                }
                inventario.setQuantita(nuovaQuantita);
                inventarioRepository.save(inventario);
            }
        }
        
        
        
        
        double prezzoUnitario = getPrezzoUnitario(itemId, tipoItem);
        double prezzoTotale = prezzoUnitario * quantita;
        ordineItem.setPrezzo(prezzoTotale);
        OrdineItem salvato = ordineItemRepository.save(ordineItem);
        // Ricalcola il prezzo totale dell'ordine dopo ogni inserimento
        return salvato;
    }

    // Metodo helper per determinare il tipo di item (PIATTO o BEVANDA) basandosi sulla categoria inventario
    // NOTA In questo modo non c'è bisogno di cambiare gli id degli ingredienti nell'inventario
    /* 
     *  Perché non lanciamo un'eccezione quando l'ID non è trovato nell'inventario:
        Architettura del database: I piatti personalizzati hanno ID nella tabella piatto, mentre bevande e ingredienti singoli hanno ID nella tabella inventario

        Caso normale: È normale che un piatto personalizzato (ID 1007) non esista nell'inventario - questo non è un errore, ma il comportamento previsto

        Logica di determinazione:

        ID trovato nell'inventario + categoria "bevande" = BEVANDA
        ID trovato nell'inventario + altra categoria = PIATTO (ingrediente singolo)
        ID NON trovato nell'inventario = PIATTO (piatto personalizzato)
        Perché il vecchio codice falliva: Lanciava un'eccezione pensando che fosse un errore, ma in realtà è il caso normale per i piatti personalizzati

        Il commento ora documenta chiaramente questa logica e spiega perché usiamo .orElse(PIATTO) invece di .orElseThrow().
     */
    private OrdineItem.TipoItem determinaTipoItem(Integer itemId) {
        return inventarioRepository.findById(itemId)
            .map(inventario -> {
                Inventario.Categoria categoria = inventario.getCategoria();
                if (Inventario.Categoria.bevande.equals(categoria)) {
                    return OrdineItem.TipoItem.BEVANDA;
                } else {
                    return OrdineItem.TipoItem.PIATTO;
                }
            })
            .orElse(OrdineItem.TipoItem.PIATTO); // Se non trovato nell'inventario, è un piatto personalizzato
    }





    // ***** QUESTO METODO NON HA SENSO *****

    // Nuovo metodo per creare OrdineItem con tipo specificato
    // USO: Quando il frontend vuole forzare un tipo specifico invece della classificazione automatica
    // PARAMETRI: Include tipoItem esplicito che sovrascrive la determinazione automatica
    /* 
        public OrdineItem creaOrdineItem(Integer ordineId, Integer itemId, Integer quantita, OrdineItem.TipoItem tipoItem) {
        Integer nuovoId = contatoreService.getNextId("ordine_item");
        OrdineItem ordineItem = new OrdineItem();
        ordineItem.setId(nuovoId);
        ordineItem.setOrdineId(ordineId);
        ordineItem.setItemId(itemId);
        ordineItem.setQuantita(quantita);
        ordineItem.setTipoItem(tipoItem);
        double prezzoUnitario = getPrezzoUnitario(itemId, tipoItem);
        double prezzoTotale = prezzoUnitario * quantita;
        ordineItem.setPrezzo(prezzoTotale);
        OrdineItem salvato = ordineItemRepository.save(ordineItem);
        // Ricalcola il prezzo totale dell'ordine dopo ogni inserimento
        ordineService.ricalcolaPrezzoTotaleOrdine(ordineId);
        return salvato;
    }
    */


    // Metodi per separare piatti e bevande
    // SCOPO: Permettono di recuperare solo una tipologia di item da un ordine misto
    // USO FRONTEND: Per mostrare sezioni separate nell'UI (es. "I tuoi piatti" / "Le tue bevande")
    // USO CUCINA: Per vedere solo gli item che richiedono preparazione vs quelli già pronti
    public List<OrdineItem> trovaPiattiPerOrdine(Integer ordineId) {
        return ordineItemRepository.findByOrdineIdAndTipoItem(ordineId, OrdineItem.TipoItem.PIATTO);
    }

    public List<OrdineItem> trovaBevandePerOrdine(Integer ordineId) {
        return ordineItemRepository.findByOrdineIdAndTipoItem(ordineId, OrdineItem.TipoItem.BEVANDA);
    }

    // METODO COMPLETO: Recupera tutti gli item dell'ordine senza distinzione di tipo
    // USO: Per calcoli totali, stampa scontrino completo, vista amministratore
    public List<OrdineItem> trovaItemPerOrdine(Integer ordineId) {
        return ordineItemRepository.findByOrdineId(ordineId);
    }

    // METODO UTILITÀ: Salvataggio generico per aggiornamenti manuali
    // USO: Quando si modificano item esistenti (es. correzione quantità, prezzo)
    public OrdineItem salvaOrdineItem(OrdineItem ordineItem) {
        return ordineItemRepository.save(ordineItem);
    }
}