/*
  HEADER PAGINA RIUTILIZZABILE

  Questo componente serve per mostrare l'intestazione delle pagine
  in modo uniforme.

  Può mostrare:
  - una piccola etichetta superiore, chiamata eyebrow;
  - il titolo principale della pagina;
  - una descrizione opzionale.

  È un componente presentational, cioè non gestisce logica complessa
  e non ha stato interno. Riceve i dati tramite props e li mostra a schermo.
*/
export default function PageHeader({ eyebrow, title, description }) {
  return (
    <section className="page-header">
      {/*
        Rendering condizionale:
        se eyebrow esiste, viene mostrato.
        Se non viene passato, React non renderizza nulla in questo punto.
      */}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {/* Titolo principale della pagina. */}
      <h1>{title}</h1>
      {/*
        Anche la descrizione è opzionale.
        Viene mostrata solo se la prop description contiene un valore.
      */}
      {description && <p>{description}</p>}
    </section>
  );
}
