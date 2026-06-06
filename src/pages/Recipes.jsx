/*
  LISTING RICETTE
  Questa pagina mostra il catalogo delle ricette pubblicate.

  I filtri principali sono sincronizzati con la URL tramite useSearchParams.
  Questo rende la pagina condivisibile e mantiene i filtri anche dopo il refresh.
*/
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import RecipeCard from "../components/RecipeCard.jsx";
import { fetchFavorites, fetchRecipes } from "../store/recipesSlice.js";

const PAGE_SIZE = 4;

export default function Recipes() {
  const dispatch = useDispatch();
  // useSearchParams permette di leggere filtri e paginazione dalla URL.
  const [searchParams, setSearchParams] = useSearchParams();
  /*
    Dati letti dal recipesSlice.
  */
  const { error, items, status, favoritesStatus, favoriteUserEmail } = useSelector((state) => state.recipes);
  /*
    Utente loggato letto dalla slice auth.
    Serve per capire se mostrare o meno il bottone preferiti.
  */
  const user = useSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const category = searchParams.get("category") || "all";
  const difficulty = searchParams.get("difficulty") || "all";
  const currentPage = Number(searchParams.get("page") || 1);

  useEffect(() => {
    /*
      Carichiamo le ricette solo se non sono già state richieste.
      Lo status "idle" indica che la chiamata API non è ancora partita.
    */
    if (status === "idle") {
      dispatch(fetchRecipes());
    }
    /*
      I preferiti sono salvati nel database e dipendono dall'utente loggato.

      Vengono caricati solo per gli utenti normali.
      Se cambia utente, favoriteUserEmail permette di ricaricare i preferiti
      corretti per il nuovo account.
    */
    if (
      user?.role === "user" &&
      (favoritesStatus === "idle" || favoriteUserEmail !== user.email)
    ) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, favoriteUserEmail, favoritesStatus, status, user]);

  function updateParams(nextValues) {
    const params = {
      q: searchTerm,
      category,
      difficulty,
      page: String(currentPage),
      ...nextValues,
    };

    Object.keys(params).forEach((key) => {
      if (!params[key] || params[key] === "all" || params[key] === "1") {
        delete params[key];
      }
    });

    setSearchParams(params);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    updateParams({ q: searchTerm, page: "1" });
  }

  const categories = useMemo(() => {
    /*
      Viene costruito dinamicamente l'elenco categorie partendo dalle ricette.
      Set elimina i duplicati.

      "all" viene aggiunto come prima opzione per indicare nessun filtro.
    */
    const uniqueCategories = new Set(items.map((recipe) => recipe.category));
    return ["all", ...uniqueCategories];
  }, [items]);

  const filteredRecipes = useMemo(() => {
    return items.filter((recipe) => {
      const isPublished = recipe.status === "pubblicata";
      const matchesCategory = category === "all" || recipe.category === category;
      const matchesDifficulty = difficulty === "all" || recipe.difficulty === difficulty;
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        recipe.title.toLowerCase().includes(search) ||
        recipe.description.toLowerCase().includes(search) ||
        recipe.cuisine.toLowerCase().includes(search);

      return isPublished && matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [category, difficulty, items, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / PAGE_SIZE));
  // safePage evita pagine fuori range se un filtro riduce il numero di risultati.
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleRecipes = filteredRecipes.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      <PageHeader
        eyebrow="CATALOGO RICETTE"
        title="Trova la prossima ricetta"
      />

      <section className="filters-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <label htmlFor="recipe-search">
            Cerca
            <input
              id="recipe-search"
              name="search"
              className="form-control"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Esempio: curry"
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Cerca
          </button>
        </form>

        <label htmlFor="recipe-category">
          Categoria
          <select
            id="recipe-category"
            name="category"
            className="form-select"
            value={category}
            onChange={(event) => updateParams({ category: event.target.value, page: "1" })}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "Tutte" : item}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="recipe-difficulty">
          Difficoltà
          <select
            id="recipe-difficulty"
            name="difficulty"
            className="form-select"
            value={difficulty}
            onChange={(event) => updateParams({ difficulty: event.target.value, page: "1" })}
          >
            <option value="all">Tutte</option>
            <option value="facile">facile</option>
            <option value="media">media</option>
            <option value="avanzata">avanzata</option>
          </select>
        </label>
      </section>
      {/* Stati della chiamata API. */}
      {status === "loading" && <p className="panel">Caricamento ricette...</p>}
      {status === "failed" && <p className="alert alert-danger error">{error}</p>}

      {status === "succeeded" && (
        <>
          <section className="recipe-grid">
            {visibleRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showFavoriteAction={user?.role === "user"}
              />
            ))}
          </section>

          {visibleRecipes.length === 0 && <p className="panel">Nessuna ricetta trovata.</p>}

          <div className="pagination">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => updateParams({ page: String(safePage - 1) })}
            >
              Precedente
            </button>
            <span>
              Pagina {safePage} di {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => updateParams({ page: String(safePage + 1) })}
            >
              Successiva
            </button>
          </div>
        </>
      )}
    </>
  );
}
