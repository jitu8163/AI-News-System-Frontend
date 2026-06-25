import { useState } from "react";
import {
  Box, Paper, Typography, TextField, Button, CircularProgress,
  Alert, Divider, Avatar, Snackbar,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import { authApi } from "../services/api";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [snack, setSnack] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword.length < 8) {
      setFormError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSnack("Password changed successfully.");
    } catch (err) {
      setFormError(err.response?.data?.detail ?? "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 560 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">Profile</Typography>
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mt: 0.5 }}>
          Manage your account settings
        </Typography>
      </Box>

      {/* Account Info Card */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 52, height: 52, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", fontSize: "1.3rem" }}>
            A
          </Avatar>
          <Box>
            <Typography fontWeight={700} fontSize="1rem">Admin</Typography>
            <Typography variant="body2" color="text.secondary">admin@example.com</Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.4, fontSize: "0.72rem", fontWeight: 600, color: "#6366F1", background: "#EEF2FF", px: 1, py: 0.2, borderRadius: 1, display: "inline-block" }}
            >
              Administrator
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Change Password Card */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LockIcon sx={{ color: "#6366F1", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography fontWeight={700}>Change Password</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              Update your login password
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {formError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>
          )}

          <TextField
            label="Current Password"
            type="password"
            fullWidth
            size="small"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            helperText="Minimum 8 characters"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            size="small"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            error={confirmPassword.length > 0 && newPassword !== confirmPassword}
            helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? "Passwords do not match" : ""}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              "&:hover": { background: "linear-gradient(135deg, #4F46E5, #7C3AED)" },
            }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Update Password"}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSnack(null)} sx={{ borderRadius: 2 }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
