import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

// Gate for admin-only pages. Public pages (Dashboard, Articles) are not wrapped.
export default function ProtectedRoute({ children }) {
  return isAdmin() ? children : <Navigate to="/login" replace />;
}
