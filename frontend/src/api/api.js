const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export async function api(path, options = {}, token = null) {

const authToken = token || localStorage.getItem("dc_token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}