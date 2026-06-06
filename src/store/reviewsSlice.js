/*
  SLICE RECENSIONI

  Gestisce lettura, creazione, modifica ed eliminazione delle recensioni.
*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_URL } from "../config/api.js";
import { deleteRecipe } from "./recipesSlice.js";

export const fetchReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (_, { rejectWithValue }) => {
    try {
      // Recupera tutte le recensioni. I componenti poi filtrano per ricetta o utente.
      const response = await fetch(`${API_URL}/reviews`);

      if (!response.ok) {
        throw new Error("Impossibile leggere le recensioni.");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createReview = createAsyncThunk(
  "reviews/createReview",
  async (review, { rejectWithValue }) => {
    try {
      // Il body della POST contiene rating, commento, utente e id della ricetta.
      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        throw new Error("Impossibile salvare la recensione.");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async (review, { rejectWithValue }) => {
    try {
      // La modifica recensione usa PUT per salvare rating e testo aggiornati.
      const response = await fetch(`${API_URL}/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        throw new Error("Impossibile aggiornare la recensione.");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (id, { rejectWithValue }) => {
    try {
      // L'eliminazione è disponibile sia al proprietario sia all'admin,
      // ma il controllo del permesso avviene nella UI prima di mostrare il bottone.
      const response = await fetch(`${API_URL}/reviews/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Impossibile eliminare la recensione.");
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState: {
    items: [],
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // pending/fulfilled/rejected sono i tre stati automatici generati da createAsyncThunk.
      // pending parte mentre la chiamata HTTP è in corso, fulfilled quando va a buon fine,
      // rejected quando fallisce. Questo pattern rende prevedibile la UI: loading, dati, errore.
      .addCase(fetchReviews.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Errore durante il caricamento.";
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.items.findIndex((review) => review.id === action.payload.id);

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.items = state.items.filter((review) => review.id !== action.payload);
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        // Quando l'admin elimina una ricetta, vengono tolte dallo store anche
        // le recensioni collegate, che sono vengono eliminate dal db.
        state.items = state.items.filter(
          (review) => !action.payload.deletedReviewIds.includes(review.id),
        );
      });
  },
});

export default reviewsSlice.reducer;
