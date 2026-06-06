/*
  REDUX STORE CENTRALE

  Questo file crea lo store globale dell'applicazione.

  Lo store è il contenitore centrale dello stato Redux.
  Al suo interno vengono registrati tutti gli slice dell'app:
  - auth;
  - recipes;
  - reviews;
  - mealPlans;
  - users.

  Ogni slice gestisce una parte specifica dello stato globale.
*/
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import mealPlansReducer from "./mealPlansSlice.js";
import recipesReducer from "./recipesSlice.js";
import reviewsReducer from "./reviewsSlice.js";
import usersReducer from "./usersSlice.js";

// configureStore crea lo store Redux e attiva già Redux Thunk.

export const store = configureStore({
  reducer: {
    /*
      Ogni chiave diventa una proprietà dello stato globale.
    */
    auth: authReducer,
    mealPlans: mealPlansReducer,
    recipes: recipesReducer,
    reviews: reviewsReducer,
    users: usersReducer,
  },
});
