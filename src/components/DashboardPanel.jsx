import { useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, CircularProgress, Alert,
  Chip, Button, Snackbar, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  ToggleButton, ToggleButtonGroup, FormControl, InputLabel,
  Select, MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import MapIcon from "@mui/icons-material/Map";
import {
  PieChart, Pie, Sector, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,
} from "recharts";
import { dashboardApi, adminApi, keywordsApi } from "../services/api";
import WorldMap from "./WorldMap";

const CATEGORY_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"];
const RISK_COLORS = { High: "#EF4444", Medium: "#F59E0B", Low: "#10B981" };
const RISK_TEXT = { High: "#991B1B", Medium: "#92400E", Low: "#065F46" };
const COUNTRY_COLORS = ["#6366F1", "#8B5CF6", "#0EA5E9", "#06B6D4", "#10B981", "#84CC16", "#F59E0B", "#EF4444", "#F97316", "#E11D48", "#9333EA", "#0284C7", "#15803D", "#CA8A04", "#475569"];

// Numeric impact metrics: order, label, and color used across KPI cards, the
// disease table, and the timeline metric toggle.
const IMPACT_METRICS = [
  { key: "death_count",     label: "Deaths",     color: "#DC2626", gradient: "linear-gradient(135deg, #EF4444, #B91C1C)" },
  { key: "positive_cases",  label: "Positive",   color: "#0284C7", gradient: "linear-gradient(135deg, #0EA5E9, #0369A1)" },
  { key: "suspected_cases", label: "Suspected",  color: "#D97706", gradient: "linear-gradient(135deg, #F59E0B, #B45309)" },
];

function StatCard({ label, value, icon, gradient, sub }) {
  return (
    <Paper sx={{ p: 1.5, borderRadius: 1.5, background: gradient, color: "#fff", position: "relative", overflow: "hidden", height: 72, boxSizing: "border-box" }}>
      <Box sx={{
        position: "absolute", top: -10, right: -10, width: 48, height: 48,
        borderRadius: "50%", background: "rgba(255,255,255,0.1)",
      }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 600, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.3 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
          {sub && (
            <Typography sx={{ fontSize: "0.6rem", opacity: 0.8, mt: 0.3 }}>{sub}</Typography>
          )}
        </Box>
        <Box sx={{
          width: 28, height: 28, borderRadius: 1,
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, borderRadius: 2 }}>
      <Typography variant="body2" fontWeight={600}>{payload[0].name || payload[0].dataKey}</Typography>
      <Typography variant="body2" color="text.secondary">{payload[0].value} articles</Typography>
    </Paper>
  );
};

export default function DashboardPanel() {
  const [stats, setStats] = useState(null);
  const [countryCounts, setCountryCounts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [snack, setSnack] = useState(null);
  const [impactMetric, setImpactMetric] = useState("death_count");

  const isAdmin = Boolean(localStorage.getItem("token"));

  // Health-impact filters (default: all = total)
  const [keywords, setKeywords] = useState([]);
  const [impactFilters, setImpactFilters] = useState({ keyword_id: "", country: "" });
  const [impact, setImpact] = useState(null);
  const [impactLoading, setImpactLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats()
      .then(({ data }) => setStats(data))
      .catch(() => setError("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
    dashboardApi.countryCounts().then(({ data }) => setCountryCounts(data)).catch(() => {});
    dashboardApi.regions().then(({ data }) => setRegions(data)).catch(() => {});
    keywordsApi.list().then(({ data }) => setKeywords(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setImpactLoading(true);
    const params = {
      ...(impactFilters.keyword_id && { keyword_id: impactFilters.keyword_id }),
      ...(impactFilters.country && { country: impactFilters.country }),
    };
    dashboardApi.impact(params)
      .then(({ data }) => setImpact(data))
      .catch(() => setImpact({ totals: {}, timeline: [], by_disease: [] }))
      .finally(() => setImpactLoading(false));
  }, [impactFilters]);

  const handleFetchNow = async () => {
    setFetching(true);
    try {
      await adminApi.fetchNow();
      setSnack("News collection started — refresh in a minute to see new articles.");
    } catch {
      setSnack("Failed to trigger news collection.");
    } finally {
      setFetching(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress sx={{ color: "#6366F1" }} />
    </Box>
  );
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert></Box>;

  const riskDistribution = stats.risk_distribution ?? [];
  const totalRisk = riskDistribution.reduce((s, x) => s + x.count, 0);

  const impactTotals = impact?.totals ?? {};
  const impactGrandTotal = IMPACT_METRICS.reduce((s, m) => s + (impactTotals[m.key] ?? 0), 0);
  const diseaseRows = impact?.by_disease ?? [];
  const impactTimeline = impact?.timeline ?? [];
  const selectedMetricCfg = IMPACT_METRICS.find((m) => m.key === impactMetric) ?? IMPACT_METRICS[0];
  // Full list of Indian states for the filter, with article counts where present.
  const stateCounts = Object.fromEntries(countryCounts.map((c) => [c.country, c.count]));
  const stateOptions = Array.from(new Set([...regions, ...countryCounts.map((c) => c.country)]));
  const impactFilterActive = Boolean(impactFilters.keyword_id || impactFilters.country);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">Dashboard</Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mt: 0.5 }}>
            India disease &amp; outbreak monitoring overview
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={fetching ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <RefreshIcon />}
            onClick={handleFetchNow}
            disabled={fetching}
            sx={{
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              borderRadius: 2, px: 2.5,
              "&:hover": { background: "linear-gradient(135deg, #4F46E5, #7C3AED)" },
            }}
          >
            {fetching ? "Fetching…" : "Fetch Now"}
          </Button>
        )}
      </Box>

      {/* World Map */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <MapIcon sx={{ color: "#6366F1", fontSize: 20 }} />
          <Typography variant="h6" fontWeight={700}>Articles Across India</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <WorldMap data={countryCounts} />
      </Paper>

      {/* Health Impact (counts) */}
      {stats.total_articles > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MonitorHeartIcon sx={{ color: "#DC2626", fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700}>Health Impact</Typography>
              {impactLoading && <CircularProgress size={14} sx={{ color: "#DC2626" }} />}
            </Box>

            {/* Filters: default is Total (all blank) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Disease</InputLabel>
                <Select
                  value={impactFilters.keyword_id}
                  label="Disease"
                  onChange={(e) => setImpactFilters((f) => ({ ...f, keyword_id: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All diseases</MenuItem>
                  {keywords.map((k) => <MenuItem key={k.id} value={k.id}>{k.term}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>State</InputLabel>
                <Select
                  value={impactFilters.country}
                  label="State"
                  onChange={(e) => setImpactFilters((f) => ({ ...f, country: e.target.value }))}
                  sx={{ borderRadius: 2 }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
                >
                  <MenuItem value="">All States</MenuItem>
                  {stateOptions.map((s) => (
                    <MenuItem key={s} value={s}>{stateCounts[s] ? `${s} (${stateCounts[s]})` : s}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {impactFilterActive && (
                <Chip
                  label="Reset to Total"
                  size="small"
                  variant="outlined"
                  onClick={() => setImpactFilters({ keyword_id: "", country: "" })}
                  sx={{ borderColor: "#E2E8F0" }}
                />
              )}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem", mb: 1.5 }}>
            {impactGrandTotal === 0
              ? "No casualty/case numbers detected for this selection yet. Tiles fill in automatically when collected news reports specific figures (e.g. “8 deaths, 125 suspected cases”)."
              : `Showing ${impactFilterActive ? "filtered" : "total"} reported figures across ${impactFilterActive ? "the selected scope" : "all collected articles"}.`}
          </Typography>

          <Grid container spacing={2} mb={3}>
            {IMPACT_METRICS.map((m) => (
              <Grid item xs={12} sm={4} key={m.key}>
                <StatCard
                  label={m.label}
                  value={(impactTotals[m.key] ?? 0).toLocaleString("en-US")}
                  icon={<MonitorHeartIcon sx={{ color: "#fff", fontSize: 14 }} />}
                  gradient={m.gradient}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* Impact over time */}
            {impactTimeline.length > 0 && (
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>Impact Over Time</Typography>
                    <ToggleButtonGroup
                      value={impactMetric}
                      exclusive
                      size="small"
                      onChange={(_, v) => v && setImpactMetric(v)}
                      sx={{
                        flexWrap: "wrap",
                        "& .MuiToggleButton-root": { px: 1.2, py: 0.3, fontSize: "0.68rem", fontWeight: 700, textTransform: "none", border: "1px solid #E2E8F0", borderRadius: "8px !important", mr: 0.5 },
                        "& .Mui-selected": { background: `${selectedMetricCfg.color} !important`, color: "#fff !important", borderColor: `${selectedMetricCfg.color} !important` },
                      }}
                    >
                      {IMPACT_METRICS.map((m) => (
                        <ToggleButton key={m.key} value={m.key}>{m.label}</ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={impactTimeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey={impactMetric} name={selectedMetricCfg.label} stroke={selectedMetricCfg.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Impact by Disease */}
            {diseaseRows.length > 0 && (
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Impact by Disease</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <TableContainer sx={{ maxHeight: 280 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ background: "#F8FAFC", fontWeight: 700 }}>Disease</TableCell>
                          <TableCell align="right" sx={{ background: "#F8FAFC", fontWeight: 700, color: "#DC2626" }}>Deaths</TableCell>
                          <TableCell align="right" sx={{ background: "#F8FAFC", fontWeight: 700, color: "#0284C7" }}>Positive</TableCell>
                          <TableCell align="right" sx={{ background: "#F8FAFC", fontWeight: 700, color: "#D97706" }}>Suspected</TableCell>
                          <TableCell align="right" sx={{ background: "#F8FAFC", fontWeight: 700 }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {diseaseRows.map((row) => (
                          <TableRow key={row.disease} hover>
                            <TableCell sx={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize" }}>{row.disease}</TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.78rem", color: "#DC2626", fontWeight: 700 }}>{row.death_count.toLocaleString("en-US")}</TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.78rem", color: "#0284C7", fontWeight: 700 }}>{row.positive_cases.toLocaleString("en-US")}</TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.78rem", color: "#D97706", fontWeight: 700 }}>{row.suspected_cases.toLocaleString("en-US")}</TableCell>
                            <TableCell align="right" sx={{ fontSize: "0.78rem", fontWeight: 800 }}>{row.total.toLocaleString("en-US")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Risk Level + Top Keywords */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Risk Level Distribution</Typography>
            <Divider sx={{ mb: 2 }} />
            {riskDistribution.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: "center" }}>No data yet</Typography>
            ) : (
              <>
                <Box sx={{ "& .recharts-wrapper svg *:focus": { outline: "none" } }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        dataKey="count"
                        nameKey="risk_level"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        activeShape={(props) => <Sector {...props} stroke="none" />}
                      >
                        {riskDistribution.map((entry, i) => (
                          <Cell key={i} fill={RISK_COLORS[entry.risk_level] ?? CATEGORY_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} cursor={false} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
                  {riskDistribution.map((entry) => (
                    <Box key={entry.risk_level} sx={{ textAlign: "center" }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: RISK_TEXT[entry.risk_level] ?? "#475569", lineHeight: 1 }}>
                        {totalRisk ? Math.round((entry.count / totalRisk) * 100) : 0}%
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{entry.risk_level}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Top Keywords</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {stats.keyword_stats.length === 0 && (
                <Typography color="text.secondary" variant="body2">No data yet</Typography>
              )}
              {stats.keyword_stats.map(({ keyword, count }, i) => {
                const max = stats.keyword_stats[0]?.count || 1;
                return (
                  <Box key={keyword}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8rem" }} noWrap>{keyword}</Typography>
                      <Chip label={count} size="small" sx={{ background: "#EEF2FF", color: "#6366F1", fontWeight: 700, fontSize: "0.7rem", height: 20 }} />
                    </Box>
                    <Box sx={{ height: 4, borderRadius: 2, background: "#F1F5F9" }}>
                      <Box sx={{ height: "100%", borderRadius: 2, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length], width: `${(count / max) * 100}%`, transition: "width 0.5s ease" }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Articles by Country */}
      {stats.articles_by_country.length > 0 && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Articles by State (Top 20)</Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height={Math.max(280, stats.articles_by_country.length * 26)}>
                <BarChart data={stats.articles_by_country} layout="vertical" barSize={14} margin={{ left: 16, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="country" width={150} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {stats.articles_by_country.map((_, i) => (
                      <Cell key={i} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Latest 10 Articles */}
      {stats.recent_articles.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Latest 10 Articles</Typography>
          <Divider sx={{ mb: 1 }} />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: "#F8FAFC" }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Disease</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recent_articles.map((article) => (
                  <TableRow key={article.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}
                      >
                        {article.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.75rem", color: "#475569", textTransform: "capitalize" }}>
                        {article.disease_name ?? "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {article.risk_level && (
                        <Typography sx={{ fontSize: "0.75rem", color: RISK_TEXT[article.risk_level] ?? "#475569", fontWeight: 600 }}>
                          {article.risk_level}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                        {article.country && article.country !== "null" ? article.country : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                        {article.published_date
                          ? new Date(article.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <a href={article.article_url} target="_blank" rel="noopener noreferrer" style={{ color: "#94A3B8", display: "inline-flex" }}>
                        <OpenInNewIcon sx={{ fontSize: 14, "&:hover": { color: "#6366F1" } }} />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
