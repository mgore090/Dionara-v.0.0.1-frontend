export const API_BASE_URL = "http://localhost:8080/api";

export function getLoggedInUser() {
  try {
    const user = JSON.parse(localStorage.getItem("dinoraUser") || "null");
    if (!user || !(user.id || user.userId)) return null;
    return { ...user, id: user.id ?? user.userId };
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}
