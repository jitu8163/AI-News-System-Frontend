import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import KeywordsPage from "./pages/KeywordsPage";
import ArticlesPage from "./pages/ArticlesPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6366F1", contrastText: "#fff" },
    secondary: { main: "#10B981", contrastText: "#fff" },
    error: { main: "#EF4444" },
    warning: { main: "#F59E0B" },
    success: { main: "#10B981" },
    background: { default: "#F1F5F9", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#64748B" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.7rem" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: "#64748B", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "2px solid #E2E8F0" },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Unified top-nav site. Dashboard + Articles are public; the admin
              pages below are gated individually by ProtectedRoute. */}
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="articles" element={<ArticlesPage />} />

            {/* Admin-only */}
            <Route path="keywords" element={<ProtectedRoute><KeywordsPage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
