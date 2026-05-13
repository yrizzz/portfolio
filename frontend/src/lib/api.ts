export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProjects() {
  const res = await fetch(`${API_URL}/projects`);
  return res.json();
}

export async function fetchProjectsSSR() {
  const res = await fetch(`${API_URL}/projects`, { cache: "no-cache" });
  return res.json();
}
