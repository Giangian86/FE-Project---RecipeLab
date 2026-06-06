/*
  HOME PAGE
  
  Questa è la pagina pubblica principale dell'applicazione.

  Mostra:
  - una hero introduttiva;
  - un carosello di ricette pubblicate;
  - i controlli per scorrere le ricette.

  Anche se la pagina è pubblica, legge dati da Redux:
  - le ricette dal recipesSlice;
  - l'utente loggato dall'authSlice.

  In questo modo la home cambia comportamento:
  - se l'utente non è loggato, mostra solo le ricette;
  - se l'utente è loggato, mostra anche il link per aprire la ricetta;
  - se l'utente è user, mostra anche il bottone preferiti.
*/
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RecipeCard from "../components/RecipeCard.jsx";
import { fetchRecipes } from "../store/recipesSlice.js";

export default function Home() {
  /*
    useDispatch qui viene usato per caricare le ricette dalla API.
  */
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.recipes);
  /*
    Dall'authSlice viene letto l'utente corrente.
    Serve per decidere quali azioni mostrare sulle card ricetta.
  */
  const user = useSelector((state) => state.auth.user);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselVisibleCount, setCarouselVisibleCount] = useState(3);

  const publishedRecipes = useMemo(() => {
    /* 
    La home usa solo ricette pubblicate, quindi eventuali bozze admin
    non entrano nel carosello pubblico.
    */
    return items.filter((recipe) => recipe.status === "pubblicata");
  }, [items]);

  const carouselRecipes = useMemo(() => {
    /* 
      Il numero di card visibili cambia in base alla larghezza dello schermo:
      desktop = 3 ricette, tablet = 2 ricette, mobile = 1 ricetta.
      L'operatore modulo (%) permette di tornare all'inizio quando si arriva
      all'ultima ricetta, creando un carosello circolare.
    */
    if (publishedRecipes.length <= carouselVisibleCount) {
      return publishedRecipes;
    }

    return Array.from({ length: carouselVisibleCount }, (_, offset) => {
      const recipeIndex = (currentIndex + offset) % publishedRecipes.length;
      return publishedRecipes[recipeIndex];
    });
  }, [carouselVisibleCount, currentIndex, publishedRecipes]);

  useEffect(() => {
    // Anche se la home è pubblica, carica qualche ricetta per la vetrina.
    // status evita di richiamare fetchRecipes se i dati sono già nello store Redux.
    if (status === "idle") {
      dispatch(fetchRecipes());
    }
  }, [dispatch, status]);

  useEffect(() => {
    // matchMedia rende il carosello coerente con il responsive:
    // non basta cambiare la griglia CSS, perché React deve proprio renderizzare
    // 3, 2 o 1 card in base al dispositivo.
    function updateCarouselVisibleCount() {
      if (window.matchMedia("(max-width: 700px)").matches) {
        setCarouselVisibleCount(1);
        return;
      }

      if (window.matchMedia("(max-width: 1100px)").matches) {
        setCarouselVisibleCount(2);
        return;
      }

      setCarouselVisibleCount(3);
    }

    updateCarouselVisibleCount();
    window.addEventListener("resize", updateCarouselVisibleCount);

    return () => window.removeEventListener("resize", updateCarouselVisibleCount);
  }, []);

  useEffect(() => {
    // Autoplay del carosello: ogni 4,5 secondi avanza di una ricetta.
    // Il cleanup con clearInterval evita timer duplicati quando il componente
    // viene smontato o quando cambia il numero di ricette disponibili.
    if (publishedRecipes.length <= carouselVisibleCount) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % publishedRecipes.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [carouselVisibleCount, publishedRecipes.length]);

  function goToPreviousRecipe() {
    setCurrentIndex((index) => {
      if (publishedRecipes.length === 0) {
        return 0;
      }

      return (index - 1 + publishedRecipes.length) % publishedRecipes.length;
    });
  }

  function goToNextRecipe() {
    setCurrentIndex((index) => {
      if (publishedRecipes.length === 0) {
        return 0;
      }

      return (index + 1) % publishedRecipes.length;
    });
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Meal plan made simple</p>
          <h1>Ricette, preferiti e piano pasti in un unico laboratorio.</h1>
          <p>
            RecipeLab è una web app per esplorare ricette, salvarle, recensirle e
            costruire un piccolo menù giornaliero.
          </p>
        </div>
      </section>

      <section className="section-heading carousel-heading">
        <div>
          <p className="eyebrow">In evidenza</p>
          <h2>Ricette da provare oggi</h2>
        </div>
        {/*
          I controlli del carosello vengono mostrati solo se ci sono
          più ricette rispetto al numero di card visibili.
        */}
        {publishedRecipes.length > carouselVisibleCount && (
          <div className="carousel-controls btn-group" aria-label="Controlli carosello ricette">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={goToPreviousRecipe}
              aria-label="Mostra ricette precedenti"
            >
              Precedenti
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={goToNextRecipe}
              aria-label="Mostra ricette successive"
            >
              Successive
            </button>
          </div>
        )}
      </section>

      <section className="recipe-carousel" aria-live="polite">
        {carouselRecipes.map((recipe) => (
          /* showActions dipende dal login: questa è conditional rendering
             applicata tramite props, utile per riusare RecipeCard in contesti diversi. */
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            /*
              showActions dipende dal login:
              se l'utente non è loggato, la card resta solo informativa.
            */
            showActions={Boolean(user)}
            /*
              Solo gli utenti normali possono salvare preferiti.
              L'admin può vedere le ricette ma non usa la funzione preferiti.
            */
            showFavoriteAction={user?.role === "user"}
          />
        ))}
      </section>
    </>
  );
}
