/*
  FORM RICETTA ADMIN
  
  Questo componente gestisce il form usato dall'admin per creare
  una nuova ricetta o modificare una ricetta esistente.

  È un form controllato:
  ogni campo prende il valore da formData e aggiorna formData tramite onChange.

  Il componente riceve tramite props:
  - initialRecipe: ricetta iniziale da modificare, se presente;
  - onSubmit: funzione da eseguire al salvataggio;
  - onCancel: funzione per annullare la modifica;
  - isSubmitting: indica se il salvataggio è in corso.
*/

import { useEffect, useState } from "react";
import FieldError from "./FieldError.jsx";
import { minLength, positiveNumber, required } from "../utils/validation.js";

/*
  Stato iniziale del form.

  Viene usato quando si crea una nuova ricetta
  oppure quando bisogna svuotare il form dopo il salvataggio.
*/
const emptyForm = {
  title: "",
  category: "Cena",
  cuisine: "Italiana",
  difficulty: "facile",
  time: 30,
  servings: 2,
  status: "pubblicata",
  image: "",
  description: "",
  ingredientsText: "",
  stepsText: "",
};

/*
  Converte una ricetta dal formato database al formato form.

  Nel database ingredients e steps sono array.
  Nel form invece vengono mostrati dentro textarea, quindi devono diventare
  testo multi-riga.
*/
function recipeToForm(recipe) {
  if (!recipe) {
    return emptyForm;
  }

  return {
    ...recipe,
    ingredientsText: recipe.ingredients.join("\n"),
    stepsText: recipe.steps.join("\n"),
  };
}
/*
  Converte i dati del form nel formato corretto per il database.

  Le textarea di ingredienti e passaggi contengono testo multi-riga.
  Prima del salvataggio, ogni riga viene trasformata in un elemento dell'array.

  trim elimina spazi inutili.
  filter(Boolean) elimina eventuali righe vuote.
*/
function formToRecipe(formData) {
  return {
    ...formData,
    ingredients: formData.ingredientsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    steps: formData.stepsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

export default function RecipeForm({ initialRecipe, onSubmit, onCancel, isSubmitting = false }) {
  /*
    formData contiene tutti i valori dei campi del form.
    errors contiene i messaggi di errore prodotti dalla validazione.
  */
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    /*
      Quando initialRecipe cambia, il form viene aggiornato.

      Se initialRecipe esiste, l'app è in modalità modifica e il form viene
      compilato con i dati della ricetta.
      Se initialRecipe non esiste, il form torna vuoto per la creazione.
    */
    setFormData(recipeToForm(initialRecipe));
    setErrors({});
  }, [initialRecipe]);

  function handleChange(event) {
    /*
      handleChange viene usata da tutti i campi del form.

      Grazie all'attributo name degli input, possiamo aggiornare
      dinamicamente la proprietà corretta di formData.
    */
    const { name, value } = event.target;
    /*
      Gli input HTML restituiscono sempre stringhe.
      Per i campi numerici convertiamo il valore in Number.
    */
    const numericFields = ["time", "servings"];

    setFormData((currentData) => ({
      ...currentData,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  }

  function validate() {
    /*
      La funzione validate costruisce un oggetto errors.
      Ogni proprietà corrisponde al name del campo da segnalare.
    */
    const nextErrors = {};

    if (!minLength(formData.title, 3)) {
      nextErrors.title = "Il titolo deve avere almeno 3 caratteri.";
    }

    if (!required(formData.image)) {
      nextErrors.image = "Inserisci un URL immagine.";
    }

    if (!required(formData.description)) {
      nextErrors.description = "La descrizione è obbligatoria.";
    }

    if (!positiveNumber(formData.time)) {
      nextErrors.time = "Il tempo deve essere maggiore di zero.";
    }

    if (!positiveNumber(formData.servings)) {
      nextErrors.servings = "Le porzioni devono essere maggiori di zero.";
    }

    if (!required(formData.ingredientsText)) {
      nextErrors.ingredientsText = "Inserisci almeno un ingrediente.";
    }

    if (!required(formData.stepsText)) {
      nextErrors.stepsText = "Inserisci almeno un passaggio.";
    }

    setErrors(nextErrors);
    /*
      Se l'oggetto errors non ha chiavi, il form è valido.
    */
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    /*
      Se la validazione fallisce, il salvataggio viene bloccato.
    */
    if (!validate()) {
      return;
    }
    /*
      Prima del salvataggio convertiamo il form nel formato previsto dal database.
    */
    const recipe = formToRecipe(formData);
    delete recipe.ingredientsText;
    delete recipe.stepsText;

    try {
      /* 
        onSubmit arriva dalla pagina admin ed esegue createRecipe/updateRecipe.
        Si usa await per aspettare la risposta dell'API
        prima di svuotare il form o cambiare pagina.
      */
      await onSubmit(recipe);
      /*
        Se la ricetta è stata salvata con successo, il form viene svuotato.
        In modifica invece non viene svuotato, perché l'utente sta lavorando
        su una ricetta esistente.
      */
      if (!initialRecipe) {
        setFormData(emptyForm);
      }
    } catch {
      /*
        L'errore viene gestito dalla pagina admin.
        Qui evitiamo solo di svuotare il form se il salvataggio fallisce.
      */
    }
  }

  return (
    <form className="panel form-grid card shadow-sm" onSubmit={handleSubmit}>
    <h2 className="full-row">{initialRecipe ? "Modifica ricetta" : "Nuova ricetta"}</h2>

    <label htmlFor="recipe-title">
      Titolo
      <input
        id="recipe-title"
        className="form-control"
        name="title"
        value={formData.title}
        onChange={handleChange}
      />
      <FieldError message={errors.title} />
    </label>

    <label htmlFor="recipe-image">
      URL immagine
      <input
        id="recipe-image"
        className="form-control"
        name="image"
        value={formData.image}
        onChange={handleChange}
      />
      <FieldError message={errors.image} />
    </label>

    <label htmlFor="recipe-category">
      Categoria
      <select
        id="recipe-category"
        className="form-select"
        name="category"
        value={formData.category}
        onChange={handleChange}
      >
        <option>Colazione</option>
        <option>Pranzo</option>
        <option>Cena</option>
        <option>Dessert</option>
      </select>
    </label>

    <label htmlFor="recipe-cuisine">
      Cucina
      <input
        id="recipe-cuisine"
        className="form-control"
        name="cuisine"
        value={formData.cuisine}
        onChange={handleChange}
      />
    </label>

    <label htmlFor="recipe-difficulty">
      Difficoltà
      <select
        id="recipe-difficulty"
        className="form-select"
        name="difficulty"
        value={formData.difficulty}
        onChange={handleChange}
      >
        <option value="facile">facile</option>
        <option value="media">media</option>
        <option value="avanzata">avanzata</option>
      </select>
    </label>

    <label htmlFor="recipe-status">
      Stato
      <select
        id="recipe-status"
        className="form-select"
        name="status"
        value={formData.status}
        onChange={handleChange}
      >
        <option value="pubblicata">pubblicata</option>
        <option value="bozza">bozza</option>
      </select>
    </label>

    <label htmlFor="recipe-time">
      Minuti
      <input
        id="recipe-time"
        className="form-control"
        min="1"
        name="time"
        type="number"
        value={formData.time}
        onChange={handleChange}
      />
      <FieldError message={errors.time} />
    </label>

    <label htmlFor="recipe-servings">
      Porzioni
      <input
        id="recipe-servings"
        className="form-control"
        min="1"
        name="servings"
        type="number"
        value={formData.servings}
        onChange={handleChange}
      />
      <FieldError message={errors.servings} />
    </label>

    <label htmlFor="recipe-description" className="full-row">
      Descrizione
      <textarea
        id="recipe-description"
        name="description"
        className="form-control"
        rows="3"
        value={formData.description}
        onChange={handleChange}
      />
      <FieldError message={errors.description} />
    </label>

    <label htmlFor="recipe-ingredients">
      Ingredienti, uno per riga
      <textarea
        id="recipe-ingredients"
        name="ingredientsText"
        className="form-control"
        rows="5"
        value={formData.ingredientsText}
        onChange={handleChange}
      />
      <FieldError message={errors.ingredientsText} />
    </label>

    <label htmlFor="recipe-steps">
      Passaggi, uno per riga
      <textarea
        id="recipe-steps"
        className="form-control"
        name="stepsText"
        rows="5"
        value={formData.stepsText}
        onChange={handleChange}
      />
      <FieldError message={errors.stepsText} />
    </label>

    <div className="form-actions full-row">
      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvataggio..." : initialRecipe ? "Salva modifiche" : "Crea ricetta"}
      </button>

      {initialRecipe && (
        <button
          className="ghost-button btn btn-outline-secondary"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annulla
        </button>
      )}
    </div>
  </form>
  );
}