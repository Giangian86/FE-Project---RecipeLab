/*
  PAGINA 404

  Questa pagina viene mostrata quando l'utente prova ad aprire
  un indirizzo non gestito dall'applicazione.

  In App.jsx viene collegata alla route wildcard: path="*", che
  intercetta tutte le route non definite.

*/
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="container d-flex justify-content-center align-items-center py-5 not-found-wrapper">
      <div className="panel not-found text-center card shadow-sm p-5">
        <p className="eyebrow">404</p>

        <h1>Pagina non trovata</h1>
        {/*
          Link permette di tornare alla homepage senza ricaricare la pagina.
          Questo mantiene il comportamento da Single Page Application.
        */}
        <Link className="btn btn-primary mt-3 d-inline-block w-auto align-self-center" to="/">
          Torna alla home
        </Link>
      </div>
    </section>
  );
}
