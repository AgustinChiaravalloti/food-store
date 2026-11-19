import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { handleApiError } from "../../../shared/api/handleApiError";
import { useAuthStore } from "../../../store/authStore";

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username, value.password);
        navigate("/", { replace: true });
      } catch (err) {
        setError(handleApiError(err));
      }
    },
  });

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl bg-white p-6 shadow">
      <h1 className="mb-6 text-2xl font-bold">Iniciar sesión</h1>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) => (value.trim() === "" ? "Ingresá tu usuario" : undefined),
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium">Usuario</label>
              <input
                className="mt-1 w-full rounded border px-3 py-2"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.map((err) => (
                <p key={String(err)} className="text-sm text-red-600">{String(err)}</p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (value === "" ? "Ingresá tu contraseña" : undefined),
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium">Contraseña</label>
              <input
                type="password"
                className="mt-1 w-full rounded border px-3 py-2"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.map((err) => (
                <p key={String(err)} className="text-sm text-red-600">{String(err)}</p>
              ))}
            </div>
          )}
        </form.Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-sm">
        ¿No tenés cuenta? <Link to="/register" className="underline">Registrate</Link>
      </p>
    </div>
  );
}