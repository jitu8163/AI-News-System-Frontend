// Approximate centroid [lat, lng] for each Indian state / union territory.
// Used to place article-frequency dots on the dashboard India map. Keys must
// match the state names produced by the backend collector / AI extractor (see
// backend/app/collectors/countries.py). Common aliases (old state names and a
// few major cities) are included so AI-detected variants still resolve.
const countryCoords = {
  // States
  "Andhra Pradesh": [15.9, 79.7],
  "Arunachal Pradesh": [28.2, 94.7],
  Assam: [26.2, 92.9],
  Bihar: [25.7, 85.3],
  Chhattisgarh: [21.3, 81.9],
  Goa: [15.3, 74.1],
  Gujarat: [22.7, 71.6],
  Haryana: [29.1, 76.1],
  "Himachal Pradesh": [31.9, 77.2],
  Jharkhand: [23.6, 85.3],
  Karnataka: [15.3, 75.7],
  Kerala: [10.4, 76.4],
  "Madhya Pradesh": [23.5, 78.5],
  Maharashtra: [19.5, 75.7],
  Manipur: [24.7, 93.9],
  Meghalaya: [25.5, 91.4],
  Mizoram: [23.3, 92.8],
  Nagaland: [26.1, 94.5],
  Odisha: [20.6, 84.5],
  Punjab: [31.0, 75.4],
  Rajasthan: [27.0, 74.2],
  Sikkim: [27.5, 88.5],
  "Tamil Nadu": [11.1, 78.4],
  Telangana: [17.9, 79.1],
  Tripura: [23.7, 91.7],
  "Uttar Pradesh": [27.0, 80.9],
  Uttarakhand: [30.1, 79.2],
  "West Bengal": [22.9, 87.9],
  // Union Territories
  "Andaman and Nicobar Islands": [11.7, 92.7],
  Chandigarh: [30.7, 76.8],
  "Dadra and Nagar Haveli and Daman and Diu": [20.3, 73.0],
  Delhi: [28.6, 77.2],
  "Jammu and Kashmir": [33.8, 76.6],
  Ladakh: [34.2, 77.6],
  Lakshadweep: [10.6, 72.6],
  Puducherry: [11.9, 79.8],
};

// Common AI-detected aliases (old names + major cities) → canonical state above.
const ALIASES = {
  Orissa: "Odisha",
  Uttaranchal: "Uttarakhand",
  Pondicherry: "Puducherry",
  "J&K": "Jammu and Kashmir",
  "NCR": "Delhi",
  "New Delhi": "Delhi",
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Nagpur: "Maharashtra",
  Bengaluru: "Karnataka",
  Bangalore: "Karnataka",
  Chennai: "Tamil Nadu",
  Kolkata: "West Bengal",
  Hyderabad: "Telangana",
  Ahmedabad: "Gujarat",
  Lucknow: "Uttar Pradesh",
  Jaipur: "Rajasthan",
  Patna: "Bihar",
  Bhopal: "Madhya Pradesh",
  Kochi: "Kerala",
  Thiruvananthapuram: "Kerala",
};

for (const [alias, canonical] of Object.entries(ALIASES)) {
  if (countryCoords[canonical]) countryCoords[alias] = countryCoords[canonical];
}

export default countryCoords;
