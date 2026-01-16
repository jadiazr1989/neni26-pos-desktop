"use client";

import { apiFetch } from "@/lib/api/fetch";
import type { LoginRequest, LoginResponse } from "@/lib/cash.types";
import { useCallback, useState } from "react";

type UseLoginForm = {
  form: LoginRequest;
  setField: (k: keyof LoginRequest, v: string) => void;
  loading: boolean;
  error: string | null;
  submit: () => Promise<void>;
};

export function useLoginForm(onSuccessRedirectTo = "/redirect"): UseLoginForm {
  const [form, setForm] = useState<LoginRequest>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback((k: keyof LoginRequest, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const submit = useCallback(async () => {
    if (loading) return;

    if (!form.username || !form.password) {
      setError("Usuario y contraseña son obligatorios");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await apiFetch<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      window.location.assign(onSuccessRedirectTo);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }, [form, loading, onSuccessRedirectTo]);

  return { form, setField, loading, error, submit };
}
