export type ApiOk<T> = { ok: true; data: T };
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

export type ApiEnvelope<T> = ApiOk<T> | ApiError;

export function isApiOk<T>(env: ApiEnvelope<T>): env is ApiOk<T> {
  return env.ok === true;
}
