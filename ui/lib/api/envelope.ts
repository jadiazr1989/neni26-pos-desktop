// src/lib/api/envelope.ts
export type ApiError = {
  ok: false;
  error: {
    code: string;
    reason: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
};

export type ApiOk<T> = { ok: true; data: T };
export type ApiEnvelope<T> = ApiOk<T> | ApiError;

export function isApiOk<T>(env: ApiEnvelope<T>): env is ApiOk<T> {
  return env.ok === true;
}

export type ApiResult<T> = {
  data: T;
  headers: Headers;
};

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