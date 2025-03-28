# Thai Earthquake Timeline Visualizer

An interactive visualization tool for earthquake data from Thailand and surrounding regions. This application displays earthquake information from the Thai Meteorological Department's RSS feed in an easy-to-understand timeline format.

## Features

- Interactive timeline visualization of earthquake data
- Real-time data fetching from the Thai Meteorological Department's RSS feed
- Visual representation of earthquake magnitude using dot size
- Color-coding of earthquakes based on magnitude
- Detailed information display when selecting an earthquake
- Responsive design for various screen sizes
- Robust XML parsing tailored specifically for the Thai Meteorological Department's RSS feed format

## Technology Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- D3.js (for data visualization)
- Luxon (for date/time handling)

## How to Use

1. Open `index.html` in a web browser
2. The application will automatically fetch the latest earthquake data
3. Hover over dots on the timeline to see basic information
4. Click on a dot to view detailed information about that specific earthquake
5. The last update time is displayed at the top of the page

## Data Source

The earthquake data is sourced from the Thai Meteorological Department's RSS feed:
[https://earthquake.tmd.go.th/feed/rss_tmd.xml](https://earthquake.tmd.go.th/feed/rss_tmd.xml)

## Data Fetching Approach

The application uses a robust approach to ensure reliable data fetching:

1. Multiple CORS proxies: Tries several CORS proxies in case one fails
2. Direct XML parsing: Custom parsing logic specifically tailored for the TMD RSS format
3. Multiple fallback methods: Uses several approaches to extract namespaced elements
4. Comprehensive error handling: Detailed logging and validation at all stages
5. Data validation: Ensures all earthquake data is valid before displaying

## Example RSS Data Structure

```xml
<item>
    <title>ประเทศเมียนมา (Myanmar)</title>
    <link>https://earthquake.tmd.go.th/inside-info.html?earthquake=13017</link>
    <geo:lat>18.340</geo:lat>
    <geo:long>96.458</geo:long>
    <tmd:depth>10</tmd:depth>
    <tmd:magnitude>3.1</tmd:magnitude>
    <tmd:time>2025-03-28 22:15:02 UTC</tmd:time>
    <comments>ทางทิศตะวันตกเฉียงเหนือของ อ.แม่สะเรียง จ.แม่ฮ่องสอน ประมาณ 157 กม.</comments>
    <pubDate>Sat, 29 Mar 2025 05:23:18 +0700</pubDate>
    <description>
        <![CDATA[ แผ่นดินไหว ประเทศเมียนมา <br>2025-03-29 05:15:02 น.<br>Lat. 18.340 , Long. 96.458<br>ขนาด 3.1 <br><br> ]]>
    </description>
</item>
```

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

## Notes

- The application handles CORS issues through multiple reliable proxy services
- Earthquake times are displayed in Thailand's time zone (Asia/Bangkok)
- The visualization is specifically designed to work with the Thailand Meteorological Department's RSS feed structure 