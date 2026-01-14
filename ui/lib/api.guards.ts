import type { ApiEnvelope, ApiOk } from "@/lib/api.types";

export function isApiOk<T>(env: ApiEnvelope<T>): env is ApiOk<T> {
  return env.ok === true;
}
