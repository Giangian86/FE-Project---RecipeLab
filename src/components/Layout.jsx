/*
  LAYOUT PRINCIPALE

  Questo componente contiene la struttura comune dell'applicazione:
  - barra di navigazione superiore;
  - brand RecipeLab;
  - menù desktop e menù responsive per tablet/mobile;
  - pulsanti login, registrazione e logout;
  - <Outlet />, cioè lo spazio in cui React Router inserisce la pagina corrente.

  Layout viene usato in App.jsx come contenitore delle route principali.
*/
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice.js";

export default function Layout() {
  /*
    useNavigate permette di spostarsi via codice tra le pagine.
    Quì viene usato dopo il logout per tornare alla home.
  */
  const navigate = useNavigate();
  /*
    useLocation restituisce informazioni sulla pagina corrente.
    Qui viene usato per chiudere automaticamente il menù responsive
    quando cambia route.
  */
  const location = useLocation();
  /*
    useDispatch serve per inviare azioni Redux.
    In questo caso viene usato per eseguire il logout.
  */
  const dispatch = useDispatch();
  /*
    useSelector legge dati dallo store Redux.
    Quì viene recuperato l'utente autenticato, se presente.
  */
  const user = useSelector((state) => state.auth.user);
  /*
    Stato locale del componente.
    isMenuOpen controlla se il menù responsive è aperto o chiuso.
  */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    /*
      Ogni volta che cambia pagina, il menù tablet/mobile viene chiuso.
      Questo evita che il menù resti aperto dopo aver cliccato un link.
    */
    setIsMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    /*
      Il logout pulisce lo stato auth in Redux e anche il localStorage.
      Dopo il logout l'utente viene riportato alla homepage.
    */
    dispatch(logout());
    navigate("/");
  }

  function toggleMenu() {
    /*
      Inverte lo stato del menu responsive:
      se è chiuso lo apre, se è aperto lo chiude.
    */
    setIsMenuOpen((currentValue) => !currentValue);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        {/* Brand dell'app. Con end, il link risulta active solo sulla homepage esatta. */}
        <NavLink to="/" className="brand" end>
          RecipeLab
        </NavLink>
        {/*
          Azioni visibili su tablet/mobile:
          - pillola con ruolo utente, se l'utente è loggato;
          - bottone per aprire o chiudere il menù.
        */}
        <div className="mobile-topbar-actions">
          {user && <span className="role-pill">{user.role}</span>}
          <button
            className="mobile-menu-button btn btn-outline-secondary"
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
          >
            {isMenuOpen ? "X" : "☰"}
          </button>
        </div>

        {/*
          Navbar principale.
          Su desktop è sempre visibile.
          Su tablet/mobile viene mostrata o nascosta in base a isMenuOpen.
        */}
        <nav
          id="primary-navigation"
          className={isMenuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Navigazione principale"
        >
          <NavLink to="/recipes">Ricette</NavLink>
          {/* Il meal planner giornaliero è una funzione personale dell'user.
              L'admin gestisce catalogo e recensioni,
              quindi non lo mostriamo nella sua navbar. */}
          {user?.role !== "admin" && <NavLink to="/planner">Meal Planner</NavLink>}
          {/* Dashboard condizionale in base al ruolo*/}
          <NavLink to="/dashboard">Dashboard</NavLink>
          {user?.role === "admin" && <NavLink to="/admin/users">Admin</NavLink>}
        </nav>
        {/*
          Area utente.
          Se l'utente è loggato mostra ruolo e logout.
          Se non è loggato mostra registrazione e login.
        */}  
        <div className={isMenuOpen ? "user-area is-open" : "user-area"}>
          {user ? (
            <>
              {/*
                La pillola ruolo desktop è separata da quella mobile.
                Su tablet/mobile viene nascosta via CSS per evitare duplicazioni.
              */}
              <span className="role-pill desktop-role-pill">{user.role}</span>
              {/* Bottoni di login/logout e registrazione condizionali in base allo stato di autenticazione */}
              <button className="ghost-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="ghost-link btn btn-outline-secondary" to="/register">
                Registrati
              </NavLink>
              <NavLink className="button-link btn btn-primary" to="/login">
                Login
              </NavLink>
            </>
          )}
        </div>
      </header>
      {/*
        Outlet è il punto in cui React Router renderizza la pagina attiva.
      */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
