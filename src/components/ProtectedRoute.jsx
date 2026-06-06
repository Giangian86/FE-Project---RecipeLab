/*
  ROUTE PROTETTA
  
  Questo componente controlla se una pagina può essere visualizzata.

  Viene usato in App.jsx per proteggere:
  - pagine accessibili solo dopo login;
  - pagine accessibili solo a determinati ruoli, per esempio admin o user.

  Riceve due props:
  - children: la pagina da mostrare se l'accesso è consentito;
  - allowedRoles: array opzionale con i ruoli autorizzati.
*/

import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowedRoles, children }) {
  /*
    useLocation restituisce informazioni sulla route corrente.
    Quì serve per ricordare quale pagina l'utente voleva visitare
    prima di essere mandato al login.
  */
  const location = useLocation();
  /*
    Viene recuperato l'utente autenticato dallo store Redux.
    Se user è null, significa che nessun utente è loggato.
  */
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    /*
    Primo controllo: utente non autenticato.

    Se non esiste un utente loggato, la pagina protetta non viene mostrata.
    L'utente viene reindirizzato a /login.

    replace evita di lasciare la pagina protetta nella cronologia del browser.
    state.from salva la pagina richiesta, così dopo il login è possibile
    riportare l'utente alla pagina che voleva aprire.
  */
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  /*
    Secondo controllo: ruolo non autorizzato.

    allowedRoles è opzionale:
    - se non viene passato, basta essere loggati;
    - se viene passato, il ruolo dell'utente deve essere incluso nell'array.

    Esempio:
    allowedRoles={["admin"]} permette l'accesso solo agli admin.
  */
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  /*
    Se l'utente è loggato e ha il ruolo corretto,
    viene renderizzata la pagina protetta.
  */
  return children;
}
