// components/features/pos/cash/services/authorizeOrThrow.ts
import { apiFetch } from "@/lib/api/fetch";
import type { AuthorizeRequestDTO, AuthorizeResponseDTO } from "@/lib/cash.types";

export async function authorizeOrThrow(input: {
  terminalId: string;
  payload: AuthorizeRequestDTO;
}): Promise<AuthorizeResponseDTO> {
  return apiFetch<AuthorizeResponseDTO>("/api/v1/auth/authorize", {
    method: "POST",
    headers: { "x-terminal-id": input.terminalId },
    body: JSON.stringify(input.payload),
  });
}
