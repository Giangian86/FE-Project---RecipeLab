/*
  DASHBOARD
  
  Questa pagina mostra contenuti diversi in base al ruolo dell'utente loggato.

  Se l'utente è admin:
  - vede il proprio profilo;
  - vede statistiche generali su ricette e recensioni;
  - accede rapidamente alle sezioni di gestione admin.

  Se l'utente è user:
  - vede il proprio profilo;
  - vede ricette salvate, recensioni e piani giornalieri;
  - può modificare la propria bio;
  - può modificare o cancellare le proprie recensioni.

  La dashboard usa dati provenienti da più slice Redux:
  - auth
  - recipes
  - reviews
  - mealPlans
*/

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { fetchMealPlans } from "../store/mealPlansSlice.js";
import { fetchFavorites, fetchRecipes } from "../store/recipesSlice.js";
import { updateProfileBio } from "../store/authSlice.js";
import { deleteReview, fetchReviews, updateReview } from "../store/reviewsSlice.js";
import { minLength, positiveNumber } from "../utils/validation.js";

const QUICK_ACCESS_PAGE_SIZE = 3;
const REVIEW_PAGE_SIZE = 1;
const BIO_MAX_LENGTH = 160;

function formatRegistrationDate(date) {
    /* 
      La data arriva dal db.json tramite lo user salvato in Redux.
      Se manca, viene mostrato un testo neutro.
    */
  if (!date) {
    return "Data non disponibile";
  }

  return new Date(date).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
/*
  PROFILO RIASSUNTIVO

  Componente interno alla dashboard che mostra il profilo dell'utente.

  È usato sia per user sia per admin.
*/
function ProfileSummary({
  user,
  label,
  isUserOnline,
  isBioEditing,
  bioDraft,
  bioError,
  bioStatus,
  onBioDraftChange,
  onBioEdit,
  onBioCancel,
  onBioSave,
}) {
  const initial = user.name?.charAt(0).toUpperCase() || "?";
  const bio = user.bio?.trim();

  return (
    <article className="panel profile-card wide-panel">
      <div className="profile-main">
        {/* Avatar opzionale: se user.avatar esiste mostriamo l'immagine,
            altrimenti usiamo un placeholder con l'iniziale del nome. */}
        {user.avatar ? (
          <img
            className="profile-avatar"
            src={user.avatar}
            alt={`Foto profilo di ${user.name}`}
          />
        ) : (
          <div className="profile-avatar-placeholder" aria-hidden="true">
            {initial}
          </div>
        )}

        <div className="profile-copy">
          <p className="eyebrow">{label}</p>
          <h2>{user.name}</h2>
          <p className="profile-date">
            Registrato dal: {formatRegistrationDate(user.registeredAt)}
          </p>
        </div>
      </div>

      <div className="profile-meta">
        <span className={isUserOnline ? "online-status" : "offline-status"}>
          {isUserOnline ? "Online" : "Offline"}
        </span>
      </div>

      <div className="profile-bio">
        <div className="profile-bio-heading">
          <h3>Bio</h3>
          {!isBioEditing && (
            <button
              className="btn btn-outline-secondary btn-sm"
              type="button"
              onClick={onBioEdit}
            >
              Modifica bio
            </button>
          )}
        </div>
        {/*
          Rendering condizionale:
          - se isBioEditing è true, mostriamo il form;
          - altrimenti mostriamo il testo della bio.
        */}
        {isBioEditing ? (
          <form className="form-stack" onSubmit={onBioSave}>
            <label>
              Raccontati in breve
              <textarea
                id="profile-bio"
                name="bio"
                maxLength={BIO_MAX_LENGTH}
                rows="4"
                value={bioDraft}
                onChange={onBioDraftChange}
                placeholder="Esempio: chef, food lover, specializzato in cucina mediterranea..."
              />
            </label>
            <div className="bio-counter">
              {bioDraft.length}/{BIO_MAX_LENGTH} caratteri
            </div>

            {bioError && <p className="alert alert-danger error">{bioError}</p>}

            <div className="action-row">
              <button
                className="btn btn-primary btn-sm"
                type="submit"
                disabled={bioStatus === "loading"}
              >
                {bioStatus === "loading" ? "Salvataggio..." : "Salva bio"}
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={onBioCancel}
                disabled={bioStatus === "loading"}
              >
                Annulla
              </button>
            </div>
          </form>
        ) : (
          <p className={bio ? "profile-bio-text" : "profile-bio-empty"}>
            {bio || "Nessuna bio inserita. Puoi aggiungerla dalla dashboard."}
          </p>
        )}
      </div>
    </article>
  );
}
/*
  Restituisce solo una parte di un array.
  Viene usata per la paginazione locale degli accessi rapidi.
*/
function getPaginatedItems(items, pageIndex, pageSize) {
  const startIndex = pageIndex * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

export default function Dashboard() {
  /*
    Lettura dati dallo store Redux.

    La dashboard combina più slice:
    - auth per l'utente loggato e la bio;
    - recipes per ricette e preferiti;
    - reviews per recensioni;
    - mealPlans per piani giornalieri.
  */
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const bioStatus = useSelector((state) => state.auth.bioStatus);
  const bioError = useSelector((state) => state.auth.bioError);
  const recipes = useSelector((state) => state.recipes.items);
  const favorites = useSelector((state) => state.recipes.favorites);
  const recipesStatus = useSelector((state) => state.recipes.status);
  const favoritesStatus = useSelector((state) => state.recipes.favoritesStatus);
  const favoriteUserEmail = useSelector((state) => state.recipes.favoriteUserEmail);
  const reviews = useSelector((state) => state.reviews.items);
  const reviewsStatus = useSelector((state) => state.reviews.status);
  const mealPlans = useSelector((state) => state.mealPlans.items);
  const mealPlansStatus = useSelector((state) => state.mealPlans.status);
  /*
    Stati locali della dashboard.

    Alcuni dati sono globali e stanno in Redux.
    Altri sono solo temporanei e riguardano questa pagina, quindi stanno in useState.
  */
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, content: "" });
  const [reviewError, setReviewError] = useState("");
  const [quickAccessPages, setQuickAccessPages] = useState({
    recipes: 0,
    mealPlans: 0,
    reviews: 0,
  });
  const [isBioEditing, setIsBioEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(user.bio || "");
  const [localBioError, setLocalBioError] = useState("");

  useEffect(() => {
    /*
      Caricamento dati necessari alla dashboard.

      Ogni slice ha uno status.
      Se lo status è "idle", significa che la richiesta non è ancora stata fatta.
      Questo evita chiamate API duplicate.
    */
    if (recipesStatus === "idle") {
      dispatch(fetchRecipes());
    }

    if (reviewsStatus === "idle") {
      dispatch(fetchReviews());
    }

    if (mealPlansStatus === "idle") {
      dispatch(fetchMealPlans());
    }

    /*
      I preferiti vengono caricati solo per gli utenti normali.
      Inoltre vengono ricaricati se l'utente corrente cambia.
    */
    if (
      user?.role === "user" &&
      (favoritesStatus === "idle" || favoriteUserEmail !== user.email)
    ) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, favoriteUserEmail, favoritesStatus, mealPlansStatus, recipesStatus, reviewsStatus, user]);

  useEffect(() => {
    /*
      Se la bio cambia nello stato globale, aggiorniamo anche la bozza locale,
      ma solo quando il form non è aperto, così la dashboard resta allineata al db.
    */
    if (!isBioEditing) {
      setBioDraft(user.bio || "");
    }
  }, [isBioEditing, user.bio]);

  const personalPlan = mealPlans.find((plan) => plan.userEmail === user.email);
  const personalPlans = mealPlans.filter((plan) => plan.userEmail === user.email);
  const personalReviews = reviews.filter((review) => review.userEmail === user.email);
  const savedRecipes = recipes.filter((recipe) => favorites.includes(recipe.id));
  const isUserOnline = user.isOnline ?? true;
  /*
    Liste paginate negli accessi rapidi.
  */
  const savedRecipesPage = getPaginatedItems(
    savedRecipes,
    getSafePageIndex(savedRecipes, "recipes", QUICK_ACCESS_PAGE_SIZE),
    QUICK_ACCESS_PAGE_SIZE,
  );
  const mealPlansPage = getPaginatedItems(
    personalPlans,
    getSafePageIndex(personalPlans, "mealPlans", QUICK_ACCESS_PAGE_SIZE),
    QUICK_ACCESS_PAGE_SIZE,
  );
  const reviewsPage = getPaginatedItems(
    personalReviews,
    getSafePageIndex(personalReviews, "reviews", REVIEW_PAGE_SIZE),
    REVIEW_PAGE_SIZE,
  );

  const categoryCount = useMemo(() => {
    return recipes.reduce((totals, recipe) => {
      totals[recipe.category] = (totals[recipe.category] || 0) + 1;
      return totals;
    }, {});
  }, [recipes]);

  function getRecipeTitle(recipeId) {
    return recipes.find((recipe) => recipe.id === Number(recipeId))?.title || "Ricetta non trovata";
  }

  function formatPlanDate(plan) {
    return plan.planDate || plan.weekName || "Data non impostata";
  }

  function getSafePageIndex(items, pageKey, pageSize) {
    const lastPageIndex = Math.max(0, Math.ceil(items.length / pageSize) - 1);
    return Math.min(quickAccessPages[pageKey], lastPageIndex);
  }

  function changeQuickAccessPage(pageKey, direction) {
    // direction vale -1 per "Precedente" e +1 per "Successivo".
    setQuickAccessPages((currentPages) => ({
      ...currentPages,
      [pageKey]: Math.max(0, currentPages[pageKey] + direction),
    }));
  }

  function renderQuickAccessPager(items, pageKey, pageSize) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePageIndex = getSafePageIndex(items, pageKey, pageSize);

    if (items.length <= pageSize) {
      return null;
    }

    return (
      <div className="quick-card-pagination">
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          disabled={safePageIndex === 0}
          onClick={() => changeQuickAccessPage(pageKey, -1)}
        >
          Precedente
        </button>
        <span>
          {safePageIndex + 1}/{totalPages}
        </span>
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          disabled={safePageIndex === totalPages - 1}
          onClick={() => changeQuickAccessPage(pageKey, 1)}
        >
          Successivo
        </button>
      </div>
    );
  }

  function startEditingReview(review) {
    /*
      Apre il form di modifica per una recensione specifica.
      La bozza viene inizializzata con i valori attuali della recensione.
    */
    setEditingReviewId(review.id);
    setReviewDraft({
      rating: Number(review.rating),
      content: review.content,
    });
    setReviewError("");
  }
  /*
      Chiude il form di modifica recensione e resetta la bozza locale.
    */
  function cancelEditingReview() {
    setEditingReviewId(null);
    setReviewDraft({ rating: 5, content: "" });
    setReviewError("");
  }
  /*
      Gestisce i campi del form recensione.
      rating viene convertito in numero, perché arriva dal select come stringa.
    */
  function handleReviewDraftChange(event) {
    const { name, value } = event.target;

    setReviewDraft((currentDraft) => ({
      ...currentDraft,
      [name]: name === "rating" ? Number(value) : value,
    }));
  }

  function handleReviewUpdate(event, review) {
    event.preventDefault();
    /*
      Validazione della recensione.
    */
    if (!positiveNumber(reviewDraft.rating) || reviewDraft.rating > 5) {
      setReviewError("Il voto deve essere tra 1 e 5.");
      return;
    }

    if (!minLength(reviewDraft.content, 8)) {
      setReviewError("La recensione deve avere almeno 8 caratteri.");
      return;
    }

    /*
      Aggiorniamo solo rating e content.
      Tutti gli altri dati della recensione vengono mantenuti con ...review.
    */
    dispatch(
      updateReview({
        ...review,
        rating: reviewDraft.rating,
        content: reviewDraft.content,
      }),
    );
    cancelEditingReview();
  }

  function startEditingBio() {
    /*
      Apre il form bio partendo dalla bio attuale dell'utente.
    */
    setBioDraft(user.bio || "");
    setLocalBioError("");
    setIsBioEditing(true);
  }

  function cancelEditingBio() {
    /*
      Chiude il form bio e ripristina il testo precedente.
    */
    setBioDraft(user.bio || "");
    setLocalBioError("");
    setIsBioEditing(false);
  }

  function handleBioDraftChange(event) {
    const nextBio = event.target.value;

    if (nextBio.length <= BIO_MAX_LENGTH) {
      setBioDraft(nextBio);
    }
  }

  async function handleBioSave(event) {
    event.preventDefault();

    const cleanBio = bioDraft.trim();

    if (cleanBio.length > BIO_MAX_LENGTH) {
      setLocalBioError(`La bio può avere al massimo ${BIO_MAX_LENGTH} caratteri.`);
      return;
    }

    try {
      /*
        updateProfileBio è un thunk che salva la bio nel db.json
        e aggiorna anche l'utente nello stato Redux/localStorage.

        unwrap permette di intercettare eventuali errori nel catch.
      */
      await dispatch(updateProfileBio(cleanBio)).unwrap();
      setIsBioEditing(false);
      setLocalBioError("");
    } catch (error) {
      setLocalBioError(error || "Impossibile salvare la bio.");
    }
  }

  return (
    <>
      {/* La dashboard mostra sezioni diverse a seconda del ruolo dell'utente tramite conditional rendering. */}
      <PageHeader title={`Ciao ${user.name}!`} />

      {user.role === "admin" ? (
        <section className="dashboard-grid">
          <ProfileSummary
            user={user}
            label="Profilo admin"
            isUserOnline={isUserOnline}
            isBioEditing={isBioEditing}
            bioDraft={bioDraft}
            bioError={localBioError || bioError}
            bioStatus={bioStatus}
            onBioDraftChange={handleBioDraftChange}
            onBioEdit={startEditingBio}
            onBioCancel={cancelEditingBio}
            onBioSave={handleBioSave}
          />

          <StatCard label="Ricette totali" value={recipes.length} helper="Nel database" />
          <StatCard
            label="Pubblicate"
            value={recipes.filter((recipe) => recipe.status === "pubblicata").length}
            helper="Visibili nel catalogo"
          />
          <StatCard label="Recensioni" value={reviews.length} helper="Create dagli utenti" />

          <article className="panel wide-panel">
            <h2>Azioni admin</h2>
            <p>Gestisci il catalogo: crea nuove ricette, modifica contenuti e rimuovi bozze.</p>
            <div className="action-row">
              <Link className="ghost-link" to="/admin/users">
                Gestisci Users
              </Link>
              <Link className="button-link" to="/admin/recipes/archive">
                Gestisci ricette
              </Link>
            </div>
          </article>
        </section>
      ) : (
        <section className="dashboard-grid">
          <ProfileSummary
            user={user}
            label="Profilo user"
            isUserOnline={isUserOnline}
            isBioEditing={isBioEditing}
            bioDraft={bioDraft}
            bioError={localBioError || bioError}
            bioStatus={bioStatus}
            onBioDraftChange={handleBioDraftChange}
            onBioEdit={startEditingBio}
            onBioCancel={cancelEditingBio}
            onBioSave={handleBioSave}
          />

          <StatCard label="Ricette salvate" value={favorites.length}/>
          <StatCard label="Tue recensioni" value={personalReviews.length}/>
          <StatCard
            label="Piani giornalieri"
            value={personalPlan ? "Attivo" : "Vuoto"}
            helper={personalPlan ? formatPlanDate(personalPlan) : "Da creare"}
          />

          <article className="panel wide-panel">
            <h2>Accessi rapidi</h2>
            <div className="dashboard-list">
              <article className="note-card">
                <h3>Ricette salvate</h3>
                {savedRecipes.length > 0 ? (
                  <>
                    <ul className="compact-list quick-card-content">
                      {savedRecipesPage.map((recipe) => (
                        <li key={recipe.id}>
                          <span>{recipe.title}</span>
                          <Link to={`/recipes/${recipe.id}`}>Apri</Link>
                        </li>
                      ))}
                    </ul>
                    {renderQuickAccessPager(savedRecipes, "recipes", QUICK_ACCESS_PAGE_SIZE)}
                  </>
                ) : (
                  <p>Non hai ancora salvato ricette.</p>
                )}
              </article>

              <article className="note-card">
                <h3>Piani giornalieri salvati</h3>
                {personalPlans.length > 0 ? (
                  <>
                    <ul className="compact-list quick-card-content">
                      {mealPlansPage.map((plan) => (
                        <li key={plan.id}>
                          <span>{formatPlanDate(plan)}</span>
                          <Link to="/planner">Modifica</Link>
                        </li>
                      ))}
                    </ul>
                    {renderQuickAccessPager(personalPlans, "mealPlans", QUICK_ACCESS_PAGE_SIZE)}
                  </>
                ) : (
                  <p>Non hai ancora salvato piani giornalieri.</p>
                )}
              </article>

              <article className="note-card">
                <h3>Recensioni salvate</h3>
                {personalReviews.length > 0 ? (
                  <>
                    <div className="reviews-list quick-card-content">
                      {reviewsPage.map((review) => (
                        <article key={review.id} className="review-manage-card">
                          <strong>{getRecipeTitle(review.recipeId)}</strong>

                          {editingReviewId === review.id ? (
                            <form
                              className="form-stack"
                              onSubmit={(event) => handleReviewUpdate(event, review)}
                            >
                              <label>
                                Voto
                                <select
                                  name="rating"
                                  value={reviewDraft.rating}
                                  onChange={handleReviewDraftChange}
                                >
                                  <option value="5">5 - ottima</option>
                                  <option value="4">4 - buona</option>
                                  <option value="3">3 - ok</option>
                                  <option value="2">2 - migliorabile</option>
                                  <option value="1">1 - non riuscita</option>
                                </select>
                              </label>

                              <label>
                                Commento
                                <textarea
                                  name="content"
                                  rows="3"
                                  value={reviewDraft.content}
                                  onChange={handleReviewDraftChange}
                                />
                              </label>

                              {reviewError && <p className="alert error">{reviewError}</p>}

                              <div className="action-row">
                                <button type="submit">Salva modifica</button>
                                <button
                                  className="ghost-button"
                                  type="button"
                                  onClick={cancelEditingReview}
                                >
                                  Annulla
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <p>
                                {review.rating}/5 - {review.content}
                              </p>
                              <div className="action-row review-actions">
                                <Link
                                  className="btn btn-outline-secondary btn-sm"
                                  to={`/recipes/${review.recipeId}`}
                                >
                                  Vai alla ricetta
                                </Link>
                                <button
                                  className="small-button btn btn-primary btn-sm"
                                  type="button"
                                  onClick={() => startEditingReview(review)}
                                >
                                  Modifica
                                </button>
                                <button
                                  className="small-button danger btn btn-danger btn-sm"
                                  type="button"
                                  onClick={() => dispatch(deleteReview(review.id))}
                                >
                                  Elimina
                                </button>
                              </div>
                            </>
                          )}
                        </article>
                      ))}
                    </div>
                    {renderQuickAccessPager(personalReviews, "reviews", REVIEW_PAGE_SIZE)}
                  </>
                ) : (
                  <p>Non hai ancora scritto recensioni.</p>
                )}
              </article>
            </div>
          </article>

          <article className="panel wide-panel">
            <h2>Categorie nel catalogo</h2>
            <div className="tag-list">
              {Object.entries(categoryCount).map(([category, count]) => (
                <span key={category}>
                  {category}: {count}
                </span>
              ))}
            </div>
          </article>
        </section>
      )}
    </>
  );
}
