// src/lib/modules/iam/users/user.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { UserPort, ListUsersQuery } from "./user.port";
import type {
  CreateUserInput,
  CreateUserResponse,
  DeleteUserResponse,
  GetUserResponse,
  ListUsersResponse,
  UpdateUserInput,
  UpdateUserResponse,
  UserDTO,
} from "./user.dto";

export class UserHttpAdapter implements UserPort {
  async list(q: ListUsersQuery): Promise<ListUsersResponse> {
    const params = new URLSearchParams();
    if (q.search) params.set("search", q.search);
    if (q.role) params.set("role", q.role);
    if (q.isActive != null) params.set("isActive", String(q.isActive));
    if (q.take != null) params.set("take", String(q.take));
    if (q.cursor) params.set("cursor", q.cursor);

    const qs = params.toString();
    return apiClient.json(`/api/v1/users${qs ? `?${qs}` : ""}`, { method: "GET" });
  }

  async getById(id: string): Promise<GetUserResponse> {
    return apiClient.json(`/api/v1/users/${id}`, { method: "GET" });
  }

  async create(input: CreateUserInput): Promise<CreateUserResponse> {
    return apiClient.json(`/api/v1/users`, { method: "POST", body: input });
  }

  async update(id: string, patch: UpdateUserInput): Promise<UpdateUserResponse> {
    return apiClient.json(`/api/v1/users/${id}`, { method: "PATCH", body: patch });
  }

  async remove(id: string): Promise<DeleteUserResponse> {
    return apiClient.json(`/api/v1/users/${id}`, { method: "DELETE" });
  }

  async changePassword(id: string, input: { password: string }): Promise<{ user: UserDTO }> {
    return apiClient.json(`/api/v1/users/${id}/password`, { method: "PATCH", body: input });
  }
}
