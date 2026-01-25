"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { notify } from "@/lib/notify/notify";
import type { UserDTO, UserRole } from "@/lib/modules/users/user.dto";

type Mode = "create" | "edit";

export type UserDialogSubmitPayload = {
  username?: string;
  role?: UserRole;
  password?: string;
  isActive?: boolean;
};

const ROLES: UserRole[] = ["ADMIN", "MANAGER", "CASHIER"];

export function UserDialog(props: {
  open: boolean;
  mode: Mode;
  initial: UserDTO | null;
  loading?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (p: UserDialogSubmitPayload) => Promise<void>;
}) {
  const [username, setUsername] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("CASHIER");
  const [password, setPassword] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [submitting, setSubmitting] = React.useState(false);

  const isSystem = props.mode === "edit" && props.initial?.isSystem === true;
  const disabled = Boolean(props.loading) || submitting;

  React.useEffect(() => {
    if (!props.open) return;
    const u = props.initial;

    setUsername(u?.username ?? "");
    setRole((u?.role as UserRole) ?? "CASHIER");
    setIsActive(u?.isActive ?? true);
    setPassword("");
  }, [props.open, props.initial]);

  function validate(): { ok: true; value: UserDialogSubmitPayload } | { ok: false; error: string } {
    // CREATE
    if (props.mode === "create") {
      const userNorm = username.trim();
      if (!userNorm) return { ok: false, error: "Username requerido." };

      const pass = password.trim();
      if (!pass) return { ok: false, error: "Password requerido." };
      if (pass.length < 6) return { ok: false, error: "Password mínimo 6 caracteres." };

      return {
        ok: true,
        value: { username: userNorm, role, isActive, password: pass },
      };
    }

    // EDIT: system => solo password
    if (isSystem) {
      const pass = password.trim();
      if (!pass) return { ok: false, error: "Para usuario del sistema solo puedes cambiar la contraseña." };
      if (pass.length < 6) return { ok: false, error: "Password mínimo 6 caracteres." };
      return { ok: true, value: { password: pass } };
    }

    // EDIT normal
    const userNorm = username.trim();
    if (!userNorm) return { ok: false, error: "Username requerido." };

    const pass = password.trim();
    if (pass && pass.length < 6) return { ok: false, error: "Password mínimo 6 caracteres." };

    return {
      ok: true,
      value: {
        username: userNorm,
        role,
        isActive,
        ...(pass ? { password: pass } : {}),
      },
    };
  }

  async function submit() {
    const v = validate();
    if (!v.ok) {
      notify.warning({ title: "Revisa el formulario", description: v.error });
      return;
    }

    setSubmitting(true);
    try {
      await props.onSubmit(v.value);
      props.onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg">
            {props.mode === "create" ? "Nuevo usuario" : isSystem ? "Usuario del sistema" : "Editar usuario"}
          </DialogTitle>

          <div className="text-sm text-muted-foreground">
            {props.mode === "create"
              ? "Crea usuarios para operar el POS."
              : isSystem
              ? "Este usuario viene por defecto (seed). Solo se permite cambiar la contraseña."
              : "Actualiza username/rol/estado y opcionalmente la contraseña."}
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          {props.mode === "edit" && isSystem ? (
            <div className="grid gap-2 rounded-md border border-border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{props.initial?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{props.initial?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <span className="font-medium">{props.initial?.isActive ? "ACTIVE" : "INACTIVE"}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Username</div>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: cashier1" disabled={disabled} />
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Role</div>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  disabled={disabled}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Estado</div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={disabled} />
                  Activo
                </label>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <div className="text-sm font-medium">{props.mode === "create" ? "Password" : "Nueva contraseña"}</div>

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={props.mode === "create" ? "Mínimo 6 caracteres" : "Dejar vacío si no deseas cambiarla"}
              type="password"
              disabled={disabled}
            />

            {props.mode === "edit" && isSystem ? (
              <div className="text-xs text-muted-foreground">Solo se permite cambiar la contraseña en usuarios del sistema.</div>
            ) : null}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-background flex justify-end gap-2">
          <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={disabled}>
            Cancelar
          </Button>

          <ButtonSpinner
            type="button"
            onClick={() => void submit()}
            busy={submitting}
            disabled={
              disabled ||
              (props.mode === "create" ? !username.trim() || !password.trim() : false) ||
              (props.mode === "edit" && isSystem ? !password.trim() : false)
            }
          >
            {submitting ? "Guardando..." : "Guardar"}
          </ButtonSpinner>
        </div>
      </DialogContent>
    </Dialog>
  );
}
