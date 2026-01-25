// src/lib/modules/iam/users/user.dto.ts
export type UserRole = "ADMIN" | "MANAGER" | "CASHIER";

export type UserDTO = {
  id: string;
  username: string;
  role: UserRole;
  isSystem: boolean; // ✅ NEW
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListUsersResponse = {
  items: UserDTO[];
  nextCursor: string | null;
};

export type GetUserResponse = { user: UserDTO };

export type CreateUserInput = {
  username: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
};

export type CreateUserResponse = { user: UserDTO };

export type UpdateUserInput = {
  username?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;  
};

export type UpdateUserResponse = { user: UserDTO };

export type DeleteUserResponse = { user: UserDTO };

export type ChangePasswordInput = { password: string };
export type ChangePasswordResponse = { user: UserDTO };
