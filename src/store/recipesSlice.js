/*
  SLICE RICETTE

  Gestisce catalogo ricette, loading/error delle chiamate API e preferiti.
  Le operazioni CRUD usano createAsyncThunk per comunicare con JSON Server.
*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_URL } from "../config/api.js";

// createAsyncThunk serve per gestire operazioni asincrone dentro Redux.
// Qui viene usato per leggere, creare, modificare ed eliminare ricette dalla API.
export const fetchRecipes = createAsyncThunk(
  "recipes/fetchRecipes",
  async (_, { rejectWithValue }) => {
    try {
      // fetch è una chiamata HTTP nativa del browser.
      // JSON Server espone /recipes come endpoint REST locale.
      const response = await fetch(`${API_URL}/recipes`);

      if (!response.ok) {
        throw new Error("Risposta API non valida.");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchFavorites = createAsyncThunk(
  "recipes/fetchFavorites",
  async (_, { getState, rejectWithValue }) => {
    try {
      const user = getState().auth.user;

      // I preferiti sono personali: senza utente loggato non c'è nulla da caricare.
      if (!user) {
        return { userEmail: null, recipeIds: [] };
      }

      // Vengono recuperatidal db solo i preferiti dell'utente corrente.
      const response = await fetch(`${API_URL}/favorites?userEmail=${encodeURIComponent(user.email)}`);

      if (!response.ok) {
        throw new Error("Impossibile leggere i preferiti.");
      }

      const favorites = await response.json();
      return {
        userEmail: user.email,
        recipeIds: favorites.map((favorite) => favorite.recipeId),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  "recipes/toggleFavorite",
  async (recipeId, { getState, rejectWithValue }) => {
    try {
      const user = getState().auth.user;

      if (!user) {
        throw new Error("Devi effettuare il login per salvare una ricetta.");
      }

      // Prima controlliamo se questo preferito esiste già nel db.
      // Se esiste lo eliminiamo, altrimenti lo creiamo.
      const searchResponse = await fetch(
        `${API_URL}/favorites?userEmail=${encodeURIComponent(user.email)}&recipeId=${recipeId}`,
      );

      if (!searchResponse.ok) {
        throw new Error("Impossibile verificare il preferito.");
      }

      const existingFavorites = await searchResponse.json();
      const existingFavorite = existingFavorites[0];

      if (existingFavorite) {
        const deleteResponse = await fetch(`${API_URL}/favorites/${existingFavorite.id}`, {
          method: "DELETE",
        });

        if (!deleteResponse.ok) {
          throw new Error("Impossibile rimuovere il preferito.");
        }

        return { recipeId, saved: false };
      }

      const createResponse = await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          recipeId,
          createdAt: new Date().toISOString().slice(0, 10),
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Impossibile salvare il preferito.");
      }

      return { recipeId, saved: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createRecipe = createAsyncThunk(
  "recipes/createRecipe",
  async (recipe, { rejectWithValue }) => {
    try {
      // POST crea un nuovo record nel file db.json tramite JSON Server.
      const response = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error("Impossibile creare la ricetta.");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateRecipe = createAsyncThunk(
  "recipes/updateRecipe",
  async (recipe, { rejectWithValue }) => {
    try {
      // PUT sostituisce il record esistente con i dati aggiornati dal form admin.
      const response = await fetch(`${API_URL}/recipes/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error("Impossibile aggiornare la ricetta.");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteRecipe = createAsyncThunk(
  "recipes/deleteRecipe",
  async (id, { rejectWithValue }) => {
    try {
      // 1) Viene eliminata prima la ricetta.
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Impossibile eliminare la ricetta.");
      }

      // 2) Poi vengono eliminate le recensioni collegate a quella ricetta.
      // JSON Server non fa cancellazioni a cascata automatiche, quindi vengono
      // gestite manualmente da questo thunk.
      const reviewsResponse = await fetch(`${API_URL}/reviews?recipeId=${id}`);

      if (!reviewsResponse.ok) {
        throw new Error("Ricetta eliminata, ma impossibile leggere le recensioni collegate.");
      }

      const linkedReviews = await reviewsResponse.json();
      await Promise.all(
        linkedReviews.map((review) =>
          fetch(`${API_URL}/reviews/${review.id}`, {
            method: "DELETE",
          }),
        ),
      );

      // 3) Vengono rimossi anche eventuali preferiti collegati alla ricetta eliminata.
      const favoritesResponse = await fetch(`${API_URL}/favorites?recipeId=${id}`);

      if (favoritesResponse.ok) {
        const linkedFavorites = await favoritesResponse.json();
        await Promise.all(
          linkedFavorites.map((favorite) =>
            fetch(`${API_URL}/favorites/${favorite.id}`, {
              method: "DELETE",
            }),
          ),
        );
      }

      return {
        id,
        deletedReviewIds: linkedReviews.map((review) => review.id),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const recipesSlice = createSlice({
  name: "recipes",
  initialState: {
    // items contiene il catalogo recuperato dalla API.
    items: [],
    // favorites contiene solo gli id delle ricette salvate dall'utente corrente.
    // I dati veri stanno nel db.json dentro la collezione "favorites".
    favorites: [],
    // status permette alla UI di distinguere caricamento, successo ed errore.
    status: "idle",
    favoritesStatus: "idle",
    favoriteUserEmail: null,
    error: "",
    favoritesError: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // extraReducers ascolta le action generate dai thunk asincroni.
      // Qui viene collegato il ciclo della chiamata API allo stato della UI.
      .addCase(fetchRecipes.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Errore durante il caricamento.";
      })
      .addCase(fetchFavorites.pending, (state) => {
        state.favoritesStatus = "loading";
        state.favoritesError = "";
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favoritesStatus = "succeeded";
        state.favoriteUserEmail = action.payload.userEmail;
        state.favorites = action.payload.recipeIds;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.favoritesStatus = "failed";
        state.favoritesError = action.payload || "Errore durante il caricamento dei preferiti.";
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { recipeId, saved } = action.payload;

        if (saved && !state.favorites.includes(recipeId)) {
          state.favorites.push(recipeId);
        }

        if (!saved) {
          state.favorites = state.favorites.filter((id) => id !== recipeId);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.favoritesError = action.payload || "Errore durante il salvataggio del preferito.";
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const index = state.items.findIndex((recipe) => recipe.id === action.payload.id);

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.items = state.items.filter((recipe) => recipe.id !== action.payload.id);
        state.favorites = state.favorites.filter((id) => id !== action.payload.id);
      });
  },
});

export default recipesSlice.reducer;
