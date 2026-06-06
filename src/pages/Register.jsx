/*
  PAGINA REGISTRAZIONE
  
  Questa pagina contiene il form per creare un nuovo account user.

  È un form controllato:
  - i valori dei campi sono salvati nello stato locale formData;
  - ogni input aggiorna formData tramite handleChange.

  Quando il form è valido, viene inviato il thunk createUser,
  che salva il nuovo utente nel db.json tramite JSON Server.
*/
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import FieldError from "../components/FieldError.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { clearRegistrationState, createUser } from "../store/usersSlice.js";
import { isValidEmail, minLength, required } from "../utils/validation.js";

export default function Register() {
  /*
    useDispatch qui viene usato per createUser e clearRegistrationState.
  */
  const dispatch = useDispatch();
  /*
    Dal usersSlice vengono letti:
    - registrationStatus: stato della registrazione;
    - registrationError: eventuale errore restituito durante la registrazione.
  */
  const { registrationError, registrationStatus } = useSelector((state) => state.users);
  /*
    Stato locale del form controllato.
  */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  /*
    Stato locale degli errori di validazione.
  */
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => dispatch(clearRegistrationState());
  }, [dispatch]);

  function handleChange(event) {
    /*
      Ogni input ha un name uguale alla proprietà corrispondente di formData.
      Così una sola funzione può aggiornare tutti i campi.
    */
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  function validate() {
    /*
      Validazione del form prima della creazione dell'utente.
    */
    const nextErrors = {};

    if (!required(formData.name)) {
      nextErrors.name = "Inserisci il tuo nome.";
    }

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
      Evita il refresh standard del browser quando si invia il form.
    */
    event.preventDefault();

    if (!validate()) {
      return;
    }
    /*
      createUser è un thunk Redux.
      Crea un nuovo utente nel database locale.
    */
    dispatch(createUser(formData));
  }

  return (
    <>
      <div className="login-header">
        <PageHeader
          eyebrow="Registrazione"
          title="Crea il tuo account"
          description="Registrati come user per salvare ricette, recensirle e creare i tuoi piani giornalieri."
        />
      </div>

      <section className="auth-layout auth-layout-centered">
        <form className="panel form-stack card shadow-sm" onSubmit={handleSubmit}>
          <label htmlFor="register-name">
            Nome
            <input
              id="register-name"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Il tuo nome"
            />
            <FieldError message={errors.name} />
          </label>

          <label htmlFor="register-email">
            Email
            <input
              id="register-email"
              className="form-control"
              autoComplete="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nome@email.com"
            />
            <FieldError message={errors.email} />
          </label>

          <label htmlFor="register-password">
            Password
            <input
              id="register-password"
              className="form-control"
              autoComplete="new-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimo 6 caratteri"
            />
            <FieldError message={errors.password} />
          </label>
          {/* Errore restituito dal thunk createUser. */}
          {registrationError && <p className="alert alert-danger error">{registrationError}</p>}
          {/* Messaggio di conferma mostrato dopo una registrazione riuscita. */}
          {registrationStatus === "succeeded" && (
            <p className="alert alert-success success">
              Registrazione completata. Ora puoi accedere con le tue credenziali.
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={registrationStatus === "loading"}>
            {registrationStatus === "loading" ? "Registrazione..." : "Registrati"}
          </button>

          <Link className="ghost-link btn btn-outline-secondary" to="/login">
            Hai già un account? Accedi
          </Link>
        </form>
      </section>
    </>
  );
}
