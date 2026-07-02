// Capa de acceso a datos aislada y reemplazable: hoy apunta a los JSON locales en
// public/data/, en una iteración futura basta con cambiar BASE_URL (o esta función)
// para que apunte a la API REST del backend (ej: fetch(`/api/${resource}`)).
const BASE_URL = "/data";

export async function fetchJson<T>(resource: string): Promise<T> {
  const response = await fetch(`${BASE_URL}/${resource}`);
  if (!response.ok) {
    throw new Error(`No se pudo obtener ${resource}: ${response.status}`);
  }
  return (await response.json()) as T;
}
