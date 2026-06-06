/*
  ENTRY POINT DELL'APP

  Questo file è il punto di ingresso dell'applicazione React.
  Qui React viene collegato al div #root presente in index.html.

  In questo file vengono anche attivati:
  - Redux, tramite il componente Provider;
  - React Router, tramite BrowserRouter;
  - Bootstrap e il CSS personalizzato del progetto.
*/
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { store } from "./store/store.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

// createRoot crea la radice React dentro l'elemento HTML con id="root".
ReactDOM.createRoot(document.getElementById("root")).render(
    // Provider rende disponibile lo store Redux a tutti i componenti dell'app.
    <Provider store={store}>
      {/*
      BrowserRouter abilita la navigazione tra le pagine senza ricaricare il browser.
      I future flag servono a eliminare warning di React Router e ad anticipare
      alcuni comportamenti previsti nella versione 7.
      */}
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}>
        <App />
      </BrowserRouter>
    </Provider>
  
);
