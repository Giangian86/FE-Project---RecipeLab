/*
  CARD RICETTA RIUTILIZZABILE
  
  Questo componente mostra le informazioni principali di una ricetta.

  È un componente riutilizzabile perché riceve i dati tramite props
  e può essere usato in pagine diverse, come homepage e archivio ricette.
*/

import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../store/recipesSlice.js";

export default function RecipeCard({ recipe, showActions = true, showFavoriteAction = true }) {
  /*
    useDispatch permette di inviare azioni allo store Redux.
    Quì viene usato per aggiungere o rimuovere una ricetta dai preferiti.
  */
  const dispatch = useDispatch();
  /*
    useSelector legge dallo store Redux la lista degli id delle ricette preferite.
    favorites contiene quindi gli id delle ricette salvate dall'utente.
  */
  const favorites = useSelector((state) => state.recipes.favorites);
  /*
    Controllo se la ricetta corrente è già tra i preferiti.
    includes restituisce true se recipe.id è presente nell'array favorites.
  */
  const isFavorite = favorites.includes(recipe.id);

  return (
    <article className="recipe-card card shadow-sm">
      {/* Immagine principale della ricetta. L'alt rende l'immagine più accessibile. */}
      <img src={recipe.image} alt={recipe.title} />
      <div className="recipe-card-content">
        {/* Metadati della ricetta. */}
        <div className="card-meta">
          <span>{recipe.category}</span>
          <span>{recipe.difficulty}</span>
        </div>

        <h2>{recipe.title}</h2>
        <p>{recipe.description}</p>
        {/* Altre informazioni pratiche mostrate nella parte bassa della card. */}
        <div className="card-footer">
          <span>{recipe.time} min</span>
          <span>{recipe.servings} porzioni</span>
        </div>

        {/*
          showActions rende il componente flessibile.

          Se showActions è true, vengono mostrati:
          - link al dettaglio ricetta;
          - bottone preferiti, se showFavoriteAction è true.

          Se showActions è false, la card mostra solo i dati della ricetta.
          Questo è utile, per esempio, nella homepage pubblica
          dove devono essere inibiti alcuni elementi.
        */}
        {showActions && (
          <div className="card-actions">
            <Link className="btn btn-outline-secondary btn-sm" to={`/recipes/${recipe.id}`}>
              Apri ricetta
            </Link>
            {showFavoriteAction && (
              <button
                className={isFavorite ? "small-button active btn btn-success btn-sm" : "small-button btn btn-primary btn-sm"}
                type="button"
                onClick={() => dispatch(toggleFavorite(recipe.id))}
              >
                {isFavorite ? "Salvata" : "Salva"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
