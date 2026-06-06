/*
  GESTIONE USERS ADMIN
  
  Questa pagina mostra all'admin la lista degli utenti registrati.

  La pagina usa Redux per caricare e modificare la lista utenti.

*/
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { deleteUser, fetchUsers } from "../store/usersSlice.js";

export default function AdminUsers() {
  /*
    useDispatch qui viene usato per caricare o eliminare utenti.
  */
  const dispatch = useDispatch();
  /*
    Dal usersSlice vengono letti:
    - items: lista degli utenti;
    - status: stato del caricamento;
    - error: eventuale messaggio di errore.
  */
  const { error, items, status } = useSelector((state) => state.users);

  useEffect(() => {
    /*
      Se gli utenti non sono ancora stati caricati, vengono recuperati dalla API.
      Lo status "idle" indica che la richiesta non è ancora partita.
    */
    if (status === "idle") {
      dispatch(fetchUsers());
    }
  }, [dispatch, status]);

  const registeredUsers = items.filter((user) => user.role === "user");

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Gestione Users"
      />

      <section className="admin-layout">
        <AdminSidebar />

        <section className="table-panel" id="users">
          <h2>Users registrati</h2>
          {status === "loading" && <p>Caricamento utenti...</p>}
          {status === "failed" && <p className="alert alert-danger error">{error}</p>}

          <div className="responsive-table">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Stato</th>
                  <th>Registrazione</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {/*
                        Il nome utente è cliccabile e porta alla scheda dettaglio.
                        La route dinamica usa l'id dell'utente.
                      */}
                      <Link className="table-user-link" to={`/admin/users/${user.id}`}>
                        {user.name}
                      </Link>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.isOnline ? "Online" : "Offline"}</td>
                    <td>{user.registeredAt || "N/A"}</td>
                    <td className="table-actions admin-row-actions">
                      <Link
                        className="btn btn-outline-secondary btn-sm"
                        to={`/admin/users/${user.id}`}
                      >
                        Scheda
                      </Link>
                      {/*
                        deleteUser elimina l'utente sia dallo store Redux
                        sia dal database locale tramite JSON Server.
                      */}
                      <button
                        className="danger btn btn-danger btn-sm"
                        type="button"
                        onClick={() => dispatch(deleteUser(user.id))}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {status === "succeeded" && registeredUsers.length === 0 && (
            <p>Nessuno user registrato.</p>
          )}
        </section>
      </section>
    </>
  );
}
