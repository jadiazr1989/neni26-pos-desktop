// src/lib/error/toUserMessage.ts
import { isApiHttpError, type ApiHttpError } from "@/lib/api/envelope";

type UserMessage = { title: string; description: string };

export function toUserMessage(err: unknown): UserMessage {
  if (!isApiHttpError(err)) {
    return { title: "Error", description: "Ocurrió un error inesperado." };
  }

  // defaults
  const base: UserMessage = {
    title: err.status >= 500 ? "Error del servidor" : "No se pudo completar",
    description: err.message || "Solicitud inválida.",
  };

  // ====== Mapeos por status/code (ajusta codes según tu backend) ======
  if (err.status === 409) {
    // ejemplos típicos en categorías: slug duplicado / conflicto de integridad
    if (err.code === "CATEGORY_SLUG_EXISTS" || err.code === "CATEGORY_EXISTS") {
      return {
        title: "Slug en uso",
        description: "Ya existe una categoría con ese slug. Cambia el slug e intenta de nuevo.",
      };
    }
    if (err.code === "CATEGORY_HAS_CHILDREN") {
      return {
        title: "No se puede eliminar",
        description: "Esta categoría tiene subcategorías. Elimínalas o muévelas primero.",
      };
    }
    if (err.code === "CATEGORY_HAS_PRODUCTS") {
      return {
        title: "No se puede eliminar",
        description: "Esta categoría tiene productos asociados. Cambia esos productos a otra categoría primero.",
      };
    }
    return { title: "Conflicto", description: base.description };
  }

  if (err.status === 400 || err.status === 422) {
    return { title: "Revisa los datos", description: base.description };
  }

  if (err.status === 401) {
    return { title: "Sesión requerida", description: "Inicia sesión nuevamente e intenta de nuevo." };
  }

  if (err.status === 403) {
    return { title: "Sin permisos", description: "No tienes permisos para realizar esta acción." };
  }

  if (err.status === 404) {
    return { title: "No encontrado", description: base.description };
  }

  return base;
}
