import { useEffect, useState } from "react";
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Paper, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography, Alert, Snackbar, Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyIcon from "@mui/icons-material/VpnKey";
import { keywordsApi } from "../services/api";

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [termInput, setTermInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const load = () => {
    setLoading(true);
    keywordsApi.list()
      .then(({ data }) => setKeywords(data))
      .catch(() => setError("Failed to load keywords"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });
  const openCreate = () => { setEditTarget(null); setTermInput(""); setDialogOpen(true); };
  const openEdit = (kw) => { setEditTarget(kw); setTermInput(kw.term); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);

  const handleSave = async () => {
    if (!termInput.trim()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await keywordsApi.update(editTarget.id, { term: termInput.trim() });
        showSnack("Keyword updated");
      } else {
        await keywordsApi.create({ term: termInput.trim() });
        showSnack("Keyword created");
      }
      closeDialog();
      load();
    } catch (err) {
      showSnack(err.response?.data?.detail ?? "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (kw) => {
    try {
      await keywordsApi.update(kw.id, { is_active: !kw.is_active });
      load();
    } catch {
      showSnack("Toggle failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await keywordsApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      showSnack("Keyword deleted");
      load();
    } catch {
      showSnack("Delete failed", "error");
    }
  };

  const activeCount = keywords.filter((k) => k.is_active).length;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Keywords</Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mt: 0.5 }}>
            {activeCount} active · {keywords.length - activeCount} inactive
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            borderRadius: 2,
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            "&:hover": { background: "linear-gradient(135deg, #4F46E5, #7C3AED)" },
          }}
        >
          Add Keyword
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress sx={{ color: "#6366F1" }} /></Box>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#F8FAFC" }}>
                  <TableCell>Term</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keywords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                          width: 56, height: 56, borderRadius: 3,
                          background: "#EEF2FF",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <KeyIcon sx={{ color: "#6366F1", fontSize: 26 }} />
                        </Box>
                        <Typography fontWeight={600} color="text.primary">No keywords yet</Typography>
                        <Typography color="text.secondary" variant="body2">Add a keyword to start monitoring news</Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={openCreate}
                          sx={{ mt: 1, borderRadius: 2, background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                        >
                          Add first keyword
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
                {keywords.map((kw) => (
                  <TableRow key={kw.id} hover sx={{ "&:last-child td": { border: 0 }, "&:hover": { background: "#F8FAFC" } }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                          width: 32, height: 32, borderRadius: 1.5,
                          background: kw.is_active ? "#EEF2FF" : "#F8FAFC",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <KeyIcon sx={{ fontSize: 16, color: kw.is_active ? "#6366F1" : "#CBD5E1" }} />
                        </Box>
                        <Typography fontWeight={600} sx={{ fontSize: "0.875rem" }}>{kw.term}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <Tooltip title={kw.is_active ? "Click to disable" : "Click to enable"}>
                          <Switch
                            checked={kw.is_active}
                            onChange={() => handleToggle(kw)}
                            size="small"
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": { color: "#6366F1" },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#6366F1" },
                            }}
                          />
                        </Tooltip>
                        <Chip
                          label={kw.is_active ? "Active" : "Inactive"}
                          size="small"
                          sx={kw.is_active
                            ? { background: "#ECFDF5", color: "#065F46", fontWeight: 600, fontSize: "0.72rem", height: 22 }
                            : { background: "#F8FAFC", color: "#94A3B8", fontWeight: 600, fontSize: "0.72rem", height: 22 }
                          }
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                        {new Date(kw.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(kw)} sx={{ color: "#94A3B8", "&:hover": { color: "#6366F1", background: "#EEF2FF" } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteTarget(kw)} sx={{ color: "#94A3B8", "&:hover": { color: "#EF4444", background: "#FEF2F2" } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={700}>{editTarget ? "Edit Keyword" : "Add New Keyword"}</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <TextField
            autoFocus
            fullWidth
            label="Keyword Term"
            placeholder="e.g. Artificial Intelligence"
            value={termInput}
            onChange={(e) => setTermInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !termInput.trim()}
            sx={{ borderRadius: 2, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", "&:hover": { background: "linear-gradient(135deg, #4F46E5, #7C3AED)" } }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Typography fontWeight={700}>Delete Keyword</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete <strong style={{ color: "#0F172A" }}>{deleteTarget?.term}</strong>?
            This will unlink it from all associated articles.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2 }}>
            Delete
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
