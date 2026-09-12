import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Lock } from "lucide-react";
import { authenticate } from "@/shared/auth";
import Button from "@/shared/ui/Button";
import { Field, Input } from "@/shared/ui/Input";
import { showToast } from "@/shared/ui/toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (authenticate(username, password)) {
      showToast("success", "Welcome back");
      navigate("/projects");
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-duo-green text-white shadow-sm">
            <Boxes className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-zinc-800">Projects</p>
            <p className="text-sm font-semibold text-zinc-400">
              Project Manager
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <Field label="Username">
            <Input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="your-username"
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </Field>

          {error && (
            <p className="flex items-center gap-2 text-sm font-semibold text-red-500">
              <Lock className="h-4 w-4" />
              {error}
            </p>
          )}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
