// src/api/profileApi.ts
export async function fetchProfileOverview() {
  const response = await fetch('http://localhost:3000/profile/overview');
  if (!response.ok) {
    throw new Error('Failed to fetch profile overview');
  }
  return await response.json();
}
