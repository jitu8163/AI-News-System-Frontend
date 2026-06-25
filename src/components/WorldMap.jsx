import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import { Box, Typography } from "@mui/material";
import "leaflet/dist/leaflet.css";
import countryCoords from "../data/countryCoords";

const DOT_COLOR = "#6366F1";
const DOT_RADIUS = 3;             // small dot per article
const SPREAD_DEG = 2.2;           // jitter radius around the country centroid (degrees)
const MAX_DOTS_PER_COUNTRY = 200; // safety cap to keep the map responsive

// Deterministic scatter so dots don't jump around on every re-render.
function scatter(country, n) {
  let seed = 0;
  for (let i = 0; i < country.length; i++) seed = (seed * 31 + country.charCodeAt(i)) % 233280;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const [lat, lng] = countryCoords[country];
  const pts = [];
  const count = Math.min(n, MAX_DOTS_PER_COUNTRY);
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(rand()) * SPREAD_DEG; // sqrt => uniform spread over the disc
    const theta = rand() * 2 * Math.PI;
    pts.push([lat + Math.sin(theta) * r * 0.9, lng + Math.cos(theta) * r]);
  }
  return pts;
}

/**
 * World map: one small dot per article, scattered around each country's
 * centroid. Denser countries therefore show more dots (visual article
 * frequency).
 * @param {Array<{country: string, count: number}>} data
 */
export default function WorldMap({ data = [] }) {
  const countries = data.filter((d) => countryCoords[d.country] && d.count > 0);
  const total = countries.reduce((s, d) => s + d.count, 0);

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ height: 420, borderRadius: 2, overflow: "hidden", border: "1px solid #E2E8F0" }}>
        <MapContainer
          center={[20, 10]}
          zoom={2}
          minZoom={2}
          maxZoom={6}
          worldCopyJump
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", background: "#EAF2FB" }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {countries.map((d) =>
            scatter(d.country, d.count).map((pos, i) => (
              <CircleMarker
                key={`${d.country}-${i}`}
                center={pos}
                radius={DOT_RADIUS}
                pathOptions={{
                  color: DOT_COLOR,
                  weight: 0.5,
                  fillColor: DOT_COLOR,
                  fillOpacity: 0.7,
                }}
              >
                <LeafletTooltip direction="top" offset={[0, -2]}>
                  <strong>{d.country}</strong> — {d.count} article{d.count === 1 ? "" : "s"}
                </LeafletTooltip>
              </CircleMarker>
            ))
          )}
        </MapContainer>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: DOT_COLOR, opacity: 0.7 }} />
        <Typography sx={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>
          Each dot = 1 article{total > 0 ? ` · ${total.toLocaleString("en-US")} located` : ""}
        </Typography>
        {total === 0 && (
          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", ml: 1 }}>
            No country-tagged articles yet
          </Typography>
        )}
      </Box>
    </Box>
  );
}
