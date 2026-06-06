/*
  PAGINA LOGIN
  
  Questa pagina contiene il form di accesso dell'applicazione.

  È un form controllato:
  - i valori di email e password sono salvati nello stato locale formData;
  - ogni modifica degli input aggiorna lo stato tramite handleChange.

  Se le credenziali sono corrette, il thunk login salva l'utente nello store Redux
  e la pagina reindirizza l'utente alla dashboard o alla pagina richiesta in precedenza.
*/
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import FieldError from "../components/FieldError.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { clearAuthError, login } from "../store/authSlice.js";
import { isValidEmail, minLength } from "../utils/validation.js";

export default function Login() {
  /*
    useDispatch qui viene usato per eseguire login e clearAuthError.
  */
  const dispatch = useDispatch();
  /*
    useNavigate viene usato dopo il login per mandare l'utente alla dashboard
    o alla pagina che stava cercando di aprire.
  */
  const navigate = useNavigate();
  /*
    useLocation qui legge location.state?.from, salvato da ProtectedRoute.
  */
  const location = useLocation();
  /*
    Dallo store Redux leggiamo:
    - error: eventuale errore di login;
    - user: utente loggato, se presente.
  */
  const { error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    /*
      Dopo il login, quando user esiste nello store Redux,
      l'utente viene reindirizzato.

      Se ProtectedRoute aveva salvato una pagina richiesta in location.state.from,
      l'utente torna lì.
      Altrimenti viene mandato alla dashboard come rotta predefinita.
    */
    if (user) {
      navigate(location.state?.from || "/dashboard", { replace: true });
    }
  }, [location.state?.from, navigate, user]);

  useEffect(() => {
    /*
      Cleanup dell'errore di login.

      Quando si lascia la pagina login, eventuali messaggi di errore vengono cancellati,
      così non restano visibili se l'utente torna di nuovo su questa pagina.
    */
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  function handleChange(event) {
    /*
      Gestione del form controllato.

      Ogni input ha un attributo name coerente con formData.
      In questo modo una sola funzione può aggiornare entrambi i campi.
    */
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  function validate() {
    /*
      Validazione del form prima del login.
      Se un campo non è valido, viene aggiunto un messaggio nell'oggetto nextErrors.
    */
    const nextErrors = {};

    if (!isValidEmail(formData.email)) {
      nextErrors.email = "Inserisci una email valida.";
    }

    if (!minLength(formData.password, 6)) {
      nextErrors.password = "La password deve avere almeno 6 caratteri.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    /*
      preventDefault evita il comportamento standard del form HTML,
      cioè il refresh della pagina.
    */
    event.preventDefault();

    if (!validate()) {
      return;
    }
    /*
      login è un thunk Redux.
      Riceve email e password e controlla le credenziali tramite JSON Server.
    */
    dispatch(login(formData));
  }

  return (
    <>
      <div className="login-header">
        <PageHeader
          eyebrow="Area riservata"
          title="Accedi a RecipeLab"
          description="Entra nel tuo spazio personale per consultare ricette, preferiti, piani giornalieri e recensioni."
        />
      </div>

      <section className="auth-layout auth-layout-centered">
        <form className="panel form-stack card shadow-sm" onSubmit={handleSubmit}>
          <label htmlFor="login-email">
            Email
            <input
              id="login-email"
              className="form-control"
              type="email"
              autoComplete="email"
              name="email"
              placeholder="nome@email.com"
              value={formData.email}
              onChange={handleChange}
            />
            <FieldError message={errors.email} />
          </label>

          <label htmlFor="login-password">
            Password
            <input
              id="login-password"
              className="form-control"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="La tua password"
              value={formData.password}
              onChange={handleChange}
            />
            <FieldError message={errors.password} />
          </label>
          {/* Errore restituito dal login. */}
          {error && <p className="alert alert-danger error">{error}</p>}

          <button className="btn btn-primary" type="submit">
            Entra
          </button>
        </form>
      </section>
    </>
  );
}
