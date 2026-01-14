"use client";

import { LoginCard } from "./LoginCard";

type Props = {
  username: string;
  password: string;
  loading: boolean;
  error: string | null;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
};

export function LoginScreen({
  username,
  password,
  loading,
  error,
  onChangeUsername,
  onChangePassword,
  onSubmit,
}: Props) {
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <div className="h-full w-full flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Panel izquierdo (solo desktop) */}
          <div className="hidden md:block space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl border bg-card grid place-items-center font-semibold">
                N
              </div>
              <div>
                <div className="text-2xl font-semibold leading-tight">Neni26 POS</div>
                <div className="text-sm text-muted-foreground">Punto de venta de escritorio</div>
              </div>
            </div>

            <p className="text-muted-foreground">
              Flujo rápido y “keyboard-first” para ventas, devoluciones, inventario y control de caja.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border bg-card p-4">
                <div className="font-medium">Teclas rápidas</div>
                <div className="text-muted-foreground">F2 Venta · F4 Devolución · F9 Caja</div>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <div className="font-medium">Estación</div>
                <div className="text-muted-foreground">Sesiones ligadas al terminal</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Consejo: si trabajas con teclado, usa <span className="font-medium text-foreground">Enter</span> para
              iniciar sesión rápido.
            </div>
          </div>

          {/* Panel derecho */}
          <div className="flex justify-center md:justify-end">
            <LoginCard
              title="Acceso al POS"
              username={username}
              password={password}
              loading={loading}
              error={error}
              onChangeUsername={onChangeUsername}
              onChangePassword={onChangePassword}
              onSubmit={onSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
