/*
  SCHEDA DETTAGLIO USER

  Questa pagina è accessibile solo dall'admin e mostra la scheda completa
  di un utente selezionato.

  L'id dell'utente viene letto dalla route dinamica /admin/users/:id.
*/
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AdminSidebar from "../components/AdminSidebar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import { API_URL } from "../config/api.js";
import { fetchMealPlans } from "../store/mealPlansSlice.js";
import { fetchRecipes } from "../store/recipesSlice.js";
import { fetchReviews } from "../store/reviewsSlice.js";
import { fetchUsers } from "../store/usersSlice.js";

/*
  formatDate formatta la data di registrazione dell'utente.

  Se la data non esiste, viene mostrato un testo di fallback.
*/
function formatDate(date) {
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
  UserAvatar mostra l'immagine profilo o un placeholder
  con l'iniziale del nome dell'utente.
*/
function UserAvatar({ user }) {
  const initial = user.name?.charAt(0).toUpperCase() || "?";

  if (user.avatar) {
    return <img className="profile-avatar detail-avatar" src={user.avatar} alt={`Foto profilo di ${user.name}`} />;
  }

  return (
    <div className="profile-avatar-placeholder detail-avatar" aria-hidden="true">
      {initial}
    </div>
  );
}

export default function AdminUserDetail() {
  /*
    useParams legge l'id dell'utente dalla route dinamica.
  */
  const { id } = useParams();
  /*
    useDispatch permette di inviare thunk Redux per caricare i dati.
  */
  const dispatch = useDispatch();
  /*
    Dati letti dallo store Redux.
    Alcuni selector recuperano l'intero stato della slice,
    altri solo array o status specifici.
  */
  const usersState = useSelector((state) => state.users);
  const recipes = useSelector((state) => state.recipes.items);
  const recipesStatus = useSelector((state) => state.recipes.status);
  const reviews = useSelector((state) => state.reviews.items);
  const reviewsStatus = useSelector((state) => state.reviews.status);
  const mealPlans = useSelector((state) => state.mealPlans.items);
  const mealPlansStatus = useSelector((state) => state.mealPlans.status);
  /*
    I preferiti vengono caricati localmente in questa pagina.
    Servono solo per calcolare la statistica dei preferiti dell'utente.
  */
  const [favorites, setFavorites] = useState([]);
  const [favoritesError, setFavoritesError] = useState("");

  useEffect(() => {
    if (usersState.status === "idle") {
      dispatch(fetchUsers());
    }

    if (recipesStatus === "idle") {
      dispatch(fetchRecipes());
    }

    if (reviewsStatus === "idle") {
      dispatch(fetchReviews());
    }

    if (mealPlansStatus === "idle") {
      dispatch(fetchMealPlans());
    }
  }, [dispatch, mealPlansStatus, recipesStatus, reviewsStatus, usersState.status]);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await fetch(`${API_URL}/favorites`);

        if (!response.ok) {
          throw new Error("Impossibile caricare i preferiti.");
        }

        setFavorites(await response.json());
      } catch (error) {
        setFavoritesError(error.message);
      }
    }

    loadFavorites();
  }, []);

  const selectedUser = usersState.items.find((user) => String(user.id) === String(id));

  const userReviews = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return reviews.filter((review) => review.userEmail === selectedUser.email);
  }, [reviews, selectedUser]);

  const userFavorites = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return favorites.filter((favorite) => favorite.userEmail === selectedUser.email);
  }, [favorites, selectedUser]);

  const userMealPlans = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return mealPlans.filter((plan) => plan.userEmail === selectedUser.email);
  }, [mealPlans, selectedUser]);

  const averageRating = userReviews.length
    ? (userReviews.reduce((total, review) => total + Number(review.rating), 0) / userReviews.length).toFixed(1)
    : "N/A";

  function getRecipeTitle(recipeId) {
    return recipes.find((recipe) => recipe.id === Number(recipeId))?.title || "Ricetta non trovata";
  }

  if (usersState.status === "loading") {
    return <p>Caricamento scheda user...</p>;
  }

  if (usersState.status === "failed") {
    return <p className="alert alert-danger error">{usersState.error}</p>;
  }

  if (!selectedUser) {
    return (
      <>
        <PageHeader title="User non trovato" />
        <Link className="ghost-link" to="/admin/users">Torna alla gestione users</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title={`Scheda di ${selectedUser.name}`}
        description="Dettagli, statistiche e recensioni pubblicate dall'utente."
      />
      
      <section className="admin-layout">
        <AdminSidebar />

        <section className="admin-content">
          {/*
            Card principale dell'utente.
            Contiene stato online/offline, avatar, nome, email e data registrazione.
          */}
          <article className="panel user-detail-card">
            <span className={`user-detail-status ${selectedUser.isOnline ? "online-status" : "offline-status"}`}>
              {selectedUser.isOnline ? "Online" : "Offline"}
            </span>

            <UserAvatar user={selectedUser} />

            <div className="user-detail-copy">
              <p className="eyebrow">{selectedUser.role === "admin" ? "Profilo admin" : "Profilo user"}</p>
              <h2>{selectedUser.name}</h2>
              <p>{selectedUser.email}</p>
              <p>Registrato dal: {formatDate(selectedUser.registeredAt)}</p>
            </div>
          </article>

          <article className="panel">
            <h2>Bio</h2>
            <p className={selectedUser.bio ? "profile-bio-text" : "profile-bio-empty"}>
              {selectedUser.bio || "Questo utente non ha ancora inserito una bio."}
            </p>
          </article>

          <section className="dashboard-grid user-stats-grid">
            <StatCard label="Recensioni" value={userReviews.length} helper="Pubblicate dall'utente" />
            <StatCard label="Voto medio" value={averageRating} helper="Media delle recensioni" />
            <StatCard label="Preferiti" value={userFavorites.length} helper="Ricette salvate" />
            <StatCard label="Piani giornalieri" value={userMealPlans.length} helper="Creati dall'utente" />
          </section>

          {favoritesError && <p className="alert alert-danger error">{favoritesError}</p>}

          <article className="table-panel">
            <div className="section-heading-row">
              <h2>Recensioni pubblicate</h2>
            </div>

            {userReviews.length > 0 ? (
              <div className="responsive-table">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Ricetta</th>
                      <th>Voto</th>
                      <th>Recensione</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userReviews.map((review) => (
                      <tr key={review.id}>
                        <td>{getRecipeTitle(review.recipeId)}</td>
                        <td>{review.rating}/5</td>
                        <td>{review.content}</td>
                        <td>{review.createdAt || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Questo utente non ha ancora pubblicato recensioni.</p>
            )}
          </article>

          <div className="d-flex justify-content-end mt-3">
            <Link className="ghost-link" to="/admin/users">Torna alla lista</Link>
          </div>
        </section>
      </section>
    </>
  );
}
