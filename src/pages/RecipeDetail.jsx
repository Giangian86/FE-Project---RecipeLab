/*
  DETTAGLIO RICETTA
  
  Questa pagina mostra il dettaglio di una singola ricetta.

  È collegata alla route dinamica: /recipes/:id

  L'id viene letto dalla URL con useParams.
  Con quell'id viene cercata la ricetta corrispondente nello store Redux.

  L'admin può eliminare qualsiasi recensione.
*/
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import FieldError from "../components/FieldError.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fetchFavorites, fetchRecipes, toggleFavorite } from "../store/recipesSlice.js";
import { createReview, deleteReview, fetchReviews } from "../store/reviewsSlice.js";
import { minLength, positiveNumber } from "../utils/validation.js";

export default function RecipeDetail() {
  /*
    useParams legge i parametri dinamici della route.
  */
  const { id } = useParams();
  const dispatch = useDispatch();
  /*
    L'id letto dalla URL è una stringa.
    Viene convertito in numero per confrontarlo con recipe.id.
  */
  const recipeId = Number(id);
  /*
    Dati letti dallo store Redux:
    - user dalla slice auth;
    - recipesState dalla slice recipes;
    - reviewsState dalla slice reviews.
  */
  const user = useSelector((state) => state.auth.user);
  const recipesState = useSelector((state) => state.recipes);
  const reviewsState = useSelector((state) => state.reviews);
  /*
    Stati locali del form recensione.
    content contiene il testo della recensione.
    rating contiene il voto selezionato.
    error contiene eventuali errori di validazione.
  */
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");

  useEffect(() => {
    /*
      Vengono caricate le ricette se non sono già presenti nello store.
      Questo serve anche se l'utente apre direttamente una URL dettaglio.
    */
    if (recipesState.status === "idle") {
      dispatch(fetchRecipes());
    }
    /*
      Vengono caricate le recensioni per mostrare quelle collegate alla ricetta.
    */
    if (reviewsState.status === "idle") {
      dispatch(fetchReviews());
    }

    if (
      user?.role === "user" &&
      (recipesState.favoritesStatus === "idle" || recipesState.favoriteUserEmail !== user.email)
    ) {
      dispatch(fetchFavorites());
    }
  }, [
    dispatch, 
    recipesState.status, 
    recipesState.favoritesStatus, 
    recipesState.favoriteUserEmail, 
    reviewsState.status, 
    user,
  ]);
  /*
    Cerchiamo la ricetta corrente nello store partendo dall'id della URL.
  */
  const recipe = recipesState.items.find((item) => item.id === recipeId);
  const isFavorite = recipesState.favorites.includes(recipeId);
  /*
    Le recensioni sono salvate in una collezione separata.
    Qui filtriamo solo quelle collegate alla ricetta corrente tramite recipeId.

    useMemo evita di ricalcolare il filtro a ogni render,
    a meno che non cambino reviewsState.items o recipeId.
  */
  const recipeReviews = useMemo(() => {
    return reviewsState.items.filter((review) => review.recipeId === recipeId);
  }, [reviewsState.items, recipeId]);

  const averageRating = useMemo(() => {
    if (recipeReviews.length === 0) {
      return "N/A";
    }

    const total = recipeReviews.reduce((sum, review) => sum + Number(review.rating), 0);
    return (total / recipeReviews.length).toFixed(1);
  }, [recipeReviews]);

  function handleSubmit(event) {
    /*
      Evita il refresh standard del form HTML.
    */
    event.preventDefault();

    if (!user) {
      setError("Devi effettuare il login per lasciare una recensione.");
      return;
    }

    if (!positiveNumber(rating) || rating > 5) {
      setError("Il voto deve essere tra 1 e 5.");
      return;
    }

    if (!minLength(content, 8)) {
      setError("La recensione deve avere almeno 8 caratteri.");
      return;
    }
    /*
      createReview è un thunk Redux che salva la recensione nel db.json.
      createdAt viene generato al momento dell'invio.
    */
    dispatch(
      createReview({
        recipeId,
        userEmail: user.email,
        rating: Number(rating),
        content,
        createdAt: new Date().toISOString().slice(0, 10),
      }),
    );
    setContent("");
    setRating(5);
    setError("");
  }

  if (recipesState.status === "loading") {
    return <p className="panel">Caricamento ricetta...</p>;
  }

  if (!recipe) {
    return (
      <section className="panel">
        <h1>Ricetta non trovata</h1>
        <Link to="/recipes">Torna alle ricette</Link>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`${recipe.cuisine} - ${recipe.category}`}
        title={recipe.title}
        description={recipe.description}
      />

      <section className="detail-layout">
        <article className="panel recipe-detail">
          <img src={recipe.image} alt={recipe.title} />

          <div className="quick-facts">
            <span>{recipe.time} min</span>
            <span>{recipe.servings} porzioni</span>
            <span>{recipe.difficulty}</span>
            <span>Voto {averageRating}</span>
          </div>

          {user?.role === "user" && (
            <button
              className={isFavorite ? "active btn btn-success" : "btn btn-primary"}
              type="button"
              onClick={() => dispatch(toggleFavorite(recipe.id))}
            >
              {isFavorite ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
            </button>
          )}
          <div className="recipe-columns">
            <div>
              <h2>Ingredienti</h2>
              <ul>
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2>Procedimento</h2>
              <ol>
                {recipe.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </article>

        <aside className="panel">
          <h2>Recensioni</h2>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label htmlFor="review-rating">
              Voto
              <select
                id="review-rating"
                name="rating"
                className="form-select"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                <option value="5">5 - ottima</option>
                <option value="4">4 - buona</option>
                <option value="3">3 - ok</option>
                <option value="2">2 - migliorabile</option>
                <option value="1">1 - non riuscita</option>
              </select>
            </label>

            <label htmlFor="review-content">
              Commento
              <textarea
                id="review-content"
                name="content"
                className="form-control"
                rows="4"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Cosa ti è piaciuto?"
              />
              <FieldError message={error} />
            </label>

            <button className="btn btn-primary" type="submit">
              Pubblica recensione
            </button>
          </form>

          <div className="reviews-list">
            {recipeReviews.map((review) => (
              <article key={review.id} className="note-card">
                <strong>{review.rating}/5</strong>
                <p>{review.content}</p>
                <small>
                  {review.userEmail} - {review.createdAt}
                </small>
                {/* L'utente può eliminare solo le proprie recensioni.
                    L'admin puo eliminare qualsiasi recensione. */}
                {(user?.email === review.userEmail || user?.role === "admin") && (
                  <button
                    className="text-button danger"
                    type="button"
                    onClick={() => dispatch(deleteReview(review.id))}
                  >
                    {user?.role === "admin" && user.email !== review.userEmail
                      ? "Elimina come admin"
                      : "Elimina"}
                  </button>
                )}
              </article>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
