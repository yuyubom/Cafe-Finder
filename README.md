# Cafe Finder ☕

Cafe Finder is a simple Node.js + Express + Leaflet.js web app that helps you discover cafes around your location. It uses a dataset (`db.json`) of cafes and displays them on an interactive OpenStreetMap.

## 🚀 Features

- 📍 Locate yourself on the map (via browser geolocation).
- 🗺️ Interactive map powered by Leaflet.js + OpenStreetMap.
- ☕ Cafe Markers – Displays cafes from a dataset with popup names.
- 📡 API endpoint `/api/cafes` to serve cafe data from `db.json`.
- 🔧 Easily expandable dataset – Add as many cafes as you want in `db.json`.

## 📂 Project Structure

cafe-finder/
├─ server.js # Express backend
├─ db.json # Cafe dataset
├─ public/ # Static frontend files
│ ├─ index.html # Main UI
│ ├─ style.css # Styling
│ └─ script.js # Map + fetch logic
└─ package.json # Project metadata + dependencies
## 🛠️ Installation & Setup

1. Clone this repository
   git clone https://github.com/yourusername/cafe-finder.git
   cd cafe-finder
2. Install dependencies
   npm install
3. Start the server
   npm start
4. Open your browser and visit
   http://localhost:3000

## 📡 API Endpoint

`GET /api/cafes`

Returns the list of cafes in JSON format.

Example response:
[
{ "id": 1, "name": "Cafe Coffee Day - Periyar", "lat": 9.9195, "lng": 78.1193 },
{ "id": 2, "name": "Starbucks - KK Nagar", "lat": 9.9260, "lng": 78.1215 }
]

text

## 🖼️ Screenshots

Homepage displaying the interactive map with cafes indicated by markers.  
User location is highlighted with a custom icon.  
<img width="1892" height="913" alt="image" src="https://github.com/user-attachments/assets/52b98f83-98be-449d-9c9e-411f4785a542" />


## 📌 Future Improvements

- 🔍 Search bar to filter cafes by name.
- 📏 Nearby filter – show cafes within a certain distance from user.
- ⭐ Ratings & Reviews integration.
- 📱 Mobile-friendly UI with enhanced design.

## ⚙️ Tech Stack

- Backend: Node.js, Express
- Frontend: HTML, CSS, JavaScript
- Map: Leaflet.js, OpenStreetMap
- Data: JSON (`db.json`)

## 👨‍💻 Author

Developed by Nirubhama and Sandhiya ✨

