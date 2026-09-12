const SESSION_KEY = "pm-session-v2";

export function isAuthenticated(): boolean {
  return localStorage.getItem(SESSION_KEY) === "1";
}

export async function login(username: string, password: string): Promise<boolean> {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) return false;

  const data = (await response.json().catch(() => ({ ok: false }))) as {
    ok?: boolean;
  };

  if (data.ok) {
    localStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
