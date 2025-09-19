# 🍝 YourPasta

## Descrizione

YourPasta è un sistema di gestione per ristorante specializzato nella personalizzazione di piatti di pasta. L'applicazione è stata sviluppata come progetto per il corso di Ingegneria del Software, implementando un'architettura completa che comprende frontend, backend e database.

Il sistema permette ai clienti di creare piatti personalizzati scegliendo tra diverse categorie di ingredienti (pasta, condimenti, proteine, verdure, formaggi e topping), gestire il carrello, effettuare ordini e visualizzare lo storico. Gli amministratori possono gestire clienti, personale e inventario, mentre il personale di cucina può visualizzare e aggiornare lo stato degli ordini.

## Tecnologie Utilizzate

### Database
- **MySQL**: Sistema di gestione database relazionale per la persistenza dei dati

### Backend
- **Java 17**: Linguaggio di programmazione principale
- **Spring Boot 3.x**: Framework per lo sviluppo di applicazioni Java
- **Spring Data JPA**: Per la gestione della persistenza e delle operazioni CRUD
- **Maven**: Strumento di build e gestione delle dipendenze
- **Hibernate**: ORM (Object-Relational Mapping) per il mapping oggetti-database

### Frontend
- **Angular 19**: Framework web per lo sviluppo dell'interfaccia utente
- **TypeScript**: Linguaggio di programmazione tipizzato
- **Angular Material**: Libreria di componenti UI basata su Material Design
- **RxJS**: Libreria per la programmazione reattiva
- **SCSS**: Preprocessore CSS per gli stili

## Architettura Backend

Il backend segue il pattern architetturale **Model-View-Controller (MVC)** con la seguente struttura:

### Model
- **Entity**: Classi che rappresentano le entità del database (Utente, Ordine, Piatto, Inventario, etc.)
- **Enum**: Enumerazioni per definire stati e ruoli (Status ordini, Ruoli utenti)

### Controller
- **REST Controllers**: Gestiscono le richieste HTTP e definiscono gli endpoint API
- **Routing**: Mappatura delle richieste alle funzioni appropriate
- **Validation**: Validazione dei dati in input

### Service
- **Business Logic**: Implementazione della logica di business dell'applicazione
- **Transaction Management**: Gestione delle transazioni database
- **Data Processing**: Elaborazione e trasformazione dei dati

### Repository
- **Data Access Layer**: Interfacce per l'accesso ai dati che estendono JpaRepository
- **Custom Queries**: Query personalizzate per operazioni specifiche

### Configuration
- **Spring Configuration**: Configurazione del framework Spring
- **Database Configuration**: Configurazione della connessione al database
- **CORS Configuration**: Configurazione per le richieste cross-origin

## Architettura Frontend

Il frontend segue un'architettura modulare basata su **Components**, **Services** e **DTOs**:

### Components
- **Pages**: Componenti che rappresentano intere pagine (Home, Login, Carrello, etc.)
- **Shared Components**: Componenti riutilizzabili (Header, Footer, Dialogs)
- **Feature Components**: Componenti specifici per funzionalità (Crea Ordine, Gestione Inventario)

### Services
- **HTTP Services**: Gestione delle chiamate API al backend
- **State Management**: Gestione dello stato dell'applicazione (SessionService, CarrelloService)
- **Utility Services**: Servizi di supporto (ImageService, NotificationService)

### DTOs (Data Transfer Objects)
- **Model Classes**: Classi TypeScript che definiscono la struttura dei dati
- **Type Safety**: Garantiscono la tipizzazione forte dei dati
- **Interface Contracts**: Definiscono i contratti per lo scambio dati frontend-backend

### Routing
- **Angular Router**: Gestione della navigazione tra le pagine
- **Route Guards**: Protezione delle rotte basata sui ruoli utente
- **Lazy Loading**: Caricamento modulare dei componenti

### Styling
- **Angular Material**: Componenti UI predefiniti con Material Design
- **Custom SCSS**: Stili personalizzati per l'identità visiva dell'applicazione
- **Responsive Design**: Interfaccia adattiva per diversi dispositivi

## Funzionalità Principali

### Gestione Utenti
- Registrazione e autenticazione
- Gestione profili e ruoli (Cliente, Studente, Cuoco, Cameriere, Amministratore)
- Sistema a punti per i clienti

### Gestione Ordini
- Creazione piatti personalizzati
- Carrello della spesa
- Storico ordini
- Gestione stati ordine (Pending, In Preparazione, Pronto, Servito, Chiuso)

### Gestione Inventario
- Catalogazione ingredienti per categoria
- Controllo scorte
- Gestione prezzi

### Pannello Amministrativo
- Gestione clienti e personale
- Monitoraggio ordini
- Gestione inventario

### Area Cucina
- Visualizzazione ordini in tempo reale
- Aggiornamento stati preparazione
- Gestione tavoli

## Installazione e Avvio

### Prerequisiti
- Java 17 o superiore
- Node.js 18 o superiore
- MySQL 8.0 o superiore
- Maven 3.6 o superiore

### Backend
```bash
cd YourPastaBE
mvn clean install
mvn spring-boot:run
```

### Frontend
```bash
cd IngSW2025-FE
npm install
ng serve
```

### Database
Configurare MySQL e aggiornare le credenziali nel file `application.properties` del backend.

## API Endpoints

Il backend espone RESTful APIs per:
- `/api/utenti` - Gestione utenti
- `/api/ordini` - Gestione ordini
- `/api/piatti` - Gestione piatti
- `/api/inventario` - Gestione inventario
- `/api/ordine-items` - Gestione items degli ordini

## Autori

Sviluppato per il corso di Ingegneria del Software - Università di Ferrara - Sistema di Gestione Ristorante

Un sistema completo per la gestione di un ristorante di pasta con ordinazioni personalizzate.

## 🍝 Descrizione del Progetto

YourPasta è un'applicazione full-stack che permette ai clienti di creare ordini personalizzati di pasta e bevande, con gestione automatica di scorte, prezzi e classificazione degli ordini.

## 🏗️ Architettura

### Backend (YourPastaBE)
- **Framework**: Spring Boot 3.5.3
- **Database**: MySQL 8.0
- **Build Tool**: Gradle
- **Port**: 8080

### Frontend (IngSW2025-FE)
- **Framework**: Angular 19.2.0
- **UI Library**: Angular Material
- **Package Manager**: npm
- **Port**: 4200

## ✨ Funzionalità Principali

### 🛒 Sistema di Ordinazione Unificato
- Carrello unico per piatti personalizzati e bevande
- Classificazione automatica PIATTO/BEVANDA
- Calcolo automatico dei prezzi con sconti studenti

### 🖼️ Gestione Immagini Ottimizzata
- Immagini prodotti ottimizzate per web (~800px)
- Sistema di fallback per immagini mancanti
- Supporto per multiple varianti nomi dal database

### 👤 Gestione Utenti e Ruoli
- Sistema login/registrazione
- Ruoli: admin, cliente, studente, cuoco, cameriere
- Sconto automatico 20% per studenti

### 📊 Gestione Inventario
- Categorizzazione automatica ingredienti
- Controllo disponibilità scorte
- Gestione prezzi centralizzata

## 🚀 Come Avviare il Progetto

### Prerequisiti
- Java 17+
- Node.js 18+
- MySQL 8.0
- npm

### Backend
```bash
cd YourPastaBE
./gradlew bootRun
```

### Frontend
```bash
cd IngSW2025-FE
npm install
npm start
```

## 🔧 Configurazione Database

1. Creare database MySQL chiamato `yourpasta`
2. Configurare credenziali in `YourPastaBE/src/main/resources/application.properties`
3. Le tabelle vengono create automaticamente da Hibernate


## 👨‍💻 Sviluppato da

Imane  Taoufik Allah
Giorgio Bianchini
Elena Loshi