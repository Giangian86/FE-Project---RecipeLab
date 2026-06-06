/*
  ARCHIVIO RICETTE ADMIN
  
  Tabella CRUD: mostra ricette, numero recensioni, modifica ed eliminazione.
  
  La pagina usa Redux per leggere ricette e recensioni.
  Inoltre gestisce una paginazione diversa tra desktop e tablet/mobile.
*/
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { deleteRecipe, fetchRecipes } from "../store/recipesSlice.js";
import { fetchReviews } from "../store/reviewsSlice.js";

export default function AdminRecipes() {
  /*
    Qui useDispatch viene usato per caricare ricette, caricare recensioni
    ed eliminare una ricetta.
  */
  const dispatch = useDispatch();
  /*
    Dal recipesSlice vengono letti:
    - items: array delle ricette;
    - status: stato del caricamento;
    - error: eventuale messaggio di errore.
  */
  const { error, items, status } = useSelector((state) => state.recipes);
  /*
    Dal reviewsSlice vengono lette le recensioni.
  */
  const reviews = useSelector((state) => state.reviews.items);
  const reviewsStatus = useSelector((state) => state.reviews.status);
  /*
    Stato locale per la paginazione della tabella.
    currentPage indica la pagina corrente.
    pageSize indica quante ricette mostrare per pagina.
  */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    /*
      Carichiamo le ricette solo se lo status è "idle",
      cioè se non sono ancora state richieste.

      Questo evita chiamate API inutili ogni volta che il componente si aggiorna.
    */
    if (status === "idle") {
      dispatch(fetchRecipes());
    }
    /*
      La pagina admin mostra anche il numero di recensioni per ricetta.
      Per questo viene caricata anche la risorsa reviews,
      gestita da una slice Redux separata.
    */
    if (reviewsStatus === "idle") {
      dispatch(fetchReviews());
    }
  }, [dispatch, reviewsStatus, status]);

  useEffect(() => {
    /*
      L'archivio admin mostra 10 ricette su desktop e 5 su tablet/mobile.
      In questo modo la tabella non diventa una pagina lunghissima.
    */  
    function updatePageSize() {
      setPageSize(window.matchMedia("(max-width: 1100px)").matches ? 5 : 10);
    }

    updatePageSize();
    window.addEventListener("resize", updatePageSize);

    return () => window.removeEventListener("resize", updatePageSize);
  }, []);

  useEffect(() => {
    // Quando cambia la dimensione pagina o il numero di ricette,
    // riportiamo la paginazione a un valore valido.
    setCurrentPage((page) => {
      const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
      return Math.min(page, totalPages);
    });
  }, [items.length, pageSize]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRecipes = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, pageSize, startIndex],
  );

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Gestione catalogo ricette"
      />

      <section className="admin-layout">
        <AdminSidebar />

        <div className="admin-content">
          {status === "loading" && <p className="panel">Caricamento ricette...</p>}
          {status === "failed" && <p className="alert error">{error}</p>}

          <section className="table-panel">
            <div className="section-heading-row">
              <h2>Archivio ricette</h2>
              <span className="table-page-size">{pageSize} ricette per pagina</span>
            </div>
            {/*
              responsive-table permette alla tabella di avere scroll orizzontale
              su schermi piccoli, senza rompere il layout della pagina.
            */}
            <div className="responsive-table">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Ricetta</th>
                    <th>Categoria</th>
                    <th>Difficoltà</th>
                    <th>Stato</th>
                    <th>Recensioni</th>
                    <th>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecipes.map((recipe) => {
                    const recipeReviews = reviews.filter((review) => review.recipeId === recipe.id);
                    const hasReviews = recipeReviews.length > 0;

                    return (
                      <tr key={recipe.id}>
                        <td>{recipe.title}</td>
                        <td>{recipe.category}</td>
                        <td>{recipe.difficulty}</td>
                        <td>{recipe.status}</td>
                        <td>{recipeReviews.length}</td>
                        <td className="admin-recipe-actions">
                          <div className="admin-actions-grid">
                            {hasReviews ? (
                              <Link
                                className="ghost-link admin-table-button btn btn-outline-secondary btn-sm"
                                to={`/recipes/${recipe.id}`}
                              >
                                Recensioni
                              </Link>
                            ) : (
                              <span className="admin-table-placeholder" aria-hidden="true" />
                            )}
                            <Link
                              className="admin-table-button btn btn-primary btn-sm"
                              to={`/admin/recipes/edit/${recipe.id}`}
                            >
                              Modifica
                            </Link>
                            {/*
                              Elimina la ricetta.
                              deleteRecipe è un thunk Redux che aggiorna anche
                              il database tramite JSON Server.
                            */}
                            <button
                              className="danger admin-table-button btn btn-danger btn-sm"
                              type="button"
                              onClick={() => dispatch(deleteRecipe(recipe.id))}
                            >
                              Elimina
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Controlli di paginazione. */}
            <div className="pagination">
              <button type="button" disabled={currentPage === 1} onClick={goToPreviousPage}>
                Precedente
              </button>
              <span>
                Pagina {currentPage} di {totalPages}
              </span>
              <button type="button" disabled={currentPage === totalPages} onClick={goToNextPage}>
                Successiva
              </button>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
