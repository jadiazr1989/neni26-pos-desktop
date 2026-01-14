"use client";

import { LoginScreen } from "@/components/features";
import { useLoginForm } from "@/components/features/login/hooks";

export default function Page() {
  // ✅ Después de login, NO vamos a /boot directo. Vamos a /redirect.
  const { form, setField, loading, error, submit } = useLoginForm("/redirect");

  return (
    <LoginScreen
      username={form.username}
      password={form.password}
      loading={loading}
      error={error}
      onChangeUsername={(v) => setField("username", v)}
      onChangePassword={(v) => setField("password", v)}
      onSubmit={() => void submit()}
    />
  );
}
