// Returns true only for a present, non-expired admin JWT. A stale/garbage
// token is treated as logged-out (and dropped) so the public site never shows
// admin-only controls based on leftover state.
export function isAdmin() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp === "number" && payload.exp * 1000 > Date.now()) {
      return true;
    }
  } catch {
    /* fall through to cleanup */
  }
  localStorage.removeItem("token"); // drop expired/invalid token
  return false;
}
