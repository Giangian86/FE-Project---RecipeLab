/*
  SIDEBAR ADMIN

  Questo componente mostra il menù laterale dell'area amministratore.
  Viene riutilizzato nelle pagine admin, così non dobbiamo riscrivere
  gli stessi link in ogni pagina.

  NavLink viene usato al posto di Link perché aggiunge automaticamente
  la classe "active" quando il link corrisponde alla pagina corrente.
*/

import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar panel card shadow-sm">
      <p className="eyebrow">Admin Tools</p>
      {/* aria-label migliora l'accessibilità, descrivendo il contenuto del menu. */}
      <nav aria-label="Navigazione admin">
        <NavLink to="/admin/users">Gestione Users</NavLink>
        <NavLink to="/admin/recipes/new">Crea Ricetta</NavLink>
        <NavLink to="/admin/recipes/archive">Gestione Archivio Ricette</NavLink>
      </nav>
    </aside>
  );
}
