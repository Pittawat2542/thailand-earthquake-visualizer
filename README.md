# Thailand Earthquake Visualizer (ระบบติดตามแผ่นดินไหว)

An interactive seismic observatory dashboard and timeline visualization for earthquake data from Thailand and surrounding regions. Data is sourced from the Thai Meteorological Department (TMD).

![Thailand Earthquake Visualizer](public/img/og-image.png)

## Key Features

- **Interactive Seismic Map**: Built with Leaflet and high-performance Canvas rendering for 60fps pan and zoom, colored by Richter magnitude with pulsing epicenter highlights.
- **D3.js Earthquake Timeline**: Smooth pan, zoom, brush, and reference threshold lines with DOM recycling and zero tooltip memory leaks.
- **Bidirectional Map & Timeline Synchronization**: Clicking or hovering on either the map or timeline immediately highlights the event on the other view and populates the inspector.
- **Earthquake Inspector**: Real-time focal depth gauge, Richter magnitude badge, copyable coordinates, Google Maps shortcut, and structured bilingual safety recommendations.
- **Theme Modes**: Seamless Dark Mode and Light Mode switching with matched map tile layers (CartoDB Dark Matter / CartoDB Positron).
- **Comprehensive Filtering**:
  - Quick Date Presets (`24H`, `7D`, `30D`, `All Time`, plus custom date ranges).
  - Dynamic Region & Location filtering.
  - Minimum Magnitude selector (M2.0+, M3.0+, M4.0+, etc.).
  - Free-text search by location name or description.
  - Interactive Richter Scale Legend Bar (click any severity level to filter directly).
- **Bilingual**: Full English and Thai language support with instant switching.
- **Offline & Cache-First Resilience**: Data loads instantly from cached JSON and `localStorage`; never crashes on network failure.
- **Deep-linking**: Filter states serialize to URL query parameters (`?minMag=4&preset=7d&loc=myanmar`) for easy bookmarking and sharing.

## Architecture

The project is structured into clean, modular ES modules:

```
├── index.html                     # Semantic dashboard markup & metadata
├── style.css                      # Modern CSS design system (Dark & Light tokens)
├── script.js                      # Backward-compatible entrypoint
├── js/
│   ├── app.js                     # Main application controller & state store
│   ├── constants.js               # Localization strings, severity levels, map configs
│   ├── data-service.js            # Fetching, caching, filtering, & statistical calculations
│   ├── map-view.js                # Leaflet map management (Canvas renderer)
│   ├── timeline-view.js           # D3 timeline visualization (DOM recycling & tooltip singleton)
│   ├── details-view.js            # Earthquake Inspector card & safety advice
│   └── utils.js                   # Timezone, date formatting, severity math, & DOM helpers
├── data/
│   ├── earthquakes.json           # Cached JSON earthquake data
│   ├── earthquakes.csv            # CSV export of earthquakes
│   └── last-update.json           # Ingestion status and timestamp
├── scripts/
│   └── fetch-earthquake-data.js   # Automated TMD scraper (ES module)
└── tests/
    ├── data-service.test.js       # Unit tests for filtering & statistics
    └── utils.test.js              # Unit tests for timezone, formatting, & math
```

## Local Development

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/Pittawat2542/thailand-earthquake-visualizer.git
   cd thailand-earthquake-visualizer
   ```

2. Start a local server (to allow loading JSON and ES modules):
   ```bash
   npm start
   # or with Python:
   python3 -m http.server 8080
   ```

3. Open `http://localhost:8080` in your web browser.

## Running Tests

Run the automated test suite using Node's native test runner:

```bash
npm test
```

## Data Source

Earthquake data is sourced from the Thai Meteorological Department (TMD):
[https://earthquake.tmd.go.th/inside.html?ps=200](https://earthquake.tmd.go.th/inside.html?ps=200)

Automated updates run periodically via GitHub Actions (`.github/workflows/update-earthquake-data.yml`).

## License

This project is open source and available under the [MIT License](LICENSE).