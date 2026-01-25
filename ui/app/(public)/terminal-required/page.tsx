"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/components/features/login/hooks";
import { LogOut } from "lucide-react";

export default function TerminalRequiredPage() {

  const logout = useLogout();
  return (
    <div className="h-screen w-screen grid place-items-center bg-background">
      <div className="w-full max-w-md rounded-xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Terminal no configurado</h1>

        <p className="text-sm text-muted-foreground">
          Este dispositivo no tiene un terminal asignado.
          <br />
          Un <strong>ADMINISTRADOR</strong> debe entrar y ejecutar la configuración inicial.
        </p>

        <div className="pt-4">
          <Button variant="outline" className="h-10" onClick={() => void logout()}>
            <LogOut className="mr-2 size-4" />
            Volver al login
          </Button>
        </div>
      </div>
    </div>
  );
}
