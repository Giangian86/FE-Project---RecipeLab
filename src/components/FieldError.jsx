/*
  FIELD ERROR

  Questo componente mostra un messaggio di errore sotto un campo del form.

  Riceve una prop chiamata "message":
  - se message contiene testo, mostra il messaggio;
  - se message è vuota, null o undefined, non mostra nulla.

  In questo modo possiamo usare lo stesso componente in tutti i form
  senza dover ripetere ogni volta la stessa logica.
*/
export default function FieldError({ message }) {
  /*
    In React un componente può restituire null.
    Significa che non viene renderizzato nessun elemento HTML nella pagina.
  */
  if (!message) {
    return null;
  }
  /* 
    field-error, invalid-feedback e d-block sono classi custom/Bootstrap 
    per stilare e forzare la visualizzazione del messaggio di errore. 
  */
  return <p className="field-error invalid-feedback d-block">{message}</p>;
}
