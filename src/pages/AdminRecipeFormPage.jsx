/*
  PAGINA FORM ADMIN
  
  Questa pagina contiene il form usato dall'admin per:
  - creare una nuova ricetta;
  - modificare una ricetta esistente.

  La modalità viene decisa leggendo il parametro id dalla route:
  - se l'id esiste, siamo in modifica;
  - se l'id non esiste, siamo in creazione.

  Il form vero e proprio è gestito dal componente RecipeForm.
  Questa pagina si occupa invece di:
  - recuperare i dati da Redux;
  - inviare createRecipe o updateRecipe;
  - gestire caricamento, errori e navigazione finale.
*/
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import RecipeForm from "../components/RecipeForm.jsx";
import { createRecipe, fetchRecipes, updateRecipe } from "../store/recipesSlice.js";

export default function AdminRecipeFormPage() {
  /*
    useDispatch permette di inviare azioni Redux.
    Qui viene usato per fetchRecipes, createRecipe e updateRecipe.
  */
  const dispatch = useDispatch();
  /*
    useNavigate permette di cambiare pagina via codice.
    Dopo il salvataggio, l'admin viene riportato all'archivio ricette.
  */
  const navigate = useNavigate();
  /*
    useParams legge i parametri dinamici della route.
    Nella route /admin/recipes/edit/:id, id contiene l'id della ricetta da modificare.
  */
  const { id } = useParams();
  /*
    Dal Redux store vengono letti:
    - items: lista delle ricette;
    - status: stato del caricamento delle ricette.
  */
  const { items, status } = useSelector((state) => state.recipes);
  /*
    id arriva dalla URL come stringa.
    Lo convertiamo in numero per confrontarlo con recipe.id.
  */
  const recipeId = id ? Number(id) : null;
  /*
    Se in modalità modifica, viene cercata nello store la ricetta con lo stesso id.
    Se in modalità creazione, editingRecipe resta null.
  */
  const editingRecipe = recipeId ? items.find((recipe) => recipe.id === recipeId) : null;
  /*
    isEditing diventa true se nella route è presente un id.
    Questo valore viene usato per decidere se creare o aggiornare.
  */
  const isEditing = Boolean(recipeId);
  /*
    Stati locali della pagina:
    - isSaving indica se il salvataggio è in corso;
    - saveError contiene eventuali errori di salvataggio.
  */
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    /*
      Se le ricette non sono ancora state caricate, vengono recuperate dalla API.
      Questo è necessario soprattutto quando l'admin apre direttamente
      una pagina di modifica tramite URL.
    */
    if (status === "idle") {
      dispatch(fetchRecipes());
    }
  }, [dispatch, status]);

  async function handleSubmit(recipe) {
    try {
      /*
        Prima del salvataggio viene attivato lo stato di caricamento
        e cancellati eventuali errori precedenti.
      */
      setIsSaving(true);
      setSaveError("");

      /*
        unwrap() trasforma il risultato del thunk in una Promise normale.

        Se createRecipe/updateRecipe vanno a buon fine, il codice prosegue.
        Se invece la chiamata API fallisce, viene eseguito il catch.
      */
      if (isEditing) {
        await dispatch(updateRecipe(recipe)).unwrap();
      } else {
        await dispatch(createRecipe(recipe)).unwrap();
      }

      /*
        La navigazione avviene solo dopo il salvataggio riuscito.
      */
      navigate("/admin/recipes/archive");
    } catch (error) {
      /*
        Se il salvataggio fallisce, mostriamo un messaggio nella pagina.
        Il throw permette anche al componente RecipeForm di sapere
        che il salvataggio non è andato a buon fine.
      */
      setSaveError(error || "Errore durante il salvataggio della ricetta.");
      throw error;
    } finally {
      /*
        finally viene eseguito sia in caso di successo sia in caso di errore,
        e viene disattivato lo stato di salvataggio.
      */
      setIsSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title={isEditing ? "Modifica ricetta" : "Inserimento ricetta"}
        description={
          isEditing
            ? "Aggiorna una ricetta esistente con nuove informazioni, ingredienti o immagini."
            : "Crea qui la tua nuova ricetta, pronta per essere pubblicata e condivisa con la community."
        }
      />

      <section className="admin-layout">
        <AdminSidebar />

        <div className="admin-content">
          {/* Messaggio mostrato mentre vengono caricate le ricette in modalità modifica. */}
          {isEditing && status === "loading" && <p className="panel">Caricamento ricetta...</p>}
          {/* Se l'id è presente ma non esiste nessuna ricetta corrispondente. */}
          {isEditing && status === "succeeded" && !editingRecipe && (
            <p className="panel">Ricetta non trovata.</p>
          )}
          {/* Errore di salvataggio, per esempio se la chiamata API fallisce. */}
          {saveError && <p className="alert alert-danger error">{saveError}</p>}

          {(!isEditing || editingRecipe) && (
            <RecipeForm
              initialRecipe={editingRecipe}
              isSubmitting={isSaving}
              onCancel={() => navigate("/admin/recipes/archive")}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </section>
    </>
  );
}
