// src/lib/modules/iam/users/user.service.ts
import type { UserPort, ListUsersQuery } from "./user.port";
import { UserHttpAdapter } from "./user.http";
import type { CreateUserInput, UpdateUserInput, UserDTO, ListUsersResponse } from "./user.dto";

class UserService {
  constructor(private readonly port: UserPort) { }

  list(q: ListUsersQuery): Promise<ListUsersResponse> {
    return this.port.list(q);
  }

  getById(id: string): Promise<{ user: UserDTO }> {
    return this.port.getById(id);
  }

  async create(input: CreateUserInput): Promise<UserDTO> {
    const res = await this.port.create(input);
    return res.user;
  }

  async update(id: string, patch: UpdateUserInput): Promise<UserDTO> {
    const res = await this.port.update(id, patch);
    return res.user;
  }

  // ✅ soft delete = disable (DELETE)
  async disable(id: string): Promise<UserDTO> {
    const res = await this.port.remove(id);
    return res.user;
  }

  // ✅ enable = PATCH isActive true
  async enable(id: string): Promise<UserDTO> {
    const res = await this.port.update(id, { isActive: true });
    return res.user;
  }

  // ✅ toggle (usa isActive actual)
  async toggle(id: string, currentIsActive: boolean): Promise<UserDTO> {
    const res = await this.port.update(id, { isActive: !currentIsActive });
    return res.user;
  }

  // mantengo remove por compatibilidad si ya lo llamas en otros lados
  async remove(id: string): Promise<UserDTO> {
    const res = await this.port.remove(id);
    return res.user;
  }

  async changePassword(id: string, password: string): Promise<UserDTO> {
    const res = await this.port.changePassword(id, { password });
    return res.user;
  }

}

export const userService = new UserService(new UserHttpAdapter());
