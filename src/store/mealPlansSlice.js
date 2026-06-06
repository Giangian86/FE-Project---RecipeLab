/*
  SLICE PIANI GIORNALIERI
  
  Gestisce i piani pasto dell'utente. Usa GET per caricarli e POST/PUT per salvarli.
  La logica decide se creare un nuovo piano o aggiornare quello esistente.
*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_URL } from "../config/api.js";

export const fetchMealPlans = createAsyncThunk(
  "mealPlans/fetchMealPlans",
  async (_, { rejectWithValue }) => {
    try {
      // GET di tutti i piani giornalieri salvati in JSON Server.
      // Il filtro per utente viene fatto nei componenti usando userEmail.
      const response = await fetch(`${API_URL}/mealPlans`);

      if (!response.ok) {
        throw new Error("Impossibile leggere i piani giornalieri.");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const saveMealPlan = createAsyncThunk(
  "mealPlans/saveMealPlan",
  async (mealPlan, { rejectWithValue }) => {
    try {
      // Se mealPlan ha già un id significa che esiste nel database: viene usato PUT.
      // Se non ha id è un nuovo piano: viene usato POST.
      const hasId = Boolean(mealPlan.id);
      const response = await fetch(`${API_URL}/mealPlans${hasId ? `/${mealPlan.id}` : ""}`, {
        method: hasId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealPlan),
      });

      if (!response.ok) {
        throw new Error("Impossibile salvare il piano giornaliero.");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const mealPlansSlice = createSlice({
  name: "mealPlans",
  initialState: {
    // items raccoglie tutti i piani recuperati dalla API.
    items: [],
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealPlans.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchMealPlans.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchMealPlans.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Errore durante il caricamento.";
      })
      .addCase(saveMealPlan.fulfilled, (state, action) => {
        // Viene aggiornato lo stato locale subito dopo la risposta della API.
        // Se il piano non c'era viene aggiunto, altrimenti viene sostituito quello vecchio.
        const index = state.items.findIndex((mealPlan) => mealPlan.id === action.payload.id);

        if (index === -1) {
          state.items.push(action.payload);
        } else {
          state.items[index] = action.payload;
        }
      });
  },
});

export default mealPlansSlice.reducer;
