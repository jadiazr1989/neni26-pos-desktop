// src/lib/modules/iam/users/user.port.ts
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

export type ListUsersQuery = {
  search?: string;
  role?: "ADMIN" | "MANAGER" | "CASHIER";
  isActive?: boolean;
  take?: number;
  cursor?: string;
};

export interface UserPort {
  list(q: ListUsersQuery): Promise<ListUsersResponse>;
  getById(id: string): Promise<GetUserResponse>;
  create(input: CreateUserInput): Promise<CreateUserResponse>;
  update(id: string, patch: UpdateUserInput): Promise<UpdateUserResponse>;
  remove(id: string): Promise<DeleteUserResponse>;
  changePassword(id: string, input: { password: string }): Promise<{ user: UserDTO }>;

}
