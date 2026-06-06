/*
  PIANO GIORNALIERO

  Questa pagina permette all'utente con ruolo user di creare o modificare
  un piano pasti per una singola data.

  Il piano viene salvato nel database tramite JSON Server.
  Se esiste già un piano per la data selezionata, viene aggiornato.
  Se non esiste, viene creato un nuovo piano.
*/
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FieldError from "../components/FieldError.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fetchMealPlans, saveMealPlan } from "../store/mealPlansSlice.js";
import { fetchRecipes } from "../store/recipesSlice.js";
import { required } from "../utils/validation.js";

function getTodayDate() {
  /*
    L'input type="date" richiede una stringa nel formato YYYY-MM-DD.
    toISOString restituisce una data completa, quindi con slice prendiamo
    solo la parte iniziale.
  */
  return new Date().toISOString().slice(0, 10);
}

export default function Planner() {
  /*
    useDispatch qui viene usato per caricare ricette, 
    piani e salvare il piano quotidiano.
  */
  const dispatch = useDispatch();
  /*
    Dati letti dallo store Redux.
    user arriva da authSlice.
    recipes arriva da recipesSlice.
    mealPlans arriva da mealPlansSlice.
  */
  const user = useSelector((state) => state.auth.user);
  const recipes = useSelector((state) => state.recipes.items);
  const recipesStatus = useSelector((state) => state.recipes.status);
  const mealPlans = useSelector((state) => state.mealPlans.items);
  const mealPlansStatus = useSelector((state) => state.mealPlans.status);
  /*
    Stato locale del form controllato.
    Ogni campo del form legge e aggiorna una proprietà di formData.
  */
  const [formData, setFormData] = useState({
    planDate: getTodayDate(),
    breakfastId: "",
    lunchId: "",
    dinnerId: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [savedMessage, setSavedMessage] = useState("");
  const [hasLoadedInitialPlan, setHasLoadedInitialPlan] = useState(false);
/*
    Vengono filtrati i piani prendendo solo quelli dell'utente loggato.
    Il collegamento viene fatto tramite userEmail.
  */
  const userMealPlans = useMemo(
    () => mealPlans.filter((plan) => plan.userEmail === user.email),
    [mealPlans, user.email],
  );
  /*
    Ogni data identifica un piano dell'utente.
    Se esiste già un piano per la data selezionata, il submit farà una PUT.
    Se non esiste, il submit farà una POST e creerà un nuovo piano.
  */
  const selectedPlan = useMemo(() => {
    
    return userMealPlans.find((plan) => plan.planDate === formData.planDate);
  }, [formData.planDate, userMealPlans]);

  useEffect(() => {
    /* 
      Qui viene usato Redux Thunk per caricare dati da JSON Server:
      fetchRecipes popola le select, fetchMealPlans recupera i piani salvati.
    */
    if (recipesStatus === "idle") {
      dispatch(fetchRecipes());
    }

    if (mealPlansStatus === "idle") {
      dispatch(fetchMealPlans());
    }
  }, [dispatch, mealPlansStatus, recipesStatus]);

  useEffect(() => {
    /*
      Quando i piani arrivano dalla API, se l'utente ha già un piano salvato,
      viene impostata la data del primo piano trovato.

      hasLoadedInitialPlan evita che questo effetto sovrascriva il form
      ogni volta che mealPlans cambia.
    */
    if (!hasLoadedInitialPlan && userMealPlans.length > 0) {
      const firstPlan = userMealPlans[0];

      setFormData((currentData) => ({
        ...currentData,
        planDate: firstPlan.planDate || getTodayDate(),
      }));
      setHasLoadedInitialPlan(true);
    }
  }, [hasLoadedInitialPlan, userMealPlans]);

  useEffect(() => {
    /*
      Se l'utente seleziona una data per cui esiste già un piano,
      il form viene precompilato con i dati salvati.
    */
    if (selectedPlan) {
      setFormData({
        planDate: selectedPlan.planDate,
        breakfastId: selectedPlan.breakfastId,
        lunchId: selectedPlan.lunchId,
        dinnerId: selectedPlan.dinnerId,
        notes: selectedPlan.notes,
      });
    }
  }, [selectedPlan]);

  function handleChange(event) {
    /*
      Form controllato:
      ogni campo ha name uguale alla proprietà da aggiornare in formData.
    */
    const { name, value } = event.target;
    /*
      I valori delle select arrivano come stringhe.
      Per gli id delle ricette li convertiamo in numeri.
    */
    const recipeFields = ["breakfastId", "lunchId", "dinnerId"];

    setFormData((currentData) => ({
      ...currentData,
      [name]: recipeFields.includes(name) ? Number(value) : value,
    }));
  }

  function validate() {
    /*
      Validazione minima del form:
      - la data è obbligatoria;
      - colazione, pranzo e cena devono essere selezionati.
    */
    const nextErrors = {};

    if (!required(formData.planDate)) {
      nextErrors.planDate = "Seleziona una data per il piani giornalieri.";
    }

    if (!formData.breakfastId || !formData.lunchId || !formData.dinnerId) {
      nextErrors.recipes = "Scegli una ricetta per colazione, pranzo e cena.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    /*
      Evita il refresh della pagina causato dal submit HTML di default.
    */
    event.preventDefault();

    if (!validate()) {
      return;
    }
    /*
      saveMealPlan è un thunk Redux.
      Se viene passato un id, aggiorna il piano esistente.
      Se l'id manca, crea un nuovo piano.
    */
    dispatch(
      saveMealPlan({
        id: selectedPlan?.id,
        userEmail: user.email,
        ...formData,
      }),
    );
    setSavedMessage("Piano giornaliero salvato correttamente.");
  }

  const publishedRecipes = recipes.filter((recipe) => recipe.status === "pubblicata");

  return (
    <>
      <PageHeader
        title="Piano giornaliero"
        description="Crea il tuo piano pasti giornaliero scegliendo ricette dal catalogo."
      />
      <section className="profile-layout">
        <form className="panel form-stack card shadow-sm" onSubmit={handleSubmit}>
          <label htmlFor="planner-date">
            Data piano giornaliero
            <input
              id="planner-date"
              className="form-control"
              name="planDate"
              type="date"
              value={formData.planDate}
              onChange={handleChange}
            />
            <FieldError message={errors.planDate} />
          </label>

          <label htmlFor="planner-breakfast">
            Colazione
            <select
              id="planner-breakfast"
              className="form-select"
              name="breakfastId"
              value={formData.breakfastId}
              onChange={handleChange}
            >
              <option value="">Scegli una ricetta</option>
              {publishedRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="planner-lunch">
            Pranzo
            <select
              id="planner-lunch"
              className="form-select"
              name="lunchId"
              value={formData.lunchId}
              onChange={handleChange}
            >
              <option value="">Scegli una ricetta</option>
              {publishedRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="planner-dinner">
            Cena
            <select
              id="planner-dinner"
              className="form-select"
              name="dinnerId"
              value={formData.dinnerId}
              onChange={handleChange}
            >
              <option value="">Scegli una ricetta</option>
              {publishedRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>
            <FieldError message={errors.recipes} />
          </label>

          <label htmlFor="planner-notes">
            Note
            <textarea
              id="planner-notes"
              className="form-control"
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
            />
          </label>

          {savedMessage && <p className="alert alert-success success">{savedMessage}</p>}

          <button className="btn btn-primary" type="submit">
            Salva piano giornaliero
          </button>
        </form>

        <aside className="panel planner-preview card shadow-sm">
          <h2>Anteprima</h2>
          <div className="planner-slot">
            <span>Data</span>
            <strong>{formData.planDate || "Non selezionata"}</strong>
          </div>
          {["breakfastId", "lunchId", "dinnerId"].map((field) => {
            const recipe = recipes.find((item) => item.id === Number(formData[field]));
            const label = field === "breakfastId" ? "Colazione" : field === "lunchId" ? "Pranzo" : "Cena";

            return (
              <div key={field} className="planner-slot">
                <span>{label}</span>
                <strong>{recipe ? recipe.title : "Non selezionata"}</strong>
              </div>
            );
          })}
        </aside>
      </section>
    </>
  );
}
