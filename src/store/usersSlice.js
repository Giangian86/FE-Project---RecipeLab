/*
  SLICE USERS

  Gestisce registrazione utenti, lista utenti per admin ed eliminazione account user.
  Anche la registrazione è simulata tramite JSON Server.
*/
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_URL } from "../config/api.js";

/*
  fetchUsers recupera tutti gli utenti dal database.

  Viene usato soprattutto nell'area admin:
  - pagina gestione utenti;
  - scheda dettaglio utente.
*/
export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/users`);

    if (!response.ok) {
      throw new Error("Impossibile caricare gli utenti.");
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

/*
  createUser registra un nuovo utente.

  Prima controlla se esiste già un utente con la stessa email.
  Se l'email è libera, crea un nuovo record nel database.
*/
export const createUser = createAsyncThunk("users/createUser", async (user, { rejectWithValue }) => {
  try {
    const duplicateResponse = await fetch(`${API_URL}/users?email=${encodeURIComponent(user.email)}`);

    if (!duplicateResponse.ok) {
      throw new Error("Impossibile verificare la email.");
    }

    const existingUsers = await duplicateResponse.json();

    if (existingUsers.length > 0) {
      return rejectWithValue("Questa email è già registrata.");
    }
    /*
      Creazione del nuovo utente.
    */
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...user,
        role: "user",
        isOnline: false,
        registeredAt: new Date().toISOString().slice(0, 10),
        bio: "",
      }),
    });

    if (!response.ok) {
      throw new Error("Impossibile creare l'utente.");
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});
/*
  deleteUser elimina un utente dal database.

  Viene usato dall'admin nella pagina Gestione utenti.
*/
export const deleteUser = createAsyncThunk("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Impossibile eliminare l'utente.");
    }

    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState: {
    /*
      items contiene la lista utenti caricata dal database.
    */
    items: [],
    /*
      status ed error riguardano il caricamento della lista utenti.
    */
    status: "idle",
    error: "",
    registrationStatus: "idle",
    registrationError: "",
  },
  reducers: {
    clearRegistrationState(state) {
      state.registrationStatus = "idle";
      state.registrationError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      /*
        Stati del caricamento utenti.
      */
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Errore durante il caricamento utenti.";
      })
      /*
        Stati della registrazione nuovo utente.
      */
      .addCase(createUser.pending, (state) => {
        state.registrationStatus = "loading";
        state.registrationError = "";
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.registrationStatus = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.registrationStatus = "failed";
        state.registrationError = action.payload || "Errore durante la registrazione.";
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((user) => user.id !== action.payload);
      });
  },
});

export const { clearRegistrationState } = usersSlice.actions;
export default usersSlice.reducer;
