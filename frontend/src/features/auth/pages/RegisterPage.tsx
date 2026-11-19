import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { axiosInstance } from "../../../shared/api/axiosInstance";
import { handleApiError } from "../../../shared/api/handleApiError";
import { useAuthStore } from "../../../store/authStore";

export function RegisterPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { full_name: "", username: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await axiosInstance.post("/auth/register", value);
        await login(value.username, value.password);
        navigate("/", { replace: true });
      } catch (err) {
        setError(handleApiError(err));
      }
    },
  });

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl bg-white p-6 shadow">
      <h1 className="mb-6 text-2xl font-bold">Crear cuenta</h1>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="full_name"
          validators={{
            onChange: ({ value }) =>
              value.trim() === "" ? "Ingresá tu nombre" : value.length < 2 ? "Mínimo 2 caracteres" : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium">Nombre completo</label>
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
          name="username"
          validators={{
            onChange: ({ value }) =>
              value.trim() === "" ? "Ingresá un usuario" : value.length < 3 ? "Mínimo 3 caracteres" : undefined,
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
          name="email"
          validators={{
            onChange: ({ value }) =>
              /^\S+@\S+\.\S+$/.test(value) ? undefined : "Ingresá un email válido",
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
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
            onChange: ({ value }) => (value.length < 8 ? "Mínimo 8 caracteres" : undefined),
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
              {isSubmitting ? "Creando cuenta..." : "Registrarme"}
            </button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-sm">
        ¿Ya tenés cuenta? <Link to="/login" className="underline">Iniciá sesión</Link>
      </p>
    </div>
  );
}