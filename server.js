const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DB = path.join(__dirname, "db.json");

function readDB() {
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// haversine distance (km)
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * GET /cafes
 * query params:
 *  - search (string)  -> searches name, address, tags
 *  - minRating (number)
 *  - lat, lon (numbers) -> user's position (optional; used to compute distance)
 *  - radius (number, km) -> filters only cafes within radius
 *  - sort (rating_desc|rating_asc|name_asc|name_desc|distance_asc|distance_desc)
 */
app.get("/cafes", (req, res) => {
  const db = readDB();
  let cafes = db.cafes.map(c => ({ ...c })); // clone

  const search = (req.query.search || "").trim().toLowerCase();
  const minRating = parseFloat(req.query.minRating);
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const radius = parseFloat(req.query.radius);
  const sort = (req.query.sort || "rating_desc").toLowerCase();

  if (search) {
    cafes = cafes.filter(c => {
      const blob = `${c.name} ${c.address} ${(c.tags || []).join(" ")}`.toLowerCase();
      return blob.includes(search);
    });
  }

  if (!Number.isNaN(minRating)) {
    cafes = cafes.filter(c => Number(c.rating) >= minRating);
  }

  const haveUserPos = !Number.isNaN(lat) && !Number.isNaN(lon);
  if (haveUserPos) {
    cafes = cafes.map(c => {
      const d = haversine(lat, lon, c.lat, c.lon);
      return { ...c, distanceKm: Number(d.toFixed(3)) };
    });
    if (!Number.isNaN(radius)) {
      cafes = cafes.filter(c => c.distanceKm <= radius);
    }
  }

  // Sorting
  if (sort === "rating_desc") cafes.sort((a, b) => b.rating - a.rating);
  else if (sort === "rating_asc") cafes.sort((a, b) => a.rating - b.rating);
  else if (sort === "name_asc") cafes.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "name_desc") cafes.sort((a, b) => b.name.localeCompare(a.name));
  else if (sort === "distance_asc" && haveUserPos) cafes.sort((a, b) => (a.distanceKm || 1e9) - (b.distanceKm || 1e9));
  else if (sort === "distance_desc" && haveUserPos) cafes.sort((a, b) => (b.distanceKm || -1e9) - (a.distanceKm || -1e9));

  res.json(cafes);
});

// Add cafe (simple persist to db.json)
app.post("/cafes", (req, res) => {
  const db = readDB();
  const newCafe = { id: Date.now(), ...req.body };
  db.cafes.push(newCafe);
  writeDB(db);
  res.status(201).json(newCafe);
});

app.delete("/cafes/:id", (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.cafes = db.cafes.filter(c => c.id !== id);
  writeDB(db);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
