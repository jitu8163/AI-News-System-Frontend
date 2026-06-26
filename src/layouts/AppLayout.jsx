import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Box, Button, Toolbar, Typography, IconButton,
  Menu, MenuItem, Avatar, Tooltip, Divider, Drawer,
  List, ListItemButton, ListItemText,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import { isAdmin } from "../utils/auth";

// Public links everyone sees; admin links appear only when logged in.
const PUBLIC_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Articles", path: "/articles" },
];
const ADMIN_LINKS = [
  { label: "Keywords", path: "/keywords" },
  { label: "Settings", path: "/settings" },
];

const BAR_BG = "#0F172A";

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const admin = isAdmin();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = admin ? [...PUBLIC_LINKS, ...ADMIN_LINKS] : PUBLIC_LINKS;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAnchorEl(null);
    navigate("/dashboard");
  };

  const go = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const NavButton = ({ label, path }) => {
    const active = pathname === path;
    return (
      <Button
        onClick={() => go(path)}
        sx={{
          color: active ? "#fff" : "#94A3B8",
          fontWeight: active ? 700 : 500,
          fontSize: "0.875rem",
          borderRadius: 2,
          px: 1.75,
          background: active ? "rgba(99,102,241,0.18)" : "transparent",
          "&:hover": { background: "rgba(255,255,255,0.06)", color: "#fff" },
        }}
      >
        {label}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        // Soft branded gradient base instead of flat slate.
        background: "linear-gradient(170deg, #EEF2FF 0%, #F5F3FF 35%, #F1F5F9 70%, #ECFEFF 100%)",
        // Subtle colored "aurora" blobs — fixed so they sit behind scrolling content.
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(620px circle at 12% 18%, rgba(99,102,241,0.18), transparent 60%)," +
            "radial-gradient(560px circle at 88% 12%, rgba(139,92,246,0.16), transparent 55%)," +
            "radial-gradient(680px circle at 78% 88%, rgba(6,182,212,0.14), transparent 60%)," +
            "radial-gradient(520px circle at 20% 92%, rgba(16,185,129,0.12), transparent 55%)",
        },
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ background: BAR_BG, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {/* Mobile menu toggle */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: "inline-flex", md: "none" }, mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Brand */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
            onClick={() => go("/dashboard")}
          >
            <Box sx={{
              width: 34, height: 34, borderRadius: 2,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.1, letterSpacing: "0.04em" }}>
                Soham360
              </Typography>
            </Box>
          </Box>

          {/* Desktop nav links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, ml: 3 }}>
            {links.map((l) => <NavButton key={l.path} {...l} />)}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right side: admin account menu or admin-login button */}
          {admin ? (
            <>
              <Tooltip title="Account">
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                  <Avatar sx={{ width: 32, height: 32, background: "#6366F1", fontSize: "0.8rem" }}>A</Avatar>
                </IconButton>
              </Tooltip>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>Admin</Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: "0.72rem" }}>admin@example.com</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
                  Profile / Password
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={{
                borderRadius: 999,
                px: 2,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                "&:hover": { background: "linear-gradient(135deg, #4F46E5, #7C3AED)" },
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile nav drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: 240, background: BAR_BG } }}
      >
        <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: "#6366F1" }} />
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.04em", lineHeight: 1.1 }}>Soham360</Typography>
          </Box>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <List sx={{ px: 1 }}>
          {links.map(({ label, path }) => {
            const active = pathname === path;
            return (
              <ListItemButton
                key={path}
                onClick={() => go(path)}
                sx={{
                  borderRadius: 2, mb: 0.5,
                  background: active ? "rgba(99,102,241,0.18)" : "transparent",
                }}
              >
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    color: active ? "#fff" : "#94A3B8",
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.9rem",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ position: "relative", zIndex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
