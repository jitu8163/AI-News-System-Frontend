import { Box } from "@mui/material";
import DashboardPanel from "../components/DashboardPanel";

/**
 * Standalone (admin) dashboard — the complete dashboard shown full-width,
 * alone, via the "Dashboard" nav button after login.
 */
export default function DashboardPage() {
  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <DashboardPanel />
    </Box>
  );
}
