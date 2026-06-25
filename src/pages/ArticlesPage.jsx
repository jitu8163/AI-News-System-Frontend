import { useEffect, useState, useCallback } from "react";
import {
  Alert, Box, Chip, CircularProgress, Divider, Drawer,
  FormControl, IconButton, InputLabel, MenuItem, Paper,
  Select, TextField, Tooltip, Typography, Button, Grid,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArticleIcon from "@mui/icons-material/Article";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import { articlesApi, keywordsApi, dashboardApi } from "../services/api";
import ArticleDrawer from "../components/ArticleDrawer";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";

const RISK_LEVELS = ["High", "Medium", "Low"];

// Risk-level styling, used for the card strip and chips.
const RISK_CONFIG = {
  High:   { bg: "#FEF2F2", color: "#991B1B", dot: "#EF4444", strip: "linear-gradient(135deg, #EF4444, #B91C1C)" },
  Medium: { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B", strip: "linear-gradient(135deg, #F59E0B, #D97706)" },
  Low:    { bg: "#ECFDF5", color: "#065F46", dot: "#10B981", strip: "linear-gradient(135deg, #10B981, #059669)" },
};
const NEUTRAL_STRIP = "linear-gradient(135deg, #6366F1, #8B5CF6)";

// Numeric impact metrics shown as badges.
const METRIC_BADGES = {
  death_count:     { label: "Deaths",    bg: "#FEF2F2", color: "#991B1B" },
  positive_cases:  { label: "Positive",  bg: "#F0F9FF", color: "#0369A1" },
  suspected_cases: { label: "Suspected", bg: "#FFFBEB", color: "#92400E" },
};

const metricEntries = (a) =>
  Object.keys(METRIC_BADGES)
    .map((key) => [key, a[key]])
    .filter(([, v]) => v != null && v > 0);

function ArticleCard({ article, onClick }) {
  const risk = article.risk_level ? (RISK_CONFIG[article.risk_level] ?? null) : null;
  const badges = metricEntries(article);

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 40px rgba(99,102,241,0.13)",
          borderColor: "#6366F1",
        },
      }}
    >
      {/* Header strip (risk-colored) */}
      <Box sx={{ height: 5, background: risk?.strip ?? NEUTRAL_STRIP, flexShrink: 0 }} />

      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Disease + risk row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 1.5 }}>
          {article.disease_name ? (
            <Chip
              label={article.disease_name}
              size="small"
              sx={{ background: "#EEF2FF", color: "#4F46E5", fontWeight: 700, fontSize: "0.7rem", textTransform: "capitalize" }}
            />
          ) : <Box />}
          {risk && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: risk.dot }} />
              <Typography sx={{ fontSize: "0.72rem", color: risk.color, fontWeight: 600 }}>
                {article.risk_level} Risk
              </Typography>
            </Box>
          )}
        </Box>

        {/* Title */}
        <Typography
          fontWeight={700}
          sx={{
            fontSize: "0.9rem",
            lineHeight: 1.45,
            color: "#0F172A",
            mb: 1.5,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </Typography>

        {/* Summary snippet */}
        {article.ai_summary && (
          <Typography
            sx={{
              fontSize: "0.78rem",
              color: "#64748B",
              lineHeight: 1.6,
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.ai_summary}
          </Typography>
        )}

        {/* Impact badges */}
        {badges.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mb: 1.2 }}>
            {badges.map(([key, value]) => {
              const cfg = METRIC_BADGES[key];
              return (
                <Box key={key} sx={{ px: 1, py: 0.3, borderRadius: 1, background: cfg.bg, display: "flex", alignItems: "center", gap: 0.4 }}>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: cfg.color }}>{value.toLocaleString("en-US")}</Typography>
                  <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, color: cfg.color }}>{cfg.label}</Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Meta footer */}
        <Box sx={{ mt: "auto", pt: 1.5, borderTop: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 0.6 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569" }} noWrap>
              {article.source_name ?? "—"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 11, color: "#94A3B8" }} />
              <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                {article.published_date
                  ? new Date(article.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </Typography>
            </Box>
          </Box>
          {article.country && article.country !== "null" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOnIcon sx={{ fontSize: 11, color: "#94A3B8" }} />
              <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }} noWrap>
                {article.country}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Open link footer */}
      <Box
        sx={{
          px: 2.5, py: 1, background: "#F8FAFC",
          borderTop: "1px solid #F1F5F9",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>Click to view details</Typography>
        <Tooltip title="Open article">
          <IconButton
            size="small"
            href={article.article_url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "#94A3B8", "&:hover": { color: "#6366F1" }, p: 0.5 }}
          >
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(18);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [countryCounts, setCountryCounts] = useState([]);
  const [filters, setFilters] = useState({ keyword_id: "", risk_level: "", country: "", date_from: "", date_to: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    keywordsApi.list().then(({ data }) => setKeywords(data)).catch(() => {});
    dashboardApi.countryCounts()
      .then(({ data }) => setCountryCounts(data))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = {
      page: page + 1,
      page_size: pageSize,
      ...(filters.keyword_id && { keyword_id: filters.keyword_id }),
      ...(filters.risk_level && { risk_level: filters.risk_level }),
      ...(filters.country && { country: filters.country }),
      ...(filters.date_from && { date_from: filters.date_from }),
      ...(filters.date_to && { date_to: filters.date_to }),
    };
    articlesApi.list(params)
      .then(({ data }) => { setArticles(data.items); setTotal(data.total); })
      .catch(() => setError("Failed to load articles"))
      .finally(() => setLoading(false));
  }, [page, pageSize, filters]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value }));
  const handleClearFilters = () => setFilters({ keyword_id: "", risk_level: "", country: "", date_from: "", date_to: "" });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary">Articles</Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.875rem", mt: 0.5 }}>
            {total} articles collected · Page {page + 1} of {totalPages || 1}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {/* View mode toggle — shows only the other view's icon */}
          <Tooltip title={viewMode === "grid" ? "Switch to Table view" : "Switch to Grid view"}>
            <IconButton
              size="small"
              onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: 2,
                px: 1.2,
                color: "#94A3B8",
                "&:hover": { background: "#EEF2FF", color: "#6366F1", borderColor: "#6366F1" },
              }}
            >
              {viewMode === "grid" ? <ViewListIcon fontSize="small" /> : <GridViewIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterOpen(true)}
            sx={{
              borderRadius: 2, borderColor: "#E2E8F0", color: "text.primary",
              "&:hover": { borderColor: "#6366F1", color: "#6366F1", background: "#EEF2FF" },
            }}
            endIcon={activeFilterCount > 0 ? (
              <Box sx={{ width: 18, height: 18, borderRadius: "50%", background: "#6366F1", color: "#fff", fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {activeFilterCount}
              </Box>
            ) : null}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
          {filters.risk_level && <Chip label={`Risk: ${filters.risk_level}`} size="small" onDelete={() => setFilters(f => ({ ...f, risk_level: "" }))} sx={{ background: "#EEF2FF", color: "#6366F1" }} />}
          {filters.keyword_id && <Chip label={`Keyword: ${keywords.find(k => k.id === Number(filters.keyword_id))?.term ?? filters.keyword_id}`} size="small" onDelete={() => setFilters(f => ({ ...f, keyword_id: "" }))} sx={{ background: "#EEF2FF", color: "#6366F1" }} />}
          {filters.country && <Chip label={`Country: ${filters.country}`} size="small" onDelete={() => setFilters(f => ({ ...f, country: "" }))} sx={{ background: "#EEF2FF", color: "#6366F1" }} />}
          {filters.date_from && <Chip label={`From: ${filters.date_from}`} size="small" onDelete={() => setFilters(f => ({ ...f, date_from: "" }))} sx={{ background: "#EEF2FF", color: "#6366F1" }} />}
          {filters.date_to && <Chip label={`To: ${filters.date_to}`} size="small" onDelete={() => setFilters(f => ({ ...f, date_to: "" }))} sx={{ background: "#EEF2FF", color: "#6366F1" }} />}
          <Chip label="Clear all" size="small" variant="outlined" onClick={handleClearFilters} sx={{ borderColor: "#E2E8F0" }} />
        </Box>
      )}

      {/* Articles (grid or table) */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress sx={{ color: "#6366F1" }} />
        </Box>
      ) : articles.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 12, gap: 2 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: 3, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArticleIcon sx={{ fontSize: 32, color: "#CBD5E1" }} />
          </Box>
          <Typography color="text.secondary" fontWeight={500}>No articles found</Typography>
          {activeFilterCount > 0 && (
            <Button size="small" onClick={handleClearFilters} sx={{ color: "#6366F1" }}>Clear filters</Button>
          )}
        </Box>
      ) : viewMode === "grid" ? (
        <Grid container spacing={2.5}>
          {articles.map((a) => (
            <Grid item key={a.id} xs={12} sm={6} md={4}>
              <ArticleCard article={a} onClick={() => setSelectedId(a.id)} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#F8FAFC" }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Disease</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.map((a) => {
                  const risk = RISK_CONFIG[a.risk_level] ?? null;
                  return (
                    <TableRow
                      key={a.id}
                      hover
                      onClick={() => setSelectedId(a.id)}
                      sx={{ cursor: "pointer", "&:last-child td": { border: 0 }, "&:hover": { background: "#F8FAFC" } }}
                    >
                      <TableCell sx={{ maxWidth: 340 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}
                        >
                          {a.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#475569", textTransform: "capitalize" }}>
                          {a.disease_name ?? "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {risk && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: risk.dot }} />
                            <Typography sx={{ fontSize: "0.75rem", color: risk.color, fontWeight: 600 }}>{a.risk_level}</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                          {a.country && a.country !== "null" ? a.country : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                          {a.published_date
                            ? new Date(a.published_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Open article">
                          <IconButton
                            size="small"
                            href={a.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ color: "#94A3B8", "&:hover": { color: "#6366F1" }, p: 0.5 }}
                          >
                            <OpenInNewIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 4 }}>
          <IconButton
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            sx={{ border: "1px solid #E2E8F0", borderRadius: 2, "&:hover": { borderColor: "#6366F1" } }}
          >
            <NavigateBeforeIcon />
          </IconButton>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p;
              if (totalPages <= 7) p = i;
              else if (page < 4) p = i;
              else if (page > totalPages - 5) p = totalPages - 7 + i;
              else p = page - 3 + i;
              return (
                <Box
                  key={p}
                  onClick={() => setPage(p)}
                  sx={{
                    width: 36, height: 36, borderRadius: 2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
                    background: p === page ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "transparent",
                    color: p === page ? "#fff" : "#64748B",
                    border: p === page ? "none" : "1px solid #E2E8F0",
                    "&:hover": p !== page ? { borderColor: "#6366F1", color: "#6366F1" } : {},
                  }}
                >
                  {p + 1}
                </Box>
              );
            })}
          </Box>
          <IconButton
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            sx={{ border: "1px solid #E2E8F0", borderRadius: 2, "&:hover": { borderColor: "#6366F1" } }}
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
      )}

      {/* Filter Drawer */}
      <Drawer anchor="right" open={filterOpen} onClose={() => setFilterOpen(false)}>
        <Box sx={{ width: 320 }}>
          <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0" }}>
            <Typography variant="h6" fontWeight={700}>Filters</Typography>
            <IconButton size="small" onClick={() => setFilterOpen(false)}><CloseIcon fontSize="small" /></IconButton>
          </Box>

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Keyword</InputLabel>
              <Select value={filters.keyword_id} label="Keyword" onChange={handleFilterChange("keyword_id")} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All keywords</MenuItem>
                {keywords.map((k) => <MenuItem key={k.id} value={k.id}>{k.term}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Risk Level</InputLabel>
              <Select value={filters.risk_level} label="Risk Level" onChange={handleFilterChange("risk_level")} sx={{ borderRadius: 2 }}>
                <MenuItem value="">All risk levels</MenuItem>
                {RISK_LEVELS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>

            <Divider />

            <FormControl fullWidth size="small">
              <InputLabel>Country</InputLabel>
              <Select
                value={filters.country}
                label="Country"
                onChange={handleFilterChange("country")}
                sx={{ borderRadius: 2 }}
                MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
              >
                <MenuItem value="">All countries</MenuItem>
                {countryCounts.map((c) => (
                  <MenuItem key={c.country} value={c.country}>
                    {c.country} ({c.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />

            <TextField
              label="Date From"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.date_from}
              onChange={handleFilterChange("date_from")}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Date To"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.date_to}
              onChange={handleFilterChange("date_to")}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          <Box sx={{ p: 3, display: "flex", gap: 1.5, borderTop: "1px solid #E2E8F0" }}>
            <Button
              fullWidth variant="outlined"
              onClick={() => { handleClearFilters(); setFilterOpen(false); }}
              sx={{ borderRadius: 2, borderColor: "#E2E8F0", color: "text.primary" }}
            >
              Clear
            </Button>
            <Button
              fullWidth variant="contained"
              onClick={() => { setPage(0); setFilterOpen(false); }}
              sx={{ borderRadius: 2, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", "&:hover": { background: "linear-gradient(135deg, #4F46E5, #7C3AED)" } }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>

      <ArticleDrawer articleId={selectedId} onClose={() => setSelectedId(null)} />
    </Box>
  );
}
