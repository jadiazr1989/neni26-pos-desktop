export function slugify(input: string): string {
  return input
    .normalize("NFD")                 // separa acentos
    .replace(/[\u0300-\u036f]/g, "")  // elimina acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")     // quita símbolos raros
    .replace(/\s+/g, "-")             // espacios → guiones
    .replace(/-+/g, "-");             // colapsa guiones
}
