let map;
let cafeLayer;
let cafes = [];
let userLocation = null;

function initMap() {
  map = L.map("map").setView([9.9252, 78.1198], 13); // Madurai center
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  cafeLayer = L.layerGroup().addTo(map);

  fetchCafes();
}

async function fetchCafes() {
  // Bounding box query (~20 km around Madurai)
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="cafe"](9.80,78.00,10.05,78.25);
      way["amenity"="cafe"](9.80,78.00,10.05,78.25);
      relation["amenity"="cafe"](9.80,78.00,10.05,78.25);
    );
    out center;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

  const res = await fetch(url);
  const data = await res.json();

  cafes = data.elements.map(el => ({
    id: el.id,
    name: el.tags.name || "Unnamed Cafe",
    lat: el.lat || el.center?.lat,
    lon: el.lon || el.center?.lon,
    address: el.tags["addr:street"] || "Madurai",
    rating: Math.random() * 2 + 3, // mock rating between 3.0–5.0
    tags: Object.values(el.tags).slice(0, 3) // show some tags
  }));

  applyFilters();
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function applyFilters(e) {
  if (e) e.preventDefault();
  const search = document.getElementById("search").value.toLowerCase();
  const minRating = parseFloat(document.getElementById("minRating").value);
  const radius = parseFloat(document.getElementById("radius").value);
  const sort = document.getElementById("sort").value;

  let filtered = cafes.filter(c =>
    c.name.toLowerCase().includes(search) ||
    c.address.toLowerCase().includes(search) ||
    c.tags.join(",").toLowerCase().includes(search)
  );

  filtered = filtered.filter(c => c.rating >= minRating);

  if (radius && userLocation) {
    filtered = filtered.filter(c => getDistance(userLocation[0], userLocation[1], c.lat, c.lon) <= radius);
  }

  filtered.forEach(c => {
    if (userLocation) c.distance = getDistance(userLocation[0], userLocation[1], c.lat, c.lon);
    else c.distance = null;
  });

  if (sort === "rating_desc") filtered.sort((a, b) => b.rating - a.rating);
  if (sort === "rating_asc") filtered.sort((a, b) => a.rating - b.rating);
  if (sort === "name_asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "distance_asc") filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
  if (sort === "distance_desc") filtered.sort((a, b) => (b.distance || 0) - (a.distance || 0));

  renderCafes(filtered);
}

function renderCafes(list) {
  cafeLayer.clearLayers();
  const listDiv = document.getElementById("list");
  listDiv.innerHTML = "";

  const tpl = document.getElementById("card-tpl");

  list.forEach(c => {
    if (c.lat && c.lon) {
      const marker = L.marker([c.lat, c.lon]).addTo(cafeLayer).bindPopup(`<b>${c.name}</b><br>${c.address}`);
      const card = tpl.content.cloneNode(true);
      card.querySelector(".name").textContent = c.name;
      card.querySelector(".addr").textContent = c.address;
      card.querySelector(".rating").textContent = `⭐ ${c.rating.toFixed(1)}`;
      card.querySelector(".tags").textContent = c.tags.join(", ");
      if (c.distance) {
        card.querySelector(".distance").textContent = `📍 ${c.distance.toFixed(2)} km`;
      }
      listDiv.appendChild(card);
    }
  });
}

function locateUser() {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    userLocation = [pos.coords.latitude, pos.coords.longitude];
    L.marker(userLocation, { icon: L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png", iconSize: [32, 32] }) })
      .addTo(map)
      .bindPopup("You are here")
      .openPopup();
    map.setView(userLocation, 14);
  });
}

document.getElementById("filters").addEventListener("submit", applyFilters);
document.getElementById("locate").addEventListener("click", locateUser);
document.getElementById("reset").addEventListener("click", () => {
  document.getElementById("filters").reset();
  document.getElementById("search").value = "";
  document.getElementById("minRating").value = 0;
  document.getElementById("minRatingVal").textContent = "0.0";
  document.getElementById("radius").value = "";
  document.getElementById("sort").value = "rating_desc";
  applyFilters();
});
document.getElementById("minRating").addEventListener("input", e => {
  document.getElementById("minRatingVal").textContent = e.target.value;
});

window.onload = initMap;
