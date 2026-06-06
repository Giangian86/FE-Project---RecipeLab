/*
  SLICE AUTENTICAZIONE

  Gestisce il fake login, l'utente corrente, l'errore di login e il logout.
  E' globale perche molte parti dell'app devono sapere se l'utente è loggato e che ruolo ha.
*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_URL } from "../config/api.js";

const STORAGE_KEY = "recipelab-user";

// L'autenticazione è simulata lato frontend, Redux verifica le credenziali confrontandole
// con la lista degli utenti registrati in locale.
function loadStoredUser() {
  // localStorage mantiene il login anche se la pagina viene ricaricata.
  const savedUser = localStorage.getItem(STORAGE_KEY);
  return savedUser ? JSON.parse(savedUser) : null;
}

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    // Il login resta simulato, ma legge gli utenti da JSON Server.
    // Questo permette anche agli utenti registrati dalla home di accedere davvero.
    const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(credentials.email)}`);

    if (!response.ok) {
      throw new Error("Impossibile verificare le credenziali.");
    }

    const users = await response.json();
    const foundUser = users.find((user) => user.password === credentials.password);

    if (!foundUser) {
      return rejectWithValue("Email o password non validi.");
    }

    return {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      // registeredAt arriva dal db.json: la dashboard lo usa per mostrare
      // la data reale di registrazione dell'utente.
      registeredAt: foundUser.registeredAt,
      // avatar è opzionale: se nel db non c'è o è vuoto, la dashboard
      // mostrerà un placeholder con l'iniziale del nome.
      avatar: foundUser.avatar || "",
      // bio è modificabile dalla dashboard e resta salvata nel db.json.
      bio: foundUser.bio || "",
      isOnline: true,
    };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});


export const updateProfileBio = createAsyncThunk(
  "auth/updateProfileBio",
  async (bio, { getState, rejectWithValue }) => {
    try {
      const user = getState().auth.user;

      if (!user) {
        throw new Error("Devi effettuare il login per modificare la bio.");
      }

      // La bio viene salvata nel db.json aggiornando il record dell'utente corrente.
      // PATCH modifica solo il campo bio, senza sovrascrivere email, ruolo o altri dati.
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        throw new Error("Impossibile salvare la bio.");
      }

      const updatedUser = await response.json();

      return {
        bio: updatedUser.bio || "",
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    // user è null quando non c'è stata ancora alcuna autenticazione.
    // Quando il login va bene diventa un oggetto con email, nome e ruolo.
    user: loadStoredUser(),
    error: "",
    bioStatus: "idle",
    bioError: "",
  },
  reducers: {
    logout(state) {
      // Logout: pulisce sia Redux sia localStorage.
      // Cosi al refresh della pagina l'utente non resta autenticato.
      state.user = null;
      state.error = "";
      localStorage.removeItem(STORAGE_KEY);
    },
    clearAuthError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.error = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = "";
        state.bioStatus = "idle";
        state.bioError = "";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      })
      .addCase(updateProfileBio.pending, (state) => {
        state.bioStatus = "loading";
        state.bioError = "";
      })
      .addCase(updateProfileBio.fulfilled, (state, action) => {
        state.bioStatus = "succeeded";

        if (state.user) {
          state.user.bio = action.payload.bio;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
        }
      })
      .addCase(updateProfileBio.rejected, (state, action) => {
        state.bioStatus = "failed";
        state.bioError = action.payload || "Errore durante il salvataggio della bio.";
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.error = action.payload || "Email o password non validi.";
        localStorage.removeItem(STORAGE_KEY);
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;
