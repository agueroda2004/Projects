const SESSION_KEY = "pm-session";

export function isAuthenticated(): boolean {
  return localStorage.getItem(SESSION_KEY) === "1";
}

export function authenticate(username: string, password: string): boolean {
  const expectedUsername = import.meta.env.VITE_APP_USERNAME;
  const expectedPassword = import.meta.env.VITE_APP_PASSWORD;

  const usernameOk = !expectedUsername || username.trim() === String(expectedUsername);
  const passwordOk = password === expectedPassword;

  if (usernameOk && passwordOk) {
    localStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}