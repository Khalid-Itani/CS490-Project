const BASE = import.meta.env.VITE_API_URL || "/api";

export async function deleteMyAccount(password) {
  const res = await fetch(`${BASE}/users/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ password }),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to delete account");
  }

  return data;
}
