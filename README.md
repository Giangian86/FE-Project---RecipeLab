# RecipeLab

RecipeLab è una web app sviluppata con React e Vite dedicata alla gestione e consultazione di ricette.

L'applicazione permette agli utenti di esplorare un catalogo di ricette, filtrare i contenuti, salvare ricette tra i preferiti, pubblicare recensioni e creare un piano giornaliero dei pasti. Inoltre, prevede un'area amministratore protetta, dalla quale è possibile gestire ricette e utenti.

Il progetto è stato realizzato come applicazione React completa, con routing, stato globale tramite Redux Toolkit, chiamate asincrone a una API locale con JSON Server e interfaccia responsive.

---

## Indice

- [Obiettivo del progetto](#obiettivo-del-progetto)
- [Funzionalità principali](#funzionalità-principali)
- [Ruoli utente](#ruoli-utente)
- [Pagine dell'applicazione](#pagine-dellapplicazione)
- [Tecnologie utilizzate](#tecnologie-utilizzate)
- [Struttura del progetto](#struttura-del-progetto)
- [Installazione e avvio](#installazione-e-avvio)
- [Credenziali di test](#credenziali-di-test)
- [API locale e database](#api-locale-e-database)
- [Aspetti tecnici rilevanti](#aspetti-tecnici-rilevanti)
- [Note per la consegna](#note-per-la-consegna)

---

## Obiettivo del progetto

L'obiettivo di RecipeLab è simulare una piattaforma di ricette con due modalità di utilizzo:

1. **utente normale**, che può consultare il catalogo, salvare preferiti, recensire ricette e organizzare un piano giornaliero;
2. **admin**, che può gestire il catalogo ricette e consultare le schede degli utenti registrati.

Il progetto è pensato per dimostrare l'utilizzo coordinato di:

- componenti React riutilizzabili;
- routing con pagine pubbliche, protette e dinamiche;
- Redux Toolkit per la gestione dello stato globale;
- chiamate asincrone tramite `createAsyncThunk`;
- form controllati con validazione;
- API locale basata su JSON Server;
- responsive design per desktop, tablet e mobile.

---

## Funzionalità principali

### Area pubblica

- Homepage con hero introduttiva.
- Carosello di ricette in evidenza.
- Catalogo ricette con ricerca, filtri e paginazione.
- Pagina dettaglio ricetta con ingredienti, passaggi e recensioni.
- Pagina di login.

### Area utente

- Dashboard personale.
- Visualizzazione del profilo utente.
- Bio personale modificabile e salvata nel database.
- Salvataggio e rimozione ricette dai preferiti.
- Creazione di recensioni.
- Creazione e gestione del piano giornaliero dei pasti.

### Area admin

- Dashboard admin.
- Archivio ricette con paginazione.
- Creazione, modifica ed eliminazione delle ricette.
- Eliminazione coerente delle recensioni collegate a una ricetta eliminata.
- Gestione utenti.
- Scheda dettaglio utente con:
  - avatar iniziale del nome;
  - data di registrazione;
  - bio;
  - statistiche;
  - recensioni pubblicate;
  - numero di preferiti;
  - numero di piani giornalieri creati.

---

## Ruoli utente

L'applicazione prevede due ruoli:

| Ruolo   | Descrizione 
|---------|----------------------------------------------------------------------------------------|
| `user`  | Può usare il catalogo, salvare preferiti, recensire ricette e creare piani giornalieri.|
| `admin` | Può gestire ricette e utenti tramite area amministrativa protetta.                     |

La gestione del login è simulata tramite JSON Server. Le password sono presenti nel file `db.json` solo per finalità didattiche.

---

## Pagine dell'applicazione

| Percorso                   | Descrizione                                        |
|----------------------------|----------------------------------------------------|
| `/`                        | Homepage con hero e ricette in evidenza            |
| `/login`                   | Pagina di accesso                                  |
| `/recipes`                 | Archivio ricette con ricerca, filtri e paginazione |
| `/recipes/:id`             | Dettaglio dinamico della singola ricetta           |
| `/dashboard`               | Dashboard personale diversa per user e admin       |
| `/planner`                 | Piano giornaliero protetto                         |
| `/admin/recipes`           | Archivio ricette admin                             |
| `/admin/recipes/new`       | Creazione nuova ricetta                            |
| `/admin/recipes/:id/edit`  | Modifica ricetta esistente                         |
| `/admin/users`             | Gestione utenti admin                              |
| `/admin/users/:id`         | Scheda dettaglio utente                            |
| `*`                        | Pagina 404                                         |

---

## Tecnologie utilizzate

- **React**
- **Vite**
- **React Router**
- **Redux Toolkit**
- **React Redux**
- **Redux Thunk tramite `createAsyncThunk`**
- **JSON Server**
- **Bootstrap**
- **CSS custom responsive**

---

## Struttura del progetto

RecipeLab /
├─ db.json
├─ package.json
├─ package-lock.json
├─ index.html
├─ README.md
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ styles.css
│  ├─ components/
│  ├─ pages/
│  ├─ store/
│  ├─ config/
│  └─ utils/
```

### Cartelle principali

| Cartella/File     | Funzione                             |
|-------------------|--------------------------------------|
| `src/main.jsx`    | Entry point dell'app React           |
| `src/App.jsx`     | Definizione principale delle route   |
| `src/components/` | Componenti riutilizzabili            |
| `src/pages/`      | Pagine dell'applicazione             |
| `src/store/`      | Redux store e slice                  |
| `src/config/`     | Configurazione API                   |
| `src/utils/`      | Funzioni di utilità                  |
| `src/styles.css`  | Stili custom e responsive            |
| `db.json`         | Database locale usato da JSON Server |

---

## Installazione e avvio

- Aprire il terminale integrato:

Terminal > New Terminal

- Controllare di essere nella cartella corretta:

ls

Il comando deve mostrare file come:

package.json
src
db.json

- Installare le dipendenze:

npm install

- Avviare contemporaneamente frontend React e API JSON Server:

npm start

- Aprire l'app nel browser:

http://127.0.0.1:5173

Indirizzi utili:

App React: http://127.0.0.1:5173
API JSON Server: http://127.0.0.1:3001

---

## Credenziali di test

### Utente normale

Email: foodie@example.com
Password: foodie123

### Admin

Email: admin@example.com
Password: admin123

---

## API locale e database

Il file `db.json` simula un piccolo database locale.

Le risorse principali sono:

users
recipes
reviews
favorites
mealPlans

La persistenza dei dati riguarda anche:

- preferiti;
- recensioni;
- piano giornaliero;
- bio utente;
- ricette create o modificate dall'admin.

---

## Aspetti tecnici rilevanti

### React Router

Il progetto usa React Router per gestire:

- pagine pubbliche;
- pagine protette;
- route admin;
- route dinamiche, per esempio `/recipes/:id`;
- pagina 404.

Sono presenti anche controlli sui ruoli, così alcune sezioni sono accessibili solo agli utenti autenticati o agli admin.

### Redux Toolkit

Lo stato globale è gestito con Redux Toolkit.

Sono presenti slice dedicati per:

- autenticazione;
- ricette;
- recensioni;
- preferiti;
- piano giornaliero;
- utenti.

Le chiamate asincrone verso JSON Server sono gestite con `createAsyncThunk`.

### Form controllati

Il progetto include diversi form controllati, per esempio:

- login;
- creazione e modifica ricetta;
- recensione;
- piano giornaliero;
- modifica bio profilo.

Ogni form mantiene i valori nello stato React e gestisce controlli o validazioni prima dell'invio.

### CRUD admin

L'admin può:

- creare nuove ricette;
- modificare ricette esistenti;
- eliminare ricette;
- visualizzare utenti e relative schede.

Quando una ricetta viene eliminata, vengono rimossi anche i dati collegati non più coerenti, come recensioni e preferiti associati.

### Responsive design

Il layout è stato adattato per:

- desktop;
- tablet;
- mobile.

Sono stati curati:

- navbar con menu a scomparsa;
- carosello homepage con numero di card diverso in base alla larghezza;
- archivio ricette con paginazione differenziata;
- tabelle admin con scroll interno;
- card e dashboard più leggibili su schermi piccoli.

---

## Possibili sviluppi futuri

- integrazione con un backend reale e database persistente;
- autenticazione reale con password criptate;
- caricamento immagini ricette da file, invece dell'inserimento tramite URL;
- possibilità per gli utenti di creare e pubblicare le proprie ricette;
- sistema di approvazione delle ricette da parte dell'admin;
- salvataggio di piani settimanali oltre al piano giornaliero;
- lista della spesa generata automaticamente dalle ricette selezionate;
- notifiche o promemoria per i pasti pianificati;
- miglioramento del profilo utente con avatar caricato localmente, preferenze alimentari e statistiche personali;
- dashboard admin più avanzata con grafici, ricette più recensite e utenti più attivi;

## Area Social&Community

Possibili funzionalità social:

- feed pubblico con post degli utenti e degli chef;
- possibilità di mettere like ai post;
- commenti sotto i post;
- profili chef verificati;
- follow tra utenti e chef;
- salvataggio dei post preferiti;
- pubblicazione di foto dei piatti realizzati dagli utenti;
- notifiche per nuovi post, commenti o ricette pubblicate dagli chef seguiti;
- sezione “community” con le ricette più apprezzate o più commentate;
- moderazione dei contenuti da parte dell'admin.

