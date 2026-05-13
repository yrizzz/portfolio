import { useAuthStore } from "./store/auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // send cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Error ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}
