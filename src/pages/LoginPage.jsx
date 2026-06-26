import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, TextField, Typography,
  Paper, Alert, CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/dashboard");
  };

  // Return to the previous page (Dashboard/Articles); fall back to Dashboard
  // if the user landed on /login directly with no in-app history.
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Back to where the user came from (Dashboard / Articles) */}
      <Button
        onClick={handleBack}
        startIcon={<ArrowBackIcon />}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 2,
          color: "rgba(255,255,255,0.85)",
          borderRadius: 999,
          px: 2,
          background: "rgba(255,255,255,0.08)",
          "&:hover": { background: "rgba(255,255,255,0.16)", color: "#fff" },
        }}
      >
        Back
      </Button>

      {/* Decorative blobs */}
      <Box sx={{
        position: "absolute", top: -120, left: -120, width: 400, height: 400,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <Box sx={{
        position: "absolute", bottom: -80, right: -80, width: 300, height: 300,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Left panel — branding */}
      <Box sx={{
        flex: 1,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        px: 8,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Box sx={{
            width: 52, height: 52, borderRadius: 3,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 800, letterSpacing: "0.04em", lineHeight: 1.1 }}>Soham360</Typography>
          </Box>
        </Box>

        <Typography variant="h3" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2, mb: 2 }}>
          Stay ahead of<br />
          <Box component="span" sx={{ color: "#818CF8" }}>every headline.</Box>
        </Typography>
        <Typography sx={{ color: "#94A3B8", fontSize: "1rem", maxWidth: 360, lineHeight: 1.7 }}>
          Real-time news collection, AI-powered summaries, and sentiment analysis — all in one platform.
        </Typography>

        <Box sx={{ mt: 5, display: "flex", flexDirection: "column", gap: 2 }}>
          {["Automated news collection from 10+ keywords", "AI summaries via Groq LLaMA 3.1", "Sentiment & category classification"].map((text) => (
            <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#6366F1", flexShrink: 0 }} />
              <Typography sx={{ color: "#94A3B8", fontSize: "0.875rem" }}>{text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right panel — form */}
      <Box sx={{
        width: { xs: "100%", md: 460 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
        py: 6,
      }}>
        <Paper sx={{
          width: "100%",
          maxWidth: 400,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
        }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "0.04em" }}>Soham360</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>Welcome back</Typography>
          <Typography color="text.secondary" sx={{ mb: 3, fontSize: "0.875rem" }}>
            Sign in to your admin dashboard
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 2,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                fontSize: "0.95rem",
                "&:hover": { background: "linear-gradient(135deg, #4F46E5, #7C3AED)" },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
