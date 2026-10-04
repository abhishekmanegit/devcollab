const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function mediaUrl(path) {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return API_ORIGIN + path;
}

export function githubHandle(url) {
  if (!url) return null;
  try {
    const normalized = url.includes("://")
      ? url
      : `https://github.com/${url.replace(/^@/, "").replace(/^github\.com\//i, "")}`;
    const parsed = new URL(normalized);
    const handle = parsed.pathname.split("/").filter(Boolean)[0];
    return handle || null;
  } catch {
    return url.replace(/^@/, "");
  }
}

async function request(path, { headers = {}, ...options } = {}, token = null) {
  const authToken = token || localStorage.getItem("dc_token");

  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* response was not JSON, keep the raw text */
  }

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && data.message) ||
      (typeof data === "string" && data.trim()) ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data;
}

export async function api(path, options = {}, token = null) {
  return request(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  }, token);
}

export async function uploadFile(path, file, token = null) {
  const body = new FormData();
  body.append("file", file);

  return request(path, { method: "POST", body }, token);
}