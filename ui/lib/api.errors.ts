// src/lib/api.errors.ts
import type { ApiEnvelope } from "./api.types";

export class ApiHttpError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly reason?: string;
  readonly requestId?: string;

  constructor(input: {
    message: string;
    status: number;
    code?: string;
    reason?: string;
    requestId?: string;
  }) {
    super(input.message);
    this.name = "ApiHttpError";
    this.status = input.status;
    this.code = input.code;
    this.reason = input.reason;
    this.requestId = input.requestId;
  }
}

export function isApiHttpError(err: unknown): err is ApiHttpError {
  return err instanceof ApiHttpError;
}

export function envelopeErrorParts(env: ApiEnvelope<unknown> | null): {
  code?: string;
  reason?: string;
  requestId?: string;
  message?: string;
} {
  if (!env || env.ok) return {};
  return {
    code: env.error.code,
    reason: env.error.reason,
    requestId: env.error.requestId,
    message: env.error.message,
  };
}
