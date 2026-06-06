/*
  MAPPA DELLE ROTTE
  
  Questo file definisce la struttura principale della Single Page Application.
  Con React Router ogni <Route> associa un URL a un componente/pagina.

  Alcune route sono pubbliche, come homepage, login e registrazione.
  Altre route sono protette tramite ProtectedRoute, quindi possono essere viste
  solo da utenti autenticati o da utenti con un ruolo specifico.
*/
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Recipes from "./pages/Recipes.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

// Queste pagine sono caricate solo quando servono, utilizzando il code splitting 
// per ottimizzare il caricamento.
const AdminRecipes = lazy(() => import("./pages/AdminRecipes.jsx"));
const AdminRecipeFormPage = lazy(() => import("./pages/AdminRecipeFormPage.jsx"));
const AdminUsers = lazy(() => import("./pages/AdminUsers.jsx"));
const AdminUserDetail = lazy(() => import("./pages/AdminUserDetail.jsx"));
const Planner = lazy(() => import("./pages/Planner.jsx"));

export default function App() {
  return (
    
    //Suspense mostra un contenuto provvisorio mentre React sta caricando
    //una pagina importata con lazy.
    
    <Suspense fallback={<p className="page-loader">Caricamento pagina...</p>}>
      <Routes>
        {/*
          Layout è il contenitore comune delle pagine.
          Dentro Layout ci sono elementi condivisi come navbar, main e footer.
          Le route figlie vengono renderizzate tramite <Outlet /> dentro Layout.
        */}
        <Route element={<Layout />}>
          {/* Route pubbliche */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Le ricette sono contenuto riservato agli utenti autenticati.
              ProtectedRoute controlla se esiste un utente nello stato Redux:
              - se non c'è, manda l'utente alla pagina di login;
              - se c'è, renderizza normalmente la pagina richiesta.
              In questo modo anche chi scrive manualmente /recipes nella barra URL
              viene bloccato, non solo chi clicca dalla homepage. */}
          <Route
            path="recipes"
            element={
              <ProtectedRoute>
                <Recipes />
              </ProtectedRoute>
            }
          />
          {/*
            Route dinamica.
            :id indica un parametro variabile dell'URL.
            Per esempio /recipes/3 mostra il dettaglio della ricetta con id 3.
          */}
          <Route
            path="recipes/:id"
            element={
              <ProtectedRoute>
                <RecipeDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/*
            Route protetta per il solo ruolo user.
            In questo modo l'admin non accede al piano giornaliero,
            che è pensato come funzione dell'utente normale.
          */}
          <Route
            path="planner"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Planner />
              </ProtectedRoute>
            }
          />
          {/*
            Route admin.
            allowedRoles={["admin"]} permette l'accesso solo agli utenti
            con ruolo admin.
          */}
          <Route
            path="admin/recipes/archive"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRecipes />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/recipes/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRecipeFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/recipes/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRecipeFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUserDetail />
              </ProtectedRoute>
            }
          />

          {/*
            Redirect interni.
            Navigate viene usato per indirizzare automaticamente alcune URL
            alternative verso le pagine corrette.
          */}
          <Route path="admin" element={<Navigate to="/admin/users" replace />} />
          <Route path="admin/recipes" element={<Navigate to="/admin/recipes/archive" replace />} />
          <Route path="resources" element={<Navigate to="/recipes" replace />} />
          {/* Route jolly: intercetta tutte le URL non trovate e mostra la pagina 404. */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
