FILE PER RACCOGLIERE GLI APPUNTI DEL BACKEND

*********************************************************************************************************************

OPTIONAL

Cos'è un Optional?

Un Optional è una classe contenitore introdotta in Java 8 che può contenere o non contenere un valore non-null. 
È stato progettato per rappresentare in modo esplicito l'assenza di un valore, sostituendo l'uso di riferimenti null 
che spesso causano NullPointerException.

Caratteristiche principali

- Sicurezza: Riduce drasticamente i NullPointerException
- Espressività: Rende esplicito quando un valore può essere assente
- Funzionale: Fornisce metodi per operazioni funzionali sui valori

Creazione di Optional

Optional vuoto:
Optional<String> empty = Optional.empty();

Optional con valore:
Optional<String> value = Optional.of("Hello");

Optional che può essere null:
Optional<String> nullable = Optional.ofNullable(getString());

Metodi principali

Controllo presenza:
- isPresent(): restituisce true se il valore è presente
- isEmpty(): restituisce true se il valore è assente (Java 11+)

Accesso al valore:
- get(): restituisce il valore (lancia eccezione se assente)
- orElse(T other): restituisce il valore o un valore di default
- orElseGet(Supplier<T>): restituisce il valore o il risultato di una funzione
- orElseThrow(): restituisce il valore o lancia un'eccezione

Operazioni funzionali:
- map(Function<T,R>): trasforma il valore se presente usando la funzione tra parentesi
- flatMap(Function<T,Optional<R>>): trasforma e appiattisce
- filter(Predicate<T>): filtra il valore con una condizione

Esempi pratici

Invece di controlli null:
User user = userService.findById(id);
if (user != null) {
    String email = user.getEmail();
    if (email != null) {
        sendEmail(email);
    }
}

Con Optional:
userService.findById(id)
    .map(User::getEmail)
    .ifPresent(this::sendEmail);

OSS User::getEmail è un modo per riferire al metodo getEmail definito nella classe User
    this::sendEmail() è un modo per riferire il metodo di istanza su un oggetto specifico

DIFFERENZE
// Con String::length
// Java dice: "Quando ricevi una String, chiama length() SU QUELLA String"
String::length  → s -> s.length()

// Con this::sendEmail  
// Java dice: "Quando ricevi un parametro, chiama sendEmail() sull'oggetto THIS"
this::sendEmail → email -> this.sendEmail(email)


EQUIVALENZE
// Tutti questi sono equivalenti:

// 1. Method reference su oggetto specifico
list.forEach(this::sendEmail);

// 2. Lambda expression
list.forEach(email -> this.sendEmail(email));

// 3. Metodo tradizionale
for (String email : list) {
    this.sendEmail(email);
}




Best Practices

1. Non usare Optional.get() senza controlli
2. Usare Optional nei return type dei metodi che potrebbero non restituire valori
3. Non usare Optional per campi di classe (preferire null)
4. Non usare Optional per parametri di metodo
5. Preferire orElse() a orElseGet() solo per valori costanti

Vantaggi

- Codice più sicuro e leggibile
- Riduzione dei bug legati ai null
- Migliore documentazione dell'API
- Supporto per programmazione funzionale

Quando usare Optional

- Return type di metodi che potrebbero non trovare risultati
- Risultati di operazioni di ricerca/query
- Valori di configurazione opzionali
- Chain di