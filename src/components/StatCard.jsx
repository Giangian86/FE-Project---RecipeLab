/*
  STAT CARD
  
  Questo componente mostra una piccola card statistica nella dashboard.

  Viene usato per visualizzare dati sintetici.

  È un componente presentational:
  non ha stato interno, non usa Redux e non fa chiamate API.
  Riceve tutto tramite props.
*/
export default function StatCard({ label, value, helper }) {
  return (
    <article className="stat-card card shadow-sm">
      {/* label descrive il tipo di dato mostrato, per esempio "Ricette". */}
      <span>{label}</span>
      {/* value è il valore principale della card, per esempio un numero. */}
      <strong>{value}</strong>
      {/* helper è opzionale. Se viene passato, mostra una piccola descrizione sotto al valore. */}
      {helper && <p>{helper}</p>}
    </article>
  );
}
