// Approximate centroid [lat, lng] for each monitored country. Used to place
// article-frequency dots on the dashboard world map. Keys must match the
// country names produced by the backend collector / AI extractor (see
// backend/app/collectors/countries.py). A few common aliases are included so
// AI-detected variants (e.g. "USA", "UK") still resolve to a location.
const countryCoords = {
  // North America
  "United States": [39.8, -98.6],
  Canada: [56.1, -106.3],
  Mexico: [23.6, -102.5],
  Cuba: [21.5, -77.8],
  // South America
  Brazil: [-14.2, -51.9],
  Argentina: [-38.4, -63.6],
  Colombia: [4.6, -74.3],
  Chile: [-35.7, -71.5],
  Peru: [-9.2, -75.0],
  Venezuela: [6.4, -66.6],
  // Europe
  "United Kingdom": [54.0, -2.4],
  Ireland: [53.4, -8.2],
  Germany: [51.2, 10.4],
  France: [46.2, 2.2],
  Italy: [41.9, 12.6],
  Spain: [40.0, -3.7],
  Portugal: [39.4, -8.2],
  Netherlands: [52.1, 5.3],
  Belgium: [50.5, 4.5],
  Switzerland: [46.8, 8.2],
  Austria: [47.5, 14.6],
  Sweden: [60.1, 15.6],
  Norway: [61.0, 9.0],
  Denmark: [56.0, 9.5],
  Finland: [63.0, 26.0],
  Poland: [51.9, 19.1],
  Czechia: [49.8, 15.5],
  Hungary: [47.2, 19.5],
  Romania: [45.9, 25.0],
  Greece: [39.1, 22.5],
  Ukraine: [48.4, 31.2],
  Russia: [61.5, 90.0],
  // Middle East
  Turkey: [39.0, 35.2],
  Israel: [31.0, 34.85],
  "United Arab Emirates": [24.0, 54.0],
  "Saudi Arabia": [23.9, 45.1],
  Qatar: [25.35, 51.2],
  Kuwait: [29.3, 47.6],
  Bahrain: [26.0, 50.55],
  Oman: [21.5, 55.9],
  Lebanon: [33.85, 35.86],
  Jordan: [31.0, 36.2],
  // Africa
  Egypt: [26.8, 30.8],
  Morocco: [31.8, -7.1],
  Nigeria: [9.1, 8.7],
  Kenya: [0.2, 37.9],
  Ghana: [7.95, -1.0],
  Uganda: [1.37, 32.3],
  Tanzania: [-6.4, 34.9],
  Ethiopia: [9.15, 40.5],
  Zimbabwe: [-19.0, 29.15],
  "South Africa": [-30.6, 24.0],
  Botswana: [-22.3, 24.7],
  Namibia: [-22.0, 18.5],
  // South Asia
  India: [22.35, 78.7],
  Pakistan: [30.4, 69.3],
  Bangladesh: [23.7, 90.4],
  "Sri Lanka": [7.9, 80.8],
  Nepal: [28.4, 84.1],
  // South-East & East Asia
  Singapore: [1.35, 103.8],
  Malaysia: [4.2, 102.0],
  Philippines: [12.9, 121.8],
  Indonesia: [-2.5, 118.0],
  Thailand: [15.9, 101.0],
  Vietnam: [16.0, 107.8],
  "Hong Kong": [22.35, 114.15],
  Taiwan: [23.7, 121.0],
  Japan: [37.5, 138.3],
  "South Korea": [36.4, 127.8],
  China: [35.9, 104.2],
  // Oceania
  Australia: [-25.3, 133.8],
  "New Zealand": [-41.5, 173.0],
};

// Common AI-detected aliases → canonical coordinates above.
const ALIASES = {
  USA: "United States",
  "United States of America": "United States",
  UK: "United Kingdom",
  "Great Britain": "United Kingdom",
  England: "United Kingdom",
  UAE: "United Arab Emirates",
  "Czech Republic": "Czechia",
  "Russian Federation": "Russia",
  Korea: "South Korea",
};

for (const [alias, canonical] of Object.entries(ALIASES)) {
  if (countryCoords[canonical]) countryCoords[alias] = countryCoords[canonical];
}

export default countryCoords;
