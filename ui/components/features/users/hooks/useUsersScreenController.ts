"use client";

import * as React from "react";
import type { UserDTO, UserRole } from "@/lib/modules/users/user.dto";
import { userService } from "@/lib/modules/users/user.service";
import { useInfiniteUsers } from "../hooks/useInfiniteUsers";
import type { UserDialogSubmitPayload } from "../ui/UserDialog";

import { ApiHttpError } from "@/lib/api.errors";
import { notify } from "@/lib/notify/notify";
import type { TriState } from "@/components/shared/TriStateFilterBar";

/**
 * Helpers (pure)
 */
function normalizeUsername(v?: string | null) {
  const s = (v ?? "").trim();
  return s.length ? s : null;
}

function validatePassword(pw: string): { ok: true } | { ok: false; message: string } {
  const p = pw.trim();
  if (p.length < 6) return { ok: false, message: "La contraseña debe tener al menos 6 caracteres." };
  return { ok: true };
}

function includesUserQ(u: UserDTO, q: string) {
  if (!q) return true;
  const hay = `${u.username ?? ""} ${u.role ?? ""}`.toLowerCase();
  return hay.includes(q);
}

function handleApiError(e: unknown) {
  if (!(e instanceof ApiHttpError)) {
    notify.error({ title: "Error", description: "Ocurrió un error inesperado." });
    return;
  }

 if (e.status === 400) {
  notify.warning({
    title: "Solicitud inválida",
    description: `${e.reason ?? ""} ${e.message || "Revisa los datos enviados."}`.trim(),
  });
  return;
}


  if (e.status === 409) {
    switch (e.reason) {
      case "SYSTEM_USER_PROTECTED":
        notify.warning({
          title: "No permitido",
          description: "Este usuario es del sistema (seed) y está protegido.",
        });
        return;
      case "LAST_ADMIN_REQUIRED":
        notify.warning({
          title: "No permitido",
          description: "Debes mantener al menos un ADMIN activo.",
        });
        return;
      case "CANNOT_DISABLE_SELF":
        notify.warning({
          title: "No permitido",
          description: "No puedes desactivarte a ti mismo.",
        });
        return;
      case "USERNAME_TAKEN":
        notify.warning({
          title: "Username en uso",
          description: "Ya existe un usuario con ese username.",
        });
        return;
    }
  }

  notify.error({
    title: "Error",
    description: e.message || "No se pudo completar la acción.",
  });
}

/**
 * Controller Hook
 * - Single Responsibility: encapsula state+actions
 * - Open/Closed: reglas se modifican aquí sin tocar UI
 * - Dependency Inversion (suave): userService centralizado aquí; si luego lo inyectas, solo cambias aquí
 */
export function useUsersScreenController() {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<TriState>("all");

  const pager = useInfiniteUsers({ search });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<UserDTO | null>(null);

  const [confirmToggle, setConfirmToggle] = React.useState<UserDTO | null>(null);
  const [working, setWorking] = React.useState(false);

  const busy = pager.loading || working;

  const refresh = React.useCallback(async () => {
    await pager.resetAndLoadFirst();
  }, [pager]);

  const counts = React.useMemo(() => {
    const rows = pager.items;
    const active = rows.filter((u) => u.isActive).length;
    const inactive = rows.filter((u) => !u.isActive).length;
    return { all: rows.length, active, inactive };
  }, [pager.items]);

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return pager.items
      .filter((u) => (filter === "active" ? u.isActive : filter === "inactive" ? !u.isActive : true))
      .filter((u) => includesUserQ(u, q));
  }, [pager.items, search, filter]);

  const canPaginate = React.useMemo(() => {
    return filter === "all" && !search.trim();
  }, [filter, search]);

  function openCreate() {
    setDialogMode("create");
    setSelected(null);
    setDialogOpen(true);
  }

  function openEdit(u: UserDTO) {
    setDialogMode("edit");
    setSelected(u);
    setDialogOpen(true);
  }

  function requestToggleActive(u: UserDTO) {
    if (u.isSystem) {
      notify.warning({
        title: "No permitido",
        description: "Este usuario es del sistema (seed) y no se puede desactivar.",
      });
      return;
    }
    setConfirmToggle(u);
  }

  async function confirmToggleNow() {
    if (!confirmToggle || working) return;

    setWorking(true);
    try {
      if (confirmToggle.isActive) {
        await userService.remove(confirmToggle.id);
      } else {
        await userService.update(confirmToggle.id, { isActive: true });
      }

      notify.success({
        title: confirmToggle.isActive ? "Usuario desactivado" : "Usuario reactivado",
        description: confirmToggle.username,
      });

      await refresh();
    } catch (e: unknown) {
      handleApiError(e);
    } finally {
      setWorking(false);
      setConfirmToggle(null);
    }
  }

  async function submit(payload: UserDialogSubmitPayload) {
    pager.setError(null);

    try {
      // ---------------------------
      // CREATE
      // ---------------------------
      if (dialogMode === "create") {
        const username = normalizeUsername(payload.username);
        const role = payload.role;
        const passwordRaw = payload.password?.trim() ?? "";

        if (!username) {
          notify.warning({ title: "Revisa el formulario", description: "Username requerido." });
          return;
        }
        if (!role) {
          notify.warning({ title: "Revisa el formulario", description: "Role requerido." });
          return;
        }
        if (!passwordRaw) {
          notify.warning({ title: "Revisa el formulario", description: "Password requerido." });
          return;
        }

        const pwv = validatePassword(passwordRaw);
        if (!pwv.ok) {
          notify.warning({ title: "Revisa el formulario", description: pwv.message });
          return;
        }

        await userService.create({
          username,
          password: passwordRaw.trim(),
          role,
          isActive: payload.isActive ?? true,
        });

        notify.success({ title: "Usuario creado", description: username });

        setDialogOpen(false);
        setSelected(null);
        await refresh();
        return;
      }

      // ---------------------------
      // EDIT
      // ---------------------------
      if (!selected) {
        notify.error({ title: "Error", description: "No hay usuario seleccionado." });
        return;
      }

      const newPassword = payload.password?.trim() ?? "";
      const wantsPasswordChange = newPassword.length > 0;
console.log(newPassword)
      // 1) Password change
      if (wantsPasswordChange) {
        const pwv = validatePassword(newPassword);
        if (!pwv.ok) {
          notify.warning({ title: "Revisa el formulario", description: pwv.message });
          return;
        }

        // Importante: si falla, cae al catch y no muestra success falso
        await userService.changePassword(selected.id, newPassword);
        notify.success({ title: "Contraseña actualizada", description: selected.username });
      }

      // 2) System user: solo password
      if (selected.isSystem) {
        if (!wantsPasswordChange) {
          notify.warning({
            title: "Sin cambios",
            description: "En usuarios del sistema solo puedes cambiar la contraseña.",
          });
          return;
        }
        setDialogOpen(false);
        setSelected(null);
        await refresh();
        return;
      }

      // 3) Update normal
      const patch: { username?: string; role?: UserRole; isActive?: boolean } = {};

      const username = normalizeUsername(payload.username);
      if (username && username !== selected.username) patch.username = username;

      if (payload.role && payload.role !== selected.role) patch.role = payload.role;

      if (payload.isActive !== undefined && payload.isActive !== selected.isActive) {
        patch.isActive = payload.isActive;
      }

      const hasPatch = Object.keys(patch).length > 0;

      if (hasPatch) {
        await userService.update(selected.id, patch);

        // Un solo notify final más claro (evita spam)
        notify.success({
          title: wantsPasswordChange ? "Usuario actualizado (incluye contraseña)" : "Usuario actualizado",
          description: selected.username,
        });
      } else {
        if (!wantsPasswordChange) {
          notify.warning({ title: "Sin cambios", description: "No hay cambios para guardar." });
          return;
        }
      }

      setDialogOpen(false);
      setSelected(null);
      await refresh();
    } catch (e: unknown) {
      handleApiError(e);
      if (e instanceof ApiHttpError) pager.setError(e.message);
    }
  }

  function loadMore() {
    if (canPaginate) void pager.loadMore();
  }

  return {
    // state
    search,
    filter,
    counts,
    rows,
    busy,

    // pager
    hasMore: canPaginate ? pager.hasMore : false,
    loadMore,

    // dialog
    dialogOpen,
    dialogMode,
    selected,
    setDialogOpen,

    // confirm
    confirmToggle,
    setConfirmToggle,

    // actions
    setSearch,
    setFilter,
    refresh,
    openCreate,
    openEdit,
    requestToggleActive,
    confirmToggleNow,
    submit,
  };
}
