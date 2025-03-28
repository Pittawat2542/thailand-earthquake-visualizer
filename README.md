# Thai Earthquake Timeline Visualizer

An interactive visualization tool for earthquake data from Thailand and surrounding regions. This application displays earthquake information from the Thai Meteorological Department's website in an easy-to-understand timeline format.

## Features

- Interactive timeline visualization of earthquake data
- Zoomable timeline with pan and zoom controls
- Visual zoom hint to guide users on timeline interaction
- Data scraping directly from the Thai Meteorological Department's website
- Visual representation of earthquake magnitude using dot size
- Color-coding of earthquakes based on magnitude
- Time range filtering (recent events or all historical events)
- Detailed information display when selecting an earthquake
- Responsive design for various screen sizes
- Language switching between English and Thai
- Data persistence using local storage for language preference and filter settings

## Technology Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- D3.js (for data visualization and interactive zooming)
- Luxon (for date/time handling)

## How to Use

1. Open `index.html` in a web browser
2. The application will automatically fetch the latest earthquake data
3. By default, only earthquakes after March 28th are displayed
4. Use the time range filter to switch between recent events and all events
5. Hover over dots on the timeline to see basic information
6. Click on a dot to view detailed information about that specific earthquake
7. Use mouse wheel or touchpad to zoom in/out of the timeline
8. Click and drag to pan the timeline when zoomed in
9. Use the "Reset Zoom" button to return to the original view
10. The last update time is displayed at the top of the page
11. Switch between English and Thai using the language selector buttons

## Data Source

The earthquake data is now sourced directly from the Thai Meteorological Department's website:
[https://earthquake.tmd.go.th/inside.html?ps=200](https://earthquake.tmd.go.th/inside.html?ps=200)

This page provides a more comprehensive and up-to-date list of earthquakes than the previously used RSS feed.

## Interactivity

### Timeline Navigation
- **Zoom**: Use mouse wheel/touchpad to zoom in and out of the timeline
- **Pan**: Click and drag horizontally to move through the timeline when zoomed in
- **Reset**: Click the "Reset Zoom" button (appears when zoomed in) to return to the default view
- **Zoom Hint**: A subtle visual cue helps new users discover the zoom functionality

### Data Filtering

- **Recent Events**: By default, only shows earthquakes that occurred after March 28, 2025
- **All Events**: Option to view the complete historical dataset
- The filter preference is saved in localStorage for persistence between sessions

## Data Fetching Approach

The application uses a robust approach to ensure reliable data fetching:

1. Direct HTML scraping: Parses the HTML table from the TMD website
2. CORS proxy fallback: Uses a proxy service if direct access fails
3. Intelligent table detection: Automatically identifies the earthquake data table
4. Data extraction: Extracts and formats data from table cells
5. Comprehensive error handling: Detailed logging and validation at all stages
6. Sample data fallback: Provides demonstration data if live data cannot be accessed

## Example Data Structure

The application extracts data from an HTML table with the following structure:

| Date/Time | Magnitude | Latitude | Longitude | Depth | Phases | Region |
|-----------|-----------|----------|-----------|-------|--------|--------|
| 2025-03-29 05:38:57<br>2025-03-28 22:38:57 UTC | 4.0 | 21.708°N | 96.5°E | 10 | 19 | ประเทศเมียนมา<br>Myanmar |

## Local Development

To run this project locally:

1. Clone the repository
2. Open the project folder in your preferred code editor
3. Use a local development server to serve the files (to avoid CORS issues)
4. Open `index.html` through the local server

Example using Python's built-in HTTP server:
```bash
python -m http.server
```
Then visit `http://localhost:8000` in your browser.

## License

This project is open source and available under the MIT License.

## Repository

The source code is available on GitHub:
[https://github.com/Pittawat2542/thailand-earthquake-visualizer](https://github.com/Pittawat2542/thailand-earthquake-visualizer)

## Notes

- The application handles CORS issues through a reliable proxy service
- Earthquake times are displayed in Thailand's time zone (Asia/Bangkok)
- The visualization works with data scraped directly from the Thai Meteorological Department's website
- Language switching and filter preferences persist between sessions using browser local storage 