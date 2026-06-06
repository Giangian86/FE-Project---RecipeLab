/*
  VALIDAZIONI RIUTILIZZABILI
  
  Queste funzioni evitano di duplicare controlli nei form.
  Ogni form le combina in base ai campi che deve controllare.
*/
export function isValidEmail(value) {
  // Regex semplice: basta controllare formato base user@dominio.ext.
  return /\S+@\S+\.\S+/.test(value);
}

export function required(value) {
  // .trim() rimuove spazi iniziali/finali, cosi "   " non passa la validazione.
  return String(value).trim().length > 0;
}

export function minLength(value, length) {
  return String(value).trim().length >= length;
}

export function positiveNumber(value) {
  return Number(value) > 0;
}
