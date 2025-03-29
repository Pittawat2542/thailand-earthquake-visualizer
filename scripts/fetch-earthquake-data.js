// Fetch earthquake data from Thai Meteorological Department and save as CSV
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const { JSDOM } = jsdom;

// URL for the earthquake data webpage
const targetUrl = 'https://earthquake.tmd.go.th/inside.html?ps=200';

// Function to parse a time string to a Date object
function parseTimeString(timeStr) {
    try {
        // Clean up the string and handle various formats
        const cleanedStr = timeStr.replace(/\s+/g, ' ').trim();
        
        // Extract the datetime part
        let dateTimePart = cleanedStr;
        if (cleanedStr.includes('UTC') || cleanedStr.includes('GMT')) {
            dateTimePart = cleanedStr.split(/UTC|GMT/)[0].trim();
        }
        
        // Formats we might encounter:
        // 1. "2025-03-29 05:38:57" (standard ISO-like format)
        // 2. "29/03/2025 05:38:57" (European style date)
        
        let date;
        
        // Check for ISO-like format (YYYY-MM-DD)
        if (/\d{4}-\d{2}-\d{2}/.test(dateTimePart)) {
            date = DateTime.fromFormat(dateTimePart, 'yyyy-MM-dd HH:mm:ss', { zone: 'Asia/Bangkok' }).toJSDate();
        } 
        // Check for European style (DD/MM/YYYY)
        else if (/\d{2}\/\d{2}\/\d{4}/.test(dateTimePart)) {
            date = DateTime.fromFormat(dateTimePart, 'dd/MM/yyyy HH:mm:ss', { zone: 'Asia/Bangkok' }).toJSDate();
        }
        // If we still can't parse, try as a JavaScript date directly (fallback)
        else {
            date = new Date(dateTimePart);
        }
        
        if (isNaN(date.getTime())) {
            console.warn(`Failed to parse date: ${timeStr}`);
            return null;
        }
        
        return date;
    } catch (error) {
        console.error(`Error parsing time string "${timeStr}":`, error);
        return null;
    }
}

// Parse HTML table data to extract earthquake information
function parseHtmlTableData(htmlText) {
    try {
        // Create a DOM parser
        const dom = new JSDOM(htmlText);
        const htmlDoc = dom.window.document;
        
        // Find the main table containing earthquake data
        let tables = htmlDoc.querySelectorAll('table');
        console.log(`Found ${tables.length} tables in the HTML`);
        
        if (!tables || tables.length === 0) {
            console.warn('No tables found in the HTML, trying to parse the body directly');
            
            // Some proxies might change the structure, try to find tables in body
            const bodyContent = htmlDoc.querySelector('body');
            if (bodyContent) {
                // Create a temporary div to parse the potential HTML within the response
                const tempDiv = htmlDoc.createElement('div');
                tempDiv.innerHTML = bodyContent.innerHTML;
                tables = tempDiv.querySelectorAll('table');
                console.log(`Found ${tables.length} tables after body parsing`);
            }
            
            if (!tables || tables.length === 0) {
                throw new Error('No tables found in the HTML response');
            }
        }
        
        // Look for the largest table with earthquake data
        let dataTable = null;
        let mostRows = 0;
        
        for (const table of tables) {
            const rows = table.querySelectorAll('tr');
            if (rows.length > mostRows) {
                // Check if this looks like our earthquake table by sampling some cell content
                const sampleCells = rows.length > 1 ? rows[1].querySelectorAll('td') : [];
                
                // Look for signs of earthquake data in cells (coordinates, magnitude values)
                if (sampleCells.length >= 5) {
                    const cellTexts = Array.from(sampleCells).map(cell => cell.textContent);
                    const hasCoordinates = cellTexts.some(text => 
                        text.includes('°N') || text.includes('°E') || 
                        text.includes('N') || text.includes('E') ||
                        /\d+\.\d+/.test(text)
                    );
                    const hasMagnitude = cellTexts.some(text => /^\s*\d+\.\d+\s*$/.test(text));
                    
                    if (hasCoordinates || hasMagnitude) {
                        dataTable = table;
                        mostRows = rows.length;
                    }
                }
            }
        }
        
        if (!dataTable) {
            console.warn('Could not identify the earthquake data table, trying the largest table');
            
            // Fallback to the largest table
            for (const table of tables) {
                const rows = table.querySelectorAll('tr');
                if (rows.length > mostRows) {
                    dataTable = table;
                    mostRows = rows.length;
                }
            }
            
            if (!dataTable) {
                throw new Error('No suitable table found for earthquake data');
            }
        }
        
        // Extract rows from the data table
        const rows = dataTable.querySelectorAll('tr');
        console.log(`Found ${rows.length} rows in the earthquake table`);
        
        // First find the header row to determine column indices
        let headerRow = rows[0];
        const headerCells = headerRow.querySelectorAll('th');
        
        // Map column indices based on header text
        const columnMap = {
            dateTime: -1,
            magnitude: -1,
            latitude: -1,
            longitude: -1,
            depth: -1,
            phases: -1,
            region: -1
        };
        
        // Extract column indices from header
        for (let i = 0; i < headerCells.length; i++) {
            const headerText = headerCells[i].textContent.toLowerCase();
            
            if (headerText.includes('วัน') || headerText.includes('origin time') || headerText.includes('date')) {
                columnMap.dateTime = i;
            } else if (headerText.includes('magnitude') || headerText.includes('ขนาด')) {
                columnMap.magnitude = i;
            } else if (headerText.includes('latitude')) {
                columnMap.latitude = i;
            } else if (headerText.includes('longitude')) {
                columnMap.longitude = i;
            } else if (headerText.includes('depth') || headerText.includes('ลึก')) {
                columnMap.depth = i;
            } else if (headerText.includes('phases')) {
                columnMap.phases = i;
            } else if (headerText.includes('region') || headerText.includes('บริเวณ') || headerText.includes('ศูนย์กลาง')) {
                columnMap.region = i;
            }
        }
        
        // If we couldn't identify columns by header, use default indices based on TMD website structure
        if (columnMap.dateTime === -1) columnMap.dateTime = 0;
        if (columnMap.magnitude === -1) columnMap.magnitude = 1;
        if (columnMap.latitude === -1) columnMap.latitude = 2;
        if (columnMap.longitude === -1) columnMap.longitude = 3;
        if (columnMap.depth === -1) columnMap.depth = 4;
        if (columnMap.phases === -1) columnMap.phases = 5;
        if (columnMap.region === -1) columnMap.region = 6;
        
        console.log('Column mapping:', columnMap);
        
        const earthquakes = [];
        
        // Process each row (skip header row)
        for (let i = 1; i < rows.length; i++) {
            try {
                const row = rows[i];
                const cells = row.querySelectorAll('td');
                
                if (cells.length < 5) continue; // Skip rows with insufficient cells
                
                // Extract cell data using our column mapping
                const dateTimeCell = columnMap.dateTime >= 0 && cells[columnMap.dateTime] ? 
                    cells[columnMap.dateTime].textContent.trim() : '';
                    
                const magnitudeCell = columnMap.magnitude >= 0 && cells[columnMap.magnitude] ? 
                    cells[columnMap.magnitude].textContent.trim() : '';
                    
                const latitudeCell = columnMap.latitude >= 0 && cells[columnMap.latitude] ? 
                    cells[columnMap.latitude].textContent.trim() : '';
                    
                const longitudeCell = columnMap.longitude >= 0 && cells[columnMap.longitude] ? 
                    cells[columnMap.longitude].textContent.trim() : '';
                    
                const depthCell = columnMap.depth >= 0 && cells[columnMap.depth] ? 
                    cells[columnMap.depth].textContent.trim() : '';
                    
                const locationCell = columnMap.region >= 0 && cells[columnMap.region] ? 
                    cells[columnMap.region].textContent.trim() : '';
                
                // Process the dateTime field (which has Thai and UTC times)
                // Format is typically: 2025-03-29 05:38:57 2025-03-28 22:38:57 UTC
                const dateTimeParts = dateTimeCell.split(/UTC|GMT|\+0700/);
                let thaiDateTime = '';
                
                if (dateTimeParts.length >= 2) {
                    thaiDateTime = dateTimeParts[0].trim();
                } else {
                    thaiDateTime = dateTimeCell;
                }
                
                // If the date format contains two dates (thai/utc), take the first one
                if (thaiDateTime.match(/\d{4}-\d{2}-\d{2}.*\d{4}-\d{2}-\d{2}/)) {
                    thaiDateTime = thaiDateTime.split(/\s+\d{4}-\d{2}-\d{2}/)[0].trim();
                }
                
                // Parse magnitude (look for bold tags or just extract any number)
                let magnitude = NaN;
                const boldMagnitude = magnitudeCell.match(/<strong>([\d.]+)<\/strong>/);
                if (boldMagnitude) {
                    magnitude = parseFloat(boldMagnitude[1]);
                } else {
                    // Extract any number from the text
                    const magMatch = magnitudeCell.match(/(\d+\.\d+)/);
                    magnitude = magMatch ? parseFloat(magMatch[1]) : parseFloat(magnitudeCell.replace(/[^\d.]/g, ''));
                }
                
                // Parse coordinates
                const latitudeMatch = latitudeCell.match(/([\d.]+)°?N?/);
                const latitude = latitudeMatch ? parseFloat(latitudeMatch[1]) : NaN;
                
                const longitudeMatch = longitudeCell.match(/([\d.]+)°?E?/);
                const longitude = longitudeMatch ? parseFloat(longitudeMatch[1]) : NaN;
                
                // Parse depth
                const depthMatch = depthCell.match(/(\d+(?:\.\d+)?)/);
                const depth = depthMatch ? parseFloat(depthMatch[1]) : NaN;
                
                // Get earthquake link from the row's onclick attribute
                let link = '';
                const onclickAttr = row.getAttribute('onclick');
                if (onclickAttr) {
                    // Extract the URL from onclick="window.open('inside-info.html?earthquake=13023')"
                    const match = onclickAttr.match(/window\.open\('([^']+)'\)/);
                    if (match) {
                        link = 'https://earthquake.tmd.go.th/' + match[1];
                    }
                }
                
                // Process time
                const timeObj = parseTimeString(thaiDateTime);
                
                // Create earthquake object if we have valid critical data
                if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(magnitude) && timeObj) {
                    const earthquake = {
                        title: locationCell,
                        link: link,
                        latitude: latitude,
                        longitude: longitude,
                        depth: depth,
                        magnitude: magnitude,
                        time: timeObj,
                        description: locationCell
                    };
                    earthquakes.push(earthquake);
                } else {
                    console.warn('Skipping earthquake with invalid data:', {
                        dateTime: thaiDateTime,
                        magnitude: magnitude,
                        latitude: latitude,
                        longitude: longitude
                    });
                }
            } catch (rowError) {
                console.error('Error parsing table row:', rowError);
            }
        }
        
        if (earthquakes.length === 0) {
            throw new Error('No valid earthquake data was extracted from the table');
        }
        
        return earthquakes.sort((a, b) => b.time - a.time); // Sort by time, newest first
    } catch (error) {
        console.error('Error parsing HTML table data:', error);
        throw error; // Rethrow to handle in the main function
    }
}

// Convert earthquake data to CSV
function convertToCSV(earthquakes) {
    if (!earthquakes || earthquakes.length === 0) {
        throw new Error('No earthquake data to convert to CSV');
    }
    
    // Define CSV headers
    const headers = [
        'title',
        'link',
        'latitude',
        'longitude',
        'depth',
        'magnitude',
        'time',
        'description'
    ];
    
    // Create CSV content with headers
    let csvContent = headers.join(',') + '\n';
    
    // Add each earthquake as a row
    earthquakes.forEach(quake => {
        const formattedTime = quake.time.toISOString();
        
        // Escape any commas or quotes in string fields
        const escapedTitle = `"${quake.title.replace(/"/g, '""')}"`;
        const escapedDescription = `"${quake.description.replace(/"/g, '""')}"`;
        
        const row = [
            escapedTitle,
            quake.link,
            quake.latitude,
            quake.longitude,
            quake.depth,
            quake.magnitude,
            formattedTime,
            escapedDescription
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
}

// Main function to fetch data and save to CSV
async function fetchAndSaveEarthquakeData() {
    console.log('Fetching earthquake data from TMD...');
    console.log(`Current time: ${new Date().toISOString()}`);
    console.log(`Target URL: ${targetUrl}`);
    
    try {
        // Fetch the earthquake data page
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; EarthquakeDataFetcher/1.0; +https://github.com/pittawat)'
            },
            timeout: 30000 // 30 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch earthquake data: ${response.status} ${response.statusText}`);
        }
        
        const htmlText = await response.text();
        console.log(`Received HTML response of length: ${htmlText.length} characters`);
        
        // Parse the HTML to extract earthquake data
        console.log('Parsing HTML data...');
        const earthquakes = parseHtmlTableData(htmlText);
        
        console.log(`Successfully extracted ${earthquakes.length} earthquakes`);
        
        if (earthquakes.length === 0) {
            throw new Error('No earthquake data found in the HTML response');
        }
        
        // Convert to CSV
        console.log('Converting to CSV format...');
        const csvContent = convertToCSV(earthquakes);
        
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Save to CSV file
        const csvFilePath = path.join(dataDir, 'earthquakes.csv');
        fs.writeFileSync(csvFilePath, csvContent);
        
        // Also create a JSON file for easy loading
        const jsonFilePath = path.join(dataDir, 'earthquakes.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(earthquakes, null, 2));
        
        console.log(`Earthquake data saved to ${csvFilePath} and ${jsonFilePath}`);
        
        // Create a simple status file with timestamp for verification
        const statusFilePath = path.join(dataDir, 'last-update.json');
        const updateInfo = {
            lastUpdated: new Date().toISOString(),
            totalEarthquakes: earthquakes.length,
            source: targetUrl
        };
        fs.writeFileSync(statusFilePath, JSON.stringify(updateInfo, null, 2));
        
        console.log('Data update completed successfully');
    } catch (error) {
        console.error('Error fetching and saving earthquake data:', error);
        process.exit(1);
    }
}

// Run the main function
fetchAndSaveEarthquakeData(); 