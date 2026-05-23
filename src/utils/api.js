export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);

const ikPath = (p) =>
  `${API_BASE_URL}/ik/customer${p.startsWith("/") ? p : `/${p}`}`;

export const apiGet = async (p, init = {}) => {
  const res = await fetch(ikPath(p), { credentials: "include", ...init });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${p}`);
  return res.json();
};

export const uploadsUrl = (relPath) =>
  `${API_BASE_URL}/uploads/${String(relPath || "").replace(/^\/+/, "")}`;
