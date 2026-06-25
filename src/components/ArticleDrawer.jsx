import { useEffect, useState } from "react";
import {
  Box, Chip, CircularProgress, Drawer,
  IconButton, Link, Typography, Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import SourceIcon from "@mui/icons-material/Source";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import { articlesApi } from "../services/api";

// Numeric impact metrics displayed as count tiles.
const METRIC_CONFIG = [
  { key: "death_count",     label: "Deaths",    bg: "#FEF2F2", color: "#991B1B", border: "#FECACA" },
  { key: "positive_cases",  label: "Positive",  bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD" },
  { key: "suspected_cases", label: "Suspected", bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
];

const RISK_CONFIG = {
  High:   { bg: "#FEF2F2", color: "#991B1B", dot: "#EF4444" },
  Medium: { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B" },
  Low:    { bg: "#ECFDF5", color: "#065F46", dot: "#10B981" },
};

// Structured One Health text fields, shown as a labelled grid.
const DETAIL_FIELDS = [
  { key: "disease_category", label: "Disease Category" },
  { key: "human_health_impact", label: "Human Health Impact" },
  { key: "animal_health_impact", label: "Animal Health Impact" },
  { key: "environmental_health_impact", label: "Environmental Health Impact" },
  { key: "species_affected", label: "Species Affected" },
  { key: "environmental_factors", label: "Environmental Factors" },
  { key: "symptoms", label: "Symptoms" },
];

export default function ArticleDrawer({ articleId, onClose }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!articleId) { setArticle(null); return; }
    setLoading(true);
    articlesApi.get(articleId)
      .then(({ data }) => setArticle(data))
      .finally(() => setLoading(false));
  }, [articleId]);

  const risk = article?.risk_level ? (RISK_CONFIG[article.risk_level] ?? null) : null;
  const metricTiles = article ? METRIC_CONFIG.filter((m) => article[m.key] != null && article[m.key] > 0) : [];
  const detailRows = article ? DETAIL_FIELDS.filter((f) => article[f.key]) : [];

  return (
    <Drawer anchor="right" open={Boolean(articleId)} onClose={onClose}>
      <Box sx={{ width: { xs: "100vw", sm: "50vw" }, minWidth: { sm: 480 }, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Header bar */}
        <Box sx={{
          px: 3, py: 2,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid #E2E8F0",
          background: "#F8FAFC",
        }}>
          <Typography variant="subtitle2" color="text.secondary">Article Detail</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "#64748B" }}><CloseIcon fontSize="small" /></IconButton>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            <CircularProgress sx={{ color: "#6366F1" }} />
          </Box>
        )}

        {article && !loading && (
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {/* Title section */}
            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.4, mb: 2, color: "#0F172A" }}>
                {article.title}
              </Typography>

              {/* Tags: disease + risk */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
                {article.disease_name && (
                  <Chip
                    label={article.disease_name}
                    size="small"
                    icon={<CoronavirusIcon sx={{ fontSize: "16px !important", color: "#4F46E5 !important", ml: "6px !important" }} />}
                    sx={{ background: "#EEF2FF", color: "#4F46E5", fontWeight: 700, fontSize: "0.75rem", textTransform: "capitalize" }}
                  />
                )}
                {risk && (
                  <Chip
                    label={`${article.risk_level} Risk`}
                    size="small"
                    icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", background: risk.dot, ml: "6px !important" }} />}
                    sx={{ background: risk.bg, color: risk.color, fontWeight: 600, fontSize: "0.75rem" }}
                  />
                )}
              </Box>

              {/* Meta */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {article.source_name && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SourceIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>{article.source_name}</Typography>
                  </Box>
                )}
                {(article.event_date || article.published_date) && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                      {article.event_date
                        ? `Event: ${new Date(article.event_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
                        : new Date(article.published_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </Typography>
                  </Box>
                )}
                {article.country && article.country !== "null" && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                      {article.country}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Link
                href={article.article_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5, mt: 2,
                  fontSize: "0.8rem", fontWeight: 600, color: "#6366F1",
                  textDecoration: "none", "&:hover": { textDecoration: "underline" },
                }}
              >
                Read full article <OpenInNewIcon sx={{ fontSize: 14 }} />
              </Link>
            </Box>

            {/* Reported counts */}
            {metricTiles.length > 0 && (
              <>
                <Divider />
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BarChartIcon sx={{ fontSize: 14, color: "#991B1B" }} />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary">Reported Numbers</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {metricTiles.map((cfg) => (
                      <Box
                        key={cfg.key}
                        sx={{
                          px: 2, py: 1.2,
                          borderRadius: 2,
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90,
                        }}
                      >
                        <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: cfg.color, lineHeight: 1.2 }}>
                          {article[cfg.key].toLocaleString("en-US")}
                        </Typography>
                        <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.3 }}>
                          {cfg.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}

            {/* Structured One Health details */}
            {detailRows.length > 0 && (
              <>
                <Divider />
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    One Health Details
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                    {detailRows.map((f) => (
                      <Box key={f.key}>
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {f.label}
                        </Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "#334155", fontWeight: 500 }}>
                          {article[f.key]}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}

            <Divider />

            {/* AI Summary */}
            {article.ai_summary && (
              <Box sx={{ px: 3, py: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: 1.5,
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <AutoAwesomeIcon sx={{ fontSize: 14, color: "#fff" }} />
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">AI Summary</Typography>
                </Box>
                <Box sx={{ background: "#F8FAFC", borderRadius: 2, p: 2, borderLeft: "3px solid #6366F1" }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.8, color: "#334155" }}>
                    {article.ai_summary}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Full content */}
            {article.content && (
              <>
                <Divider />
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Article Content
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ lineHeight: 1.8, color: "#475569", maxHeight: 400, overflow: "auto", whiteSpace: "pre-wrap" }}
                  >
                    {article.content}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
