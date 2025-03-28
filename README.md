# Thai Earthquake Timeline Visualizer

An interactive visualization tool for earthquake data from Thailand and surrounding regions. This application displays earthquake information from the Thai Meteorological Department's website in an easy-to-understand timeline format.

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

## Contributing

Contributions to this project are welcome and appreciated! If you'd like to contribute, here are some ways you can help:

- **Bug Reports**: If you find a bug, please create an issue with detailed steps to reproduce it.
- **Feature Requests**: Have ideas for new features? Open an issue to suggest them.
- **Code Contributions**: Feel free to fork the repository and submit pull requests.
  - Improve the visualization
  - Add new data filters
  - Enhance mobile experience
  - Optimize performance
  - Add new features
- **Documentation**: Help improve or translate the documentation.
- **Translations**: Contribute additional language translations.