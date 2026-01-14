"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  title?: string;
  username: string;
  password: string;
  loading?: boolean;
  error?: string | null;
  onChangeUsername: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
};

export function LoginCard({
  title = "Acceso al POS",
  username,
  password,
  loading = false,
  error,
  onChangeUsername,
  onChangePassword,
  onSubmit,
}: Props) {
  return (
    <Card className="w-full max-w-md overflow-hidden">
      {/* header con franja sutil */}
      <div className="h-1 bg-accent" />

      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Inicia sesión para comenzar una sesión de caja.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <Alert className="border-destructive/30 bg-destructive/10">
            <AlertDescription className="text-destructive font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => onChangeUsername(e.target.value)}
              className="h-12"
              autoFocus
              disabled={loading}
              autoComplete="username"
              placeholder="Ej: cajero1"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onChangePassword(e.target.value)}
              className="h-12"
              disabled={loading}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="h-12 w-full" disabled={loading}>
            {loading ? "Iniciando..." : "Entrar"}
          </Button>

          <div className="pt-1 text-xs text-muted-foreground">
            Tip: presiona <span className="font-medium text-foreground">Enter</span> para entrar.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
