// Translation data
const translations = {
    'en': {
        pageTitle: 'Thailand Earthquake Timeline',
        lastUpdate: 'Last update:',
        detailsTitle: 'Earthquake Information',
        noSelection: 'Select an earthquake point to view details',
        labelLocation: 'Location:',
        labelDateTime: 'Date & Time:',
        labelMagnitude: 'Magnitude:',
        labelDepth: 'Depth:',
        labelKm: 'km',
        labelCoordinates: 'Coordinates:',
        labelDescription: 'Description:',
        dataSourceText: 'Data source:',
        xAxisLabel: 'Date & Time',
        yAxisLabel: 'Magnitude',
        noData: 'No earthquake data available.',
        loadingError: 'Failed to load earthquake data. Please try again later.',
        timeFilterLabel: 'Time range:',
        timeFilterRecent: 'Recent events (after Mar 28)',
        timeFilterAll: 'All events',
        eventsShown: 'Showing {count} events'
    },
    'th': {
        pageTitle: 'ข้อมูลแผ่นดินไหวประเทศไทย',
        lastUpdate: 'อัปเดตล่าสุด:',
        detailsTitle: 'ข้อมูลแผ่นดินไหว',
        noSelection: 'เลือกจุดบนไทม์ไลน์เพื่อดูรายละเอียด',
        labelLocation: 'ตำแหน่ง:',
        labelDateTime: 'วันที่และเวลา:',
        labelMagnitude: 'ขนาด:',
        labelDepth: 'ความลึก:',
        labelKm: 'กม.',
        labelCoordinates: 'พิกัด:',
        labelDescription: 'รายละเอียด:',
        dataSourceText: 'แหล่งข้อมูล:',
        xAxisLabel: 'วันที่และเวลา',
        yAxisLabel: 'ขนาด',
        noData: 'ไม่พบข้อมูลแผ่นดินไหว',
        loadingError: 'ไม่สามารถโหลดข้อมูลแผ่นดินไหวได้ กรุณาลองใหม่อีกครั้ง',
        timeFilterLabel: 'ช่วงเวลา:',
        timeFilterRecent: 'เหตุการณ์ล่าสุด (หลังวันที่ 28 มี.ค.)',
        timeFilterAll: 'เหตุการณ์ทั้งหมด',
        eventsShown: 'กำลังแสดง {count} เหตุการณ์'
    }
};

// Current language
let currentLang = localStorage.getItem('earthquakeAppLang') || 'en';

// Current time filter setting
let currentTimeFilter = localStorage.getItem('earthquakeAppTimeFilter') || 'recent';

// Cut-off date for recent events (March 28, 2025)
const RECENT_DATE_CUTOFF = new Date('2025-03-28T00:00:00Z');

// Store all earthquake data
let allEarthquakeData = [];

// DOM Elements for language switching
let langElements;

document.addEventListener('DOMContentLoaded', () => {
    initializeLanguageSwitcher();
    initializeTimeFilter();
    initializeTimeline();
});

// Initialize language switcher
function initializeLanguageSwitcher() {
    // Define elements that need text updates for language change
    langElements = {
        pageTitle: document.getElementById('pageTitle'),
        lastUpdate: document.getElementById('lastUpdate'),
        detailsTitle: document.getElementById('detailsTitle'),
        noSelection: document.getElementById('noSelection'),
        labelLocation: document.getElementById('labelLocation'),
        labelDateTime: document.getElementById('labelDateTime'),
        labelMagnitude: document.getElementById('labelMagnitude'),
        labelDepth: document.getElementById('labelDepth'),
        labelKm: document.getElementById('labelKm'),
        labelCoordinates: document.getElementById('labelCoordinates'),
        labelDescription: document.getElementById('labelDescription'),
        dataSourceText: document.getElementById('dataSourceText'),
        timeFilterLabel: document.getElementById('timeFilterLabel'),
    };
    
    // Set initial language
    applyLanguage(currentLang);
    
    // Add event listeners to language buttons
    document.getElementById('langEn').addEventListener('click', () => {
        setLanguage('en');
    });
    
    document.getElementById('langTh').addEventListener('click', () => {
        setLanguage('th');
    });
    
    // Update button active state
    updateLanguageButtons();
}

// Initialize time filter
function initializeTimeFilter() {
    // Set the filter dropdown to the saved value
    const timeFilterSelect = document.getElementById('timeRangeFilter');
    timeFilterSelect.value = currentTimeFilter;
    
    // Add event listener for filter changes
    timeFilterSelect.addEventListener('change', (event) => {
        currentTimeFilter = event.target.value;
        localStorage.setItem('earthquakeAppTimeFilter', currentTimeFilter);
        
        // Re-render the timeline with the filtered data
        if (allEarthquakeData.length > 0) {
            renderTimeline(getFilteredEarthquakeData());
        }
    });
    
    // Update time filter options text based on language
    updateTimeFilterOptions();
}

// Update time filter dropdown options based on selected language
function updateTimeFilterOptions() {
    const timeFilterSelect = document.getElementById('timeRangeFilter');
    const options = timeFilterSelect.options;
    
    options[0].text = getText('timeFilterRecent');
    options[1].text = getText('timeFilterAll');
}

// Set language and save preference
function setLanguage(lang) {
    if (currentLang === lang) return;
    
    currentLang = lang;
    localStorage.setItem('earthquakeAppLang', lang);
    
    applyLanguage(lang);
    updateLanguageButtons();
    updateTimeFilterOptions();
    
    // Re-render timeline with new language
    if (allEarthquakeData.length > 0) {
        renderTimeline(getFilteredEarthquakeData());
    }
    
    // Update earthquake details if showing
    const detailsContent = document.getElementById('detailsContent');
    if (detailsContent && detailsContent.style.display !== 'none' && detailsContent.__earthquakeData) {
        showEarthquakeDetails(detailsContent.__earthquakeData);
    }
}

// Apply translations to DOM elements
function applyLanguage(lang) {
    const texts = translations[lang];
    
    // Update text for all language elements
    for (const [key, element] of Object.entries(langElements)) {
        if (element && texts[key]) {
            // Special case for lastUpdate that contains dynamic content
            if (key === 'lastUpdate') {
                const timeText = element.textContent.split(': ')[1] || '';
                element.textContent = `${texts[key]} ${timeText}`;
            } else {
                element.textContent = texts[key];
            }
        }
    }
}

// Update language button active states
function updateLanguageButtons() {
    document.getElementById('langEn').classList.toggle('active', currentLang === 'en');
    document.getElementById('langTh').classList.toggle('active', currentLang === 'th');
}

// Get translated text
function getText(key, params = {}) {
    let text = translations[currentLang][key] || translations['en'][key] || key;
    
    // Replace parameter placeholders
    for (const [param, value] of Object.entries(params)) {
        text = text.replace(`{${param}}`, value);
    }
    
    return text;
}

// Get filtered earthquake data based on current filter settings
function getFilteredEarthquakeData() {
    if (currentTimeFilter === 'all' || !allEarthquakeData || allEarthquakeData.length === 0) {
        return allEarthquakeData;
    }
    
    // Filter for recent events (after March 28)
    return allEarthquakeData.filter(eq => eq.time > RECENT_DATE_CUTOFF);
}

// Main function to initialize the timeline
async function initializeTimeline() {
    try {
        allEarthquakeData = await fetchEarthquakeData();
        if (allEarthquakeData && allEarthquakeData.length > 0) {
            // Render the filtered data based on current filter setting
            renderTimeline(getFilteredEarthquakeData());
            updateLastUpdateTime();
        } else {
            document.getElementById('timeline').innerHTML = `
                <div class="error-message">
                    <p>${getText('noData')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error initializing timeline:', error);
        document.getElementById('timeline').innerHTML = `
            <div class="error-message">
                <p>${getText('loadingError')}</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Function to fetch and parse earthquake data
async function fetchEarthquakeData() {
    try {
        // URL for the earthquake data webpage
        const targetUrl = 'https://earthquake.tmd.go.th/inside.html?ps=200';
        let htmlText = '';
        
        try {
            // Try direct fetch first
            const response = await fetch(targetUrl, { 
                headers: { 'Accept': 'text/html' },
                mode: 'cors'
            });
            
            if (response.ok) {
                htmlText = await response.text();
                console.log("Successful direct fetch of earthquake page");
            } else {
                throw new Error("Direct fetch failed, trying with proxy");
            }
        } catch (directFetchError) {
            console.warn("Direct fetch failed:", directFetchError.message);
            
            // Try with a simple proxy approach
            try {
                const proxyUrl = 'https://api.allorigins.win/raw?url=';
                const proxyResponse = await fetch(proxyUrl + encodeURIComponent(targetUrl));
                
                if (proxyResponse.ok) {
                    htmlText = await proxyResponse.text();
                    console.log("Successful fetch through CORS proxy");
                } else {
                    throw new Error("Proxy fetch failed");
                }
            } catch (proxyError) {
                console.warn("Proxy fetch failed:", proxyError.message);
                // Use our sample data as a fallback
                console.log("Using sample data as fallback");
                return parseXmlSafely(getSampleEarthquakeData());
            }
        }
        
        if (!htmlText) {
            throw new Error("Failed to retrieve earthquake data");
        }
        
        // Parse the HTML and extract earthquake data
        return parseHtmlTableData(htmlText);
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        // Fallback to sample data if all fetching methods fail
        console.log("Using sample data due to fetch error");
        return parseXmlSafely(getSampleEarthquakeData());
    }
}

// Function to parse the HTML table and extract earthquake data
function parseHtmlTableData(htmlText) {
    try {
        // Create a DOM parser
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(htmlText, 'text/html');
        
        // Find the main table containing earthquake data
        const tables = htmlDoc.querySelectorAll('table');
        console.log(`Found ${tables.length} tables in the HTML`);
        
        if (!tables || tables.length === 0) {
            console.warn('No tables found in the HTML');
            return [];
        }
        
        // From the example, we know the table structure has columns like:
        // Date/Time | Magnitude | Latitude | Longitude | Depth | Phases | Region
        
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
                    const hasCoordinates = cellTexts.some(text => text.includes('°N') || text.includes('°E'));
                    const hasMagnitude = cellTexts.some(text => /^\s*\d+\.\d+\s*$/.test(text));
                    
                    if (hasCoordinates || hasMagnitude) {
                        dataTable = table;
                        mostRows = rows.length;
                    }
                }
            }
        }
        
        if (!dataTable) {
            console.warn('Could not identify the earthquake data table');
            return [];
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
                    magnitude = parseFloat(magnitudeCell.replace(/[^\d.]/g, ''));
                }
                
                // Parse coordinates
                const latitudeMatch = latitudeCell.match(/([\d.]+)°?N?/);
                const latitude = latitudeMatch ? parseFloat(latitudeMatch[1]) : NaN;
                
                const longitudeMatch = longitudeCell.match(/([\d.]+)°?E?/);
                const longitude = longitudeMatch ? parseFloat(longitudeMatch[1]) : NaN;
                
                // Parse depth
                const depth = parseFloat(depthCell);
                
                // Get earthquake link if available
                let link = '';
                const linkElement = row.querySelector('a');
                if (linkElement && linkElement.href) {
                    link = linkElement.href;
                    // Fix relative URLs
                    if (link.startsWith('./') || link.startsWith('/')) {
                        link = 'https://earthquake.tmd.go.th' + (link.startsWith('/') ? link : link.substring(1));
                    }
                }
                
                // Process time
                const timeObj = parseTimeString(thaiDateTime);
                
                // Log for debugging
                console.log(`Processing: ${thaiDateTime} - Mag: ${magnitude} - Loc: ${locationCell}`);
                
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
                        comments: '',
                        pubDate: new Date(),
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
        
        console.log(`Successfully extracted ${earthquakes.length} earthquakes`);
        
        // Sort by time (newest first) and handle invalid dates
        return earthquakes
            .filter(eq => eq.time && !isNaN(eq.time.getTime()))
            .sort((a, b) => b.time - a.time);
    } catch (error) {
        console.error('Error parsing HTML table:', error);
        return [];
    }
}

// Safe XML parsing with multiple fallback strategies
function parseXmlSafely(xmlText) {
    try {
        // First try using the native DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            console.warn('Native XML parsing error:', parserError.textContent);
            
            // Try an alternative approach - manual extraction
            return extractEarthquakeDataManually(xmlText);
        }
        
        return extractEarthquakeData(xmlDoc);
    } catch (error) {
        console.error('XML parsing error:', error);
        // Fallback to manual extraction if parsing fails
        return extractEarthquakeDataManually(xmlText);
    }
}

// Extract earthquake data from parsed XML document
function extractEarthquakeData(xmlDoc) {
    try {
        // Get all items
        const items = xmlDoc.querySelectorAll('item');
        console.log(`Found ${items.length} earthquake entries`);
        
        if (items.length === 0) {
            console.warn('No items found in the XML');
            return [];
        }
        
        const earthquakes = [];
        
        // Process each item
        for (const item of items) {
            try {
                // Extract basic elements using safe methods
                const title = getElementTextSafely(item, 'title');
                const link = getElementTextSafely(item, 'link');
                const comments = getElementTextSafely(item, 'comments');
                const description = getElementTextSafely(item, 'description');
                const pubDateStr = getElementTextSafely(item, 'pubDate');
                
                // Extract coordinates and earthquake details
                const latitude = getCoordinateValue(item, 'lat');
                const longitude = getCoordinateValue(item, 'long');
                const depth = getNumericValue(item, 'depth');
                const magnitude = getNumericValue(item, 'magnitude');
                const timeStr = getTimeValue(item);
                
                // Process the time
                const timeObj = parseTimeString(timeStr);
                const pubDate = pubDateStr ? new Date(pubDateStr) : null;
                
                // Log the extracted data for debugging
                console.log(`Earthquake - Title: ${title}, Mag: ${magnitude}, Time: ${timeStr}`);
                
                // Create earthquake object only if we have valid critical data
                if (title && !isNaN(latitude) && !isNaN(longitude) && !isNaN(magnitude) && timeObj) {
                    const earthquake = {
                        title: title,
                        link: link,
                        latitude: latitude,
                        longitude: longitude,
                        depth: depth,
                        magnitude: magnitude,
                        time: timeObj,
                        comments: comments,
                        pubDate: pubDate,
                        description: cleanDescription(description)
                    };
                    earthquakes.push(earthquake);
                } else {
                    console.warn('Skipping earthquake with invalid data:', { title, latitude, longitude, magnitude });
                }
            } catch (itemError) {
                console.error('Error parsing earthquake item:', itemError);
            }
        }
        
        // Sort by time (newest first) and handle invalid dates
        return earthquakes
            .filter(eq => eq.time && !isNaN(eq.time.getTime()))
            .sort((a, b) => b.time - a.time);
    } catch (error) {
        console.error('Error extracting earthquake data:', error);
        return [];
    }
}

// Manual extraction for fallback when XML parsing fails
function extractEarthquakeDataManually(xmlText) {
    console.log("Attempting manual extraction from XML text");
    const earthquakes = [];
    
    try {
        // Use regex to find all item blocks
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        let match;
        
        while ((match = itemRegex.exec(xmlText)) !== null) {
            const itemContent = match[1];
            
            try {
                // Extract the required fields using regex
                const title = extractField(itemContent, 'title');
                const link = extractField(itemContent, 'link');
                const latitude = parseFloat(extractField(itemContent, 'geo:lat', 'lat'));
                const longitude = parseFloat(extractField(itemContent, 'geo:long', 'long'));
                const depth = parseFloat(extractField(itemContent, 'tmd:depth', 'depth'));
                const magnitude = parseFloat(extractField(itemContent, 'tmd:magnitude', 'magnitude'));
                const timeStr = extractField(itemContent, 'tmd:time', 'time');
                const comments = extractField(itemContent, 'comments');
                const pubDateStr = extractField(itemContent, 'pubDate');
                const description = extractField(itemContent, 'description');
                
                // Process time
                const timeObj = parseTimeString(timeStr);
                const pubDate = pubDateStr ? new Date(pubDateStr) : null;
                
                // Log extraction
                console.log(`Manual extraction - Title: ${title}, Mag: ${magnitude}`);
                
                // Validate and create earthquake object
                if (title && !isNaN(latitude) && !isNaN(longitude) && !isNaN(magnitude) && timeObj) {
                    earthquakes.push({
                        title: title,
                        link: link,
                        latitude: latitude,
                        longitude: longitude,
                        depth: depth,
                        magnitude: magnitude,
                        time: timeObj,
                        comments: comments,
                        pubDate: pubDate,
                        description: cleanDescription(description)
                    });
                }
            } catch (itemError) {
                console.error("Error extracting item manually:", itemError);
            }
        }
        
        return earthquakes
            .filter(eq => eq.time && !isNaN(eq.time.getTime()))
            .sort((a, b) => b.time - a.time);
    } catch (error) {
        console.error("Manual extraction failed:", error);
        return [];
    }
}

// Helper function to extract field using regex
function extractField(text, ...fieldNames) {
    for (const fieldName of fieldNames) {
        const regex = new RegExp(`<${fieldName}[^>]*>([\\s\\S]*?)<\/${fieldName}>`, 'i');
        const match = text.match(regex);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    return '';
}

// Helper to safely get element text content
function getElementTextSafely(parent, tagName) {
    try {
        const element = parent.querySelector(tagName);
        return element ? element.textContent.trim() : '';
    } catch (e) {
        return '';
    }
}

// Helper to extract coordinate values
function getCoordinateValue(item, coordType) {
    try {
        // Try all possible ways to get the coordinate
        const methods = [
            // Direct namespace lookup
            () => {
                const nsElement = item.getElementsByTagNameNS("http://www.w3.org/2003/01/geo/", coordType)[0];
                return nsElement ? parseFloat(nsElement.textContent) : NaN;
            },
            // Escaped namespace selector
            () => {
                const element = item.querySelector(`geo\\:${coordType}`);
                return element ? parseFloat(element.textContent) : NaN;
            },
            // Simple tag name
            () => {
                const element = item.querySelector(coordType);
                return element ? parseFloat(element.textContent) : NaN;
            },
            // Check all element names for matching text
            () => {
                for (const el of item.querySelectorAll('*')) {
                    if (el.nodeName.toLowerCase().includes(coordType)) {
                        return parseFloat(el.textContent);
                    }
                }
                return NaN;
            }
        ];
        
        // Try each method until we get a valid value
        for (const method of methods) {
            const value = method();
            if (!isNaN(value)) {
                return value;
            }
        }
        
        return NaN;
    } catch (e) {
        console.warn(`Error extracting ${coordType}:`, e);
        return NaN;
    }
}

// Helper to extract numeric values
function getNumericValue(item, valueName) {
    try {
        // Try all possible ways to get the value
        const methods = [
            // Direct namespace lookup
            () => {
                const nsElement = item.getElementsByTagNameNS("http://www.earthquake.tmd.go.th", valueName)[0];
                return nsElement ? parseFloat(nsElement.textContent) : NaN;
            },
            // Escaped namespace selector
            () => {
                const element = item.querySelector(`tmd\\:${valueName}`);
                return element ? parseFloat(element.textContent) : NaN;
            },
            // Simple tag name
            () => {
                const element = item.querySelector(valueName);
                return element ? parseFloat(element.textContent) : NaN;
            },
            // Check all element names for matching text
            () => {
                for (const el of item.querySelectorAll('*')) {
                    if (el.nodeName.toLowerCase().includes(valueName)) {
                        return parseFloat(el.textContent);
                    }
                }
                return NaN;
            }
        ];
        
        // Try each method until we get a valid value
        for (const method of methods) {
            const value = method();
            if (!isNaN(value)) {
                return value;
            }
        }
        
        return NaN;
    } catch (e) {
        console.warn(`Error extracting ${valueName}:`, e);
        return NaN;
    }
}

// Helper to extract time value
function getTimeValue(item) {
    try {
        // Try various methods to get the time
        const methods = [
            // Direct namespace lookup
            () => {
                const timeElement = item.getElementsByTagNameNS("http://www.earthquake.tmd.go.th", 'time')[0];
                return timeElement ? timeElement.textContent.trim() : '';
            },
            // Escaped namespace selector
            () => {
                const timeElement = item.querySelector('tmd\\:time');
                return timeElement ? timeElement.textContent.trim() : '';
            },
            // Simple tag selector
            () => {
                const timeElement = item.querySelector('time');
                return timeElement ? timeElement.textContent.trim() : '';
            },
            // Look for any element with "time" in its name (excluding pubDate)
            () => {
                for (const el of item.querySelectorAll('*')) {
                    const nodeName = el.nodeName.toLowerCase();
                    if (nodeName.includes('time') && !nodeName.includes('pubdate')) {
                        return el.textContent.trim();
                    }
                }
                return '';
            }
        ];
        
        // Try each method until we get a valid value
        for (const method of methods) {
            const value = method();
            if (value) {
                return value;
            }
        }
        
        // If all else fails, try to extract from description
        const description = getElementTextSafely(item, 'description');
        if (description) {
            // Look for date patterns in the description
            const datePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
            const match = description.match(datePattern);
            if (match) {
                return match[0];
            }
        }
        
        return '';
    } catch (e) {
        console.warn('Error extracting time:', e);
        return '';
    }
}

// Helper to parse time strings in various formats
function parseTimeString(timeStr) {
    if (!timeStr) return null;
    
    try {
        // Try direct Date parsing first
        const date = new Date(timeStr);
        if (!isNaN(date.getTime())) {
            return date;
        }
        
        // Try various date formats
        const formats = [
            // ISO format
            /(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/,
            // Thai format
            /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})/
        ];
        
        for (const format of formats) {
            const match = timeStr.match(format);
            if (match) {
                const dateTimeStr = `${match[1]}T${match[2]}Z`;
                const parsedDate = new Date(dateTimeStr);
                if (!isNaN(parsedDate.getTime())) {
                    return parsedDate;
                }
            }
        }
        
        // If all else fails, return current date as fallback
        console.warn('Could not parse time string:', timeStr);
        return new Date();
    } catch (e) {
        console.warn('Error parsing time string:', e);
        return new Date();
    }
}

// Helper function to clean up the description text
function cleanDescription(description) {
    if (!description) return '';
    
    return description
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/<br>/g, ' ')
        .trim();
}

// Provide sample data for fallback
function getSampleEarthquakeData() {
    return `<?xml version="1.0" encoding="utf-8" ?>
<rss version="2.0" xmlns:geo="http://www.w3.org/2003/01/geo/" xmlns:tmd="http://www.earthquake.tmd.go.th">
<channel>
<title>แผ่นดินไหว</title>
<link>https://earthquake.tmd.go.th</link>
<description>กองเฝ้าระวังแผ่นดินไหว</description>

<item>
    <title>ต.ขุนยวม อ.ขุนยวม จ.แม่ฮ่องสอน (Tambon Khun Yuam, Amphoe KhunYuam, MaeHongSon)</title>
    <link>https://earthquake.tmd.go.th/inside-info.html?earthquake=13019</link>
    <geo:lat>18.856</geo:lat>
    <geo:long>97.984</geo:long>
    <tmd:depth>2</tmd:depth>
    <tmd:magnitude>1.5</tmd:magnitude>
    <tmd:time>2025-03-28 22:20:38 UTC</tmd:time>
    <comments></comments>
    <pubDate>Sat, 29 Mar 2025 05:36:46 +0700</pubDate>
    <description><![CDATA[ แผ่นดินไหว ต.ขุนยวม อ.ขุนยวม จ.แม่ฮ่องสอน <br>2025-03-29 05:20:38 น.<br>Lat. 18.856 , Long. 97.984<br>ขนาด 1.5 <br><br> ]]></description>
</item>
<item>
    <title>ประเทศเมียนมา (Myanmar)</title>
    <link>https://earthquake.tmd.go.th/inside-info.html?earthquake=13017</link>
    <geo:lat>18.340</geo:lat>
    <geo:long>96.458</geo:long>
    <tmd:depth>10</tmd:depth>
    <tmd:magnitude>3.1</tmd:magnitude>
    <tmd:time>2025-03-28 22:15:02 UTC</tmd:time>
    <comments>ทางทิศตะวันตกเฉียงเหนือของ อ.แม่สะเรียง จ.แม่ฮ่องสอน ประมาณ 157 กม. </comments>
    <pubDate>Sat, 29 Mar 2025 05:23:18 +0700</pubDate>
    <description><![CDATA[ แผ่นดินไหว ประเทศเมียนมา <br>2025-03-29 05:15:02 น.<br>Lat. 18.340 , Long. 96.458<br>ขนาด 3.1 <br><br> ]]></description>
</item>
</channel>
</rss>`;
}

// Function to render the D3 timeline visualization
function renderTimeline(earthquakeData) {
    if (!earthquakeData || earthquakeData.length === 0) {
        document.getElementById('timeline').innerHTML = `<p>${getText('noData')}</p>`;
        return;
    }
    
    // Store data reference for language switching
    document.getElementById('timeline').__earthquakeData = earthquakeData;
    
    // Clear existing content
    document.getElementById('timeline').innerHTML = '';
    
    // Add event count information
    const countInfo = document.createElement('div');
    countInfo.className = 'event-count-info';
    countInfo.textContent = getText('eventsShown', { count: earthquakeData.length });
    document.getElementById('timeline').appendChild(countInfo);
    
    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = document.getElementById('timeline').clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#timeline')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const timeExtent = d3.extent(earthquakeData, d => d.time);
    const xScale = d3.scaleTime()
        .domain(timeExtent)
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(earthquakeData, d => d.magnitude) + 1])
        .range([height, 0]);
    
    // Add X axis
    svg.append('g')
        .attr('class', 'timeline-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
    
    // Add X axis label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text(getText('xAxisLabel'))
        .attr('fill', '#666');
    
    // Add Y axis
    svg.append('g')
        .attr('class', 'timeline-axis')
        .call(d3.axisLeft(yScale));
    
    // Add Y axis label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .text(getText('yAxisLabel'))
        .attr('fill', '#666');
    
    // Create a tooltip div
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    // Add the earthquake points
    svg.selectAll('.timeline-point')
        .data(earthquakeData)
        .enter()
        .append('circle')
        .attr('class', 'timeline-point')
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(d.magnitude))
        .attr('r', d => 3 + d.magnitude * 2) // Size based on magnitude
        .attr('fill', d => getColorByMagnitude(d.magnitude))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 2);
                
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
                
            tooltip.html(`
                <strong>${d.title}</strong><br/>
                ${getText('labelMagnitude')} ${d.magnitude}<br/>
                ${getText('labelDateTime')} ${formatDate(d.time)}
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 1);
                
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })
        .on('click', function(event, d) {
            showEarthquakeDetails(d);
            
            // Highlight selected point
            d3.selectAll('.timeline-point')
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);
                
            d3.select(this)
                .attr('stroke', '#000')
                .attr('stroke-width', 2);
        });
}

// Function to determine color based on magnitude
function getColorByMagnitude(magnitude) {
    if (magnitude >= 7) return '#d73027'; // Red for severe
    if (magnitude >= 5) return '#fc8d59'; // Orange for strong
    if (magnitude >= 4) return '#fee08b'; // Yellow for moderate
    if (magnitude >= 3) return '#d9ef8b'; // Light green for light
    return '#91cf60'; // Green for minor
}

// Function to display earthquake details
function showEarthquakeDetails(earthquake) {
    const detailsContent = document.getElementById('detailsContent');
    const noSelection = document.querySelector('.no-selection');
    
    // Store data for language switching
    detailsContent.__earthquakeData = earthquake;
    
    // Hide "no selection" message and show details
    noSelection.style.display = 'none';
    detailsContent.style.display = 'block';
    
    // Populate details
    document.getElementById('location').textContent = earthquake.title;
    document.getElementById('datetime').textContent = formatDate(earthquake.time);
    document.getElementById('magnitude').textContent = `${earthquake.magnitude} ML`;
    document.getElementById('depth').textContent = earthquake.depth;
    document.getElementById('coordinates').textContent = `${earthquake.latitude}, ${earthquake.longitude}`;
    document.getElementById('description').textContent = earthquake.comments || earthquake.description;
}

// Helper function to format date
function formatDate(date) {
    if (!date) return 'Unknown';
    
    return luxon.DateTime.fromJSDate(date)
        .setZone('Asia/Bangkok')
        .toFormat('dd MMM yyyy HH:mm:ss');
}

// Function to update the last update time
function updateLastUpdateTime() {
    const now = new Date();
    const formattedDate = luxon.DateTime.fromJSDate(now)
        .setZone('Asia/Bangkok')
        .toFormat('dd MMM yyyy HH:mm:ss');
        
    document.getElementById('lastUpdate').textContent = `${getText('lastUpdate')} ${formattedDate}`;
} 