package it.unife.ingsw20242025.YourPasta.model;

import jakarta.persistence.*; // importa tutte le annotazioni JPA per mapping oggetto-relazione
import lombok.Data; // genera automaticamente getter, setter, toString, equals e hashcode
import lombok.NoArgsConstructor; // genera un costruttore senza parametri
import lombok.AllArgsConstructor;  // genera automaticamente un costruttore con tutti i parametri

import java.time.LocalDate; // Importa la classe LocalDate per gestire le date senza orario

@Entity // dice a JPA che questa classe e una entita e rappresenta una tabella del DB
@Table(name = "utente")
@Data //genera automaticamente getter, setter, toString, equals e hashcode
@NoArgsConstructor //genera un costruttore vuoto public Utente() {}
@AllArgsConstructor //genera un costruttore con tutti i campi

public class Utente {
    
    @Id //marca questo campo come chiave primaria della tabella
    @Column(name = "id")
    private Integer id; // ID generato dal ContatoreService
    
    @Column(name = "nome", nullable = false, length = 50)
    private String nome;
    
    @Column(name = "cognome", nullable = false, length = 50)
    private String cognome;
    
    @Column(name = "username", unique = true, nullable = false, length = 30)
    private String username; // Deve essere unico
    
    @Column(name = "password", nullable = false, length = 100)
    private String password;
    
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email; // Deve essere unico
    
    @Column(name = "data_nascita")
    private LocalDate dataNascita;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "ruolo", nullable = false)
    private Ruolo ruolo;
    
    @Column(name = "punti", nullable = false)
    private Integer punti = 0; // Inizia sempre con 0 punti
    
    @Column(name = "bloccato", nullable = false)
    private Boolean bloccato = false; // Utente attivo di default
    
    // Enum per i ruoli possibili
    public enum Ruolo {
        admin,
        cliente, 
        studente,
        cuoco,
        cameriere
    }
}