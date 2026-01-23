// src/lib/errors/toUserMessage.ts
import { ApiHttpError } from "@/lib/api/envelope";

type UnknownError = unknown;

function isApiHttpError(e: UnknownError): e is ApiHttpError {
  return e instanceof ApiHttpError;
}

export function toUserMessage(e: UnknownError): { title: string; description: string } {
  const fallback = {
    title: "Error",
    description: "No se pudo completar la operación. Intenta nuevamente.",
  };

  if (!isApiHttpError(e)) {
    if (e instanceof Error) {
      return {
        title: fallback.title,
        description: e.message || fallback.description,
      };
    }
    return fallback;
  }

  // Tu ApiHttpError tiene: status, code, reason, requestId, message
  const status = e.status;
  const code = e.code ?? null;

  // ✅ Caso específico: no se puede borrar producto con variantes
  if (status === 409 && code === "PRODUCT_HAS_VARIANTS") {
    return {
      title: "No se puede eliminar",
      description: "Este producto tiene variantes. Elimina las variantes primero y luego intenta de nuevo.",
    };
  }

  // Si aún no tienes code estable, puedes fallback temporal por message
  if (status === 409 && (e.message ?? "").toLowerCase().includes("has variants")) {
    return {
      title: "No se puede eliminar",
      description: "Este producto tiene variantes. Elimina las variantes primero y luego intenta de nuevo.",
    };
  }

  return {
    title: status >= 500 ? "Error del servidor" : "Operación fallida",
    description: e.message || fallback.description,
  };
}
