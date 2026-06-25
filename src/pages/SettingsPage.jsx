import { useEffect, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Paper,
  ToggleButton, ToggleButtonGroup, Typography, Alert, Snackbar,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { adminApi } from "../services/api";

const INTERVAL_OPTIONS = [
  { value: 0.25, label: "15 min" },
  { value: 0.5, label: "30 min" },
  { value: 1,   label: "1 hour" },
  { value: 2,   label: "2 hours" },
  { value: 4,   label: "4 hours" },
  { value: 6,   label: "6 hours" },
  { value: 8,   label: "8 hours" },
  { value: 12,  label: "12 hours" },
];

export default function SettingsPage() {
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [schedulerInterval, setSchedulerInterval] = useState(null);
  const [savingInterval, setSavingInterval] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });

  useEffect(() => {
    adminApi.getSchedulerInterval()
      .then(({ data }) => setSchedulerInterval(data.interval_hours))
      .catch(() => {});
  }, []);

  const handleIntervalChange = async (_, newValue) => {
    if (!newValue) return;
    setSavingInterval(true);
    try {
      await adminApi.setSchedulerInterval(newValue);
      setSchedulerInterval(newValue);
      showSnack(`Fetch interval updated to ${INTERVAL_OPTIONS.find(o => o.value === newValue)?.label}`);
    } catch {
      showSnack("Failed to update interval", "error");
    } finally {
      setSavingInterval(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const { data } = await adminApi.deleteAllArticles();
      setDeleteAllOpen(false);
      showSnack(`Deleted ${data.deleted} articles. Fetch new ones using the scheduler or "Fetch Now".`);
    } catch {
      showSnack("Failed to delete articles", "error");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>Settings</Typography>
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mt: 0.5 }}>
          Scheduler, data tools, and admin actions
        </Typography>
      </Box>

      {/* Fetch Scheduler */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ScheduleIcon sx={{ color: "#6366F1", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography fontWeight={700}>Fetch Scheduler</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              How often to automatically collect new articles
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 2.5 }} />

        {schedulerInterval === null ? (
          <CircularProgress size={20} sx={{ color: "#6366F1" }} />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              Current interval: <strong style={{ color: "#0F172A" }}>
                {INTERVAL_OPTIONS.find(o => o.value === schedulerInterval)?.label ?? `${schedulerInterval}h`}
              </strong>
            </Typography>
            <ToggleButtonGroup
              value={schedulerInterval}
              exclusive
              onChange={handleIntervalChange}
              disabled={savingInterval}
              size="small"
              sx={{
                flexWrap: "wrap",
                gap: 0.75,
                "& .MuiToggleButtonGroup-grouped": { borderRadius: "8px !important", border: "1px solid #E2E8F0 !important", mr: 0 },
                "& .Mui-selected": {
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6) !important",
                  color: "#fff !important",
                  borderColor: "#6366F1 !important",
                },
              }}
            >
              {INTERVAL_OPTIONS.map(({ value, label }) => (
                <ToggleButton key={value} value={value} sx={{ px: 2, py: 0.75, fontSize: "0.8rem", fontWeight: 600 }}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {savingInterval && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={14} sx={{ color: "#6366F1" }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>Updating…</Typography>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Danger Zone */}
      <Paper sx={{ mt: 3, p: 3, borderRadius: 2, border: "1px solid #FECACA" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={700} color="#DC2626">Danger Zone</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              Irreversible actions — proceed with caution
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 2, borderColor: "#FECACA" }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={600} sx={{ fontSize: "0.875rem" }}>Delete all articles</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
              Permanently removes all collected articles from the database. Keywords are kept.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteSweepIcon fontSize="small" />}
            onClick={() => setDeleteAllOpen(true)}
            sx={{ borderRadius: 2, ml: 2, whiteSpace: "nowrap" }}
          >
            Delete All Articles
          </Button>
        </Box>
      </Paper>

      {/* Delete All Confirm Dialog */}
      <Dialog open={deleteAllOpen} onClose={() => setDeleteAllOpen(false)} maxWidth="xs" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningAmberIcon sx={{ color: "#DC2626" }} />
            <Typography fontWeight={700}>Delete All Articles?</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete <strong style={{ color: "#0F172A" }}>all collected articles</strong> from the database.
            Your keywords will not be affected. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteAllOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleDeleteAll}
            variant="contained"
            color="error"
            disabled={deletingAll}
            sx={{ borderRadius: 2 }}
          >
            {deletingAll ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Yes, Delete All"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
