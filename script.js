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
        sourceCodeText: 'Source code:',
        xAxisLabel: 'Date & Time',
        yAxisLabel: 'Magnitude',
        noData: 'No earthquake data available.',
        loadingError: 'Failed to load earthquake data. Please try again later.',
        timeFilterLabel: 'Time range:',
        timeFilterRecent: 'Recent events (after Mar 28, 2025)',
        timeFilterAll: 'All events',
        eventsShown: 'Showing {count} events',
        resetZoom: 'Reset Zoom',
        zoomHint: 'Scroll to zoom, drag to pan',
        timezoneNote: 'All times shown are in GMT+7 (Thai time)',
        viewDetails: 'View detailed information',
        viewOriginalLink: 'View detailed information',
        locationFilterLabel: 'Location:',
        locationFilterMyanmar: 'Myanmar only',
        locationFilterAll: 'All locations',
        magnitudeFilterLabel: 'Minimum magnitude:',
        magnitudeFilterAll: 'All magnitudes',
        magnitudeFilter3: '≥ 3.0',
        magnitudeFilter4: '≥ 4.0',
        magnitudeFilter5: '≥ 5.0',
        magnitudeFilter6: '≥ 6.0',
        magnitudeSeverityHigh: 'High',
        magnitudeSeverityMedium: 'Medium',
        magnitudeSeverityLow: 'Low',
        chartHeading: 'Earthquake Timeline',
        safetyRecommendationTitle: 'Safety Recommendation',
        severityMajor: 'Major',
        severityStrong: 'Strong',
        severityModerate: 'Moderate',
        severityLight: 'Light',
        severityMinor: 'Minor',
        severityMicro: 'Micro',
        backToTimeline: 'Back to timeline'
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
        sourceCodeText: 'ซอร์สโค้ด:',
        xAxisLabel: 'วันที่และเวลา',
        yAxisLabel: 'ขนาด',
        noData: 'ไม่พบข้อมูลแผ่นดินไหว',
        loadingError: 'ไม่สามารถโหลดข้อมูลแผ่นดินไหวได้ กรุณาลองใหม่อีกครั้ง',
        timeFilterLabel: 'ช่วงเวลา:',
        timeFilterRecent: 'เหตุการณ์ล่าสุด (หลังวันที่ 28 มี.ค. 2568)',
        timeFilterAll: 'เหตุการณ์ทั้งหมด',
        eventsShown: 'กำลังแสดง {count} เหตุการณ์',
        resetZoom: 'รีเซ็ตการซูม',
        zoomHint: 'เลื่อนเพื่อซูม, ลากเพื่อเลื่อน',
        timezoneNote: 'เวลาทั้งหมดแสดงในรูปแบบ GMT+7 (เวลาประเทศไทย)',
        viewDetails: 'ดูรายละเอียดเพิ่มเติม',
        viewOriginalLink: 'ดูรายละเอียดเพิ่มเติม',
        locationFilterLabel: 'ตำแหน่ง:',
        locationFilterMyanmar: 'เฉพาะประเทศเมียนมา',
        locationFilterAll: 'ทุกตำแหน่ง',
        magnitudeFilterLabel: 'ขนาดขั้นต่ำ:',
        magnitudeFilterAll: 'ทุกขนาด',
        magnitudeFilter3: '≥ 3.0',
        magnitudeFilter4: '≥ 4.0',
        magnitudeFilter5: '≥ 5.0',
        magnitudeFilter6: '≥ 6.0',
        magnitudeSeverityHigh: 'สูง',
        magnitudeSeverityMedium: 'ปานกลาง',
        magnitudeSeverityLow: 'ต่ำ',
        chartHeading: 'ไทม์ไลน์แผ่นดินไหว',
        safetyRecommendationTitle: 'คำแนะนำความปลอดภัย',
        severityMajor: 'รุนแรงมาก',
        severityStrong: 'รุนแรง',
        severityModerate: 'ส่งผลกระทบ',
        severityLight: 'ปานกลาง',
        severityMinor: 'เล็กน้อย',
        severityMicro: 'ไม่ส่งผลกระทบ',
        backToTimeline: 'กลับไปยังไทม์ไลน์'
    }
};

// Current language
let currentLang = localStorage.getItem('earthquakeAppLang') || 'th';

// Current time filter setting
let currentTimeFilter = localStorage.getItem('earthquakeAppTimeFilter') || 'recent';

// Current location filter setting
let currentLocationFilter = localStorage.getItem('earthquakeAppLocationFilter') || 'myanmar';

// Current magnitude filter setting
let currentMagnitudeFilter = localStorage.getItem('earthquakeAppMagnitudeFilter') || '0';

// Cut-off date for recent events (March 28, 2025)
const RECENT_DATE_CUTOFF = new Date('2025-03-28T00:00:00Z');

// Store all earthquake data
let allEarthquakeData = [];

// Store all language elements
let langElements = {};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing application');
    
    try {
        // Get saved language or default to 'en'
        const savedLang = localStorage.getItem('earthquakeAppLang');
        console.log('Initial language from localStorage:', savedLang || 'en (default)');
        
        // Initialize language system first
        initializeLanguageSwitcher();
        
        // Initialize other components
        initializeFilters();
        initializeTimeline();
        
        console.log('Application initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Initialize language switcher
function initializeLanguageSwitcher() {
    console.log('Initializing language switcher');
    
    // Define elements that need text updates for language change
    langElements = {
        pageTitle: document.getElementById('pageTitle'),
        lastUpdate: document.getElementById('lastUpdate'),
        timeFilterLabel: document.getElementById('timeFilterLabel'),
        locationFilterLabel: document.getElementById('locationFilterLabel'),
        magnitudeFilterLabel: document.getElementById('magnitudeFilterLabel'),
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
        sourceCodeText: document.getElementById('sourceCodeText'),
        chartHeading: document.getElementById('chart-heading')
    };

    // Set up language buttons
    const langEn = document.getElementById('langEn');
    const langTh = document.getElementById('langTh');
    
    if (!langEn || !langTh) {
        console.error('Language buttons not found in DOM');
        return;
    }
    
    langEn.addEventListener('click', () => {
        console.log('English language button clicked');
        setLanguage('en');
    });
    
    langTh.addEventListener('click', () => {
        console.log('Thai language button clicked');
        setLanguage('th');
    });
    
    // Retrieve the saved language with fallback
    const savedLang = localStorage.getItem('earthquakeAppLang');
    console.log('Language from localStorage:', savedLang);
    
    // Set initial language (default to 'th' if none saved)
    const initialLang = savedLang === 'en' ? 'en' : 'th';
    console.log('Setting initial language to:', initialLang);
    
    // Set the language without checking if it's already set
    currentLang = initialLang; // Force set to ensure consistency
    setLanguage(initialLang, true);
}

// Set language and update all UI elements
function setLanguage(lang, force = false) {
    if (currentLang === lang && !force) {
        console.log(`Language is already set to ${lang}, no change needed`);
        return;
    }
    
    console.log(`Switching language from ${currentLang} to ${lang}`);
    currentLang = lang;
    localStorage.setItem('earthquakeAppLang', lang);
    
    // Apply translations to all static elements
    for (const [key, element] of Object.entries(langElements)) {
        if (element && translations[lang][key]) {
            element.textContent = translations[lang][key];
            console.log(`Updated ${key} to: ${translations[lang][key]}`);
        } else if (element) {
            console.warn(`Missing translation for ${key} in ${lang}`);
        } else {
            console.warn(`Element not found for ${key}`);
        }
    }
    
    // Update filter options
    updateFilterOptions();
    
    // Update UI state
    updateLanguageButtons();
    
    // Update dynamic elements that may have been created after initialization
    updateDynamicElements();
    
    // Re-render timeline with new language
    if (allEarthquakeData && allEarthquakeData.length > 0) {
        renderTimeline(getFilteredEarthquakeData());
    }
    
    // Update earthquake details if showing
    const detailsContent = document.getElementById('detailsContent');
    if (detailsContent && detailsContent.style.display !== 'none' && detailsContent.__earthquakeData) {
        // Re-render the current earthquake details with the new language
        showEarthquakeDetails(detailsContent.__earthquakeData);
    }
    
    // Update last update time
    updateLastUpdateTime();
}

// Update language button states
function updateLanguageButtons() {
    const enButton = document.getElementById('langEn');
    const thButton = document.getElementById('langTh');
    
    if (enButton && thButton) {
        // Remove active class from all language buttons
        enButton.classList.remove('active');
        thButton.classList.remove('active');
        
        // Set aria-pressed to false for all buttons
        enButton.setAttribute('aria-pressed', 'false');
        thButton.setAttribute('aria-pressed', 'false');
        
        // Add active class and set aria-pressed for the current language
        if (currentLang === 'en') {
            enButton.classList.add('active');
            enButton.setAttribute('aria-pressed', 'true');
        } else if (currentLang === 'th') {
            thButton.classList.add('active');
            thButton.setAttribute('aria-pressed', 'true');
        }
        
        console.log(`Updated language buttons: EN=${enButton.classList.contains('active')}, TH=${thButton.classList.contains('active')}`);
    } else {
        console.warn('Language buttons not found');
    }
}

// Get translated text with fallback
function getText(key, params = {}) {
    // Make sure we have valid language data
    if (!translations[currentLang]) {
        console.warn(`Missing language: ${currentLang}, falling back to English`);
        currentLang = 'en'; // Reset to English if missing
    }
    
    // Get the text from the current language or fall back to English
    let text = translations[currentLang][key];
    
    // If not found in current language, try English
    if (!text && currentLang !== 'en') {
        console.warn(`Missing translation for key "${key}" in language "${currentLang}", using English`);
        text = translations['en'][key];
    }
    
    // If still not found, use the key itself
    if (!text) {
        console.warn(`Missing translation for key "${key}" in all languages`);
        return key;
    }
    
    // Replace parameter placeholders
    if (params && Object.keys(params).length > 0) {
        for (const [param, value] of Object.entries(params)) {
            text = text.replace(`{${param}}`, value);
        }
    }
    
    return text;
}

// Initialize filters
function initializeFilters() {
    // Set the filter dropdowns to the saved values
    const timeFilterSelect = document.getElementById('timeRangeFilter');
    const locationFilterSelect = document.getElementById('locationFilter');
    const magnitudeFilterSelect = document.getElementById('magnitudeFilter');
    
    timeFilterSelect.value = currentTimeFilter;
    locationFilterSelect.value = currentLocationFilter;
    magnitudeFilterSelect.value = currentMagnitudeFilter;
    
    // Add event listeners for filter changes
    timeFilterSelect.addEventListener('change', (event) => {
        currentTimeFilter = event.target.value;
        localStorage.setItem('earthquakeAppTimeFilter', currentTimeFilter);
        updateTimeline();
    });
    
    locationFilterSelect.addEventListener('change', (event) => {
        currentLocationFilter = event.target.value;
        localStorage.setItem('earthquakeAppLocationFilter', currentLocationFilter);
        updateTimeline();
    });
    
    magnitudeFilterSelect.addEventListener('change', (event) => {
        currentMagnitudeFilter = event.target.value;
        localStorage.setItem('earthquakeAppMagnitudeFilter', currentMagnitudeFilter);
        updateTimeline();
    });
    
    // Update filter options text based on language
    updateFilterOptions();
}

// Update filter dropdown options based on selected language
function updateFilterOptions() {
    const timeFilterSelect = document.getElementById('timeRangeFilter');
    const locationFilterSelect = document.getElementById('locationFilter');
    const magnitudeFilterSelect = document.getElementById('magnitudeFilter');
    
    timeFilterSelect.options[0].text = getText('timeFilterRecent');
    timeFilterSelect.options[1].text = getText('timeFilterAll');
    
    locationFilterSelect.options[0].text = getText('locationFilterMyanmar');
    locationFilterSelect.options[1].text = getText('locationFilterAll');
    
    magnitudeFilterSelect.options[0].text = getText('magnitudeFilterAll');
    magnitudeFilterSelect.options[1].text = getText('magnitudeFilter3');
    magnitudeFilterSelect.options[2].text = getText('magnitudeFilter4');
    magnitudeFilterSelect.options[3].text = getText('magnitudeFilter5');
    magnitudeFilterSelect.options[4].text = getText('magnitudeFilter6');
}

// Get filtered earthquake data based on current filter settings
function getFilteredEarthquakeData() {
    let filteredData = allEarthquakeData;
    
    // Apply time filter
    if (currentTimeFilter === 'recent') {
        filteredData = filteredData.filter(eq => eq.time > RECENT_DATE_CUTOFF);
    }
    
    // Apply location filter
    if (currentLocationFilter === 'myanmar') {
        filteredData = filteredData.filter(eq => 
            eq.title.includes('ประเทศเมียนมา') || eq.title.includes('Myanmar')
        );
    }
    
    // Apply magnitude filter
    const minMagnitude = parseFloat(currentMagnitudeFilter);
    if (minMagnitude > 0) {
        filteredData = filteredData.filter(eq => eq.magnitude >= minMagnitude);
    }
    
    return filteredData;
}

// Main function to initialize the timeline
async function initializeTimeline() {
    try {
        // Show loading spinner
        document.getElementById('timeline').innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
            </div>
        `;
        
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
        console.log("Attempting to load local earthquake data first...");
        
        // Try to load the data from the local JSON file first
        try {
            const response = await fetch('./data/earthquakes.json');
            
            if (response.ok) {
                const earthquakeData = await response.json();
                console.log(`Successfully loaded ${earthquakeData.length} earthquakes from local data`);
                
                // Convert the time strings back to Date objects with proper timezone handling
                earthquakeData.forEach(quake => {
                    // Check if the timezone field exists (for backward compatibility)
                    if (quake.timezone && quake.timezone === 'Asia/Bangkok') {
                        // Parse the time string
                        // The JSON now contains the correct UTC timestamp, so we can just parse it directly
                        quake.time = new Date(quake.time);
                    } else {
                        // Fallback for data without timezone information
                        quake.time = new Date(quake.time);
                    }
                });
                
                // Check the last update time to ensure data is not too old
                try {
                    const lastUpdateResponse = await fetch('./data/last-update.json');
                    if (lastUpdateResponse.ok) {
                        const lastUpdate = await lastUpdateResponse.json();
                        const lastUpdateTime = new Date(lastUpdate.lastUpdated);
                        const currentTime = new Date();
                        const hoursSinceUpdate = (currentTime - lastUpdateTime) / (1000 * 60 * 60);
                        
                        console.log(`Data last updated ${hoursSinceUpdate.toFixed(1)} hours ago`);
                        
                        // If data is less than 24 hours old, use it
                        if (hoursSinceUpdate < 24) {
                            return earthquakeData;
                        } else {
                            console.log("Local data is more than 24 hours old, fetching fresh data...");
                        }
                    }
                } catch (updateCheckError) {
                    console.warn('Error checking last update time:', updateCheckError);
                    // If we can't check last update time but have data, use it anyway
                    return earthquakeData;
                }
            }
        } catch (localDataError) {
            console.warn('Could not load local earthquake data:', localDataError.message);
        }
        
        // If we get here, either the local data doesn't exist, is too old, or there was an error
        // Fallback to fetching from the TMD website directly
        console.log("Fetching earthquake data directly from source...");
        
        // URL for the earthquake data webpage
        const targetUrl = 'https://earthquake.tmd.go.th/inside.html?ps=200';
        let htmlText = '';
        
        // Check if we're running on GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        // If on GitHub Pages, always use the proxy to avoid CORS issues
        if (isGitHubPages) {
            console.log("Running on GitHub Pages, using CORS proxy by default");
            try {
                const proxyUrl = 'https://corsproxy.io/?';
                const proxyResponse = await fetch(proxyUrl + encodeURIComponent(targetUrl));
                
                if (proxyResponse.ok) {
                    htmlText = await proxyResponse.text();
                    console.log("Successful fetch through CORS proxy");
                } else {
                    throw new Error("First proxy failed, trying alternative");
                }
            } catch (primaryProxyError) {
                console.warn("Primary proxy failed:", primaryProxyError.message);
                
                // Try alternative proxy
                try {
                    const backupProxyUrl = 'https://api.allorigins.win/raw?url=';
                    const backupResponse = await fetch(backupProxyUrl + encodeURIComponent(targetUrl));
                    
                    if (backupResponse.ok) {
                        htmlText = await backupResponse.text();
                        console.log("Successful fetch through backup CORS proxy");
                    } else {
                        throw new Error("All proxies failed");
                    }
                } catch (backupError) {
                    console.error("All proxy attempts failed:", backupError.message);
                    throw new Error("Failed to fetch earthquake data from any source");
                }
            }
        } else {
            // Not on GitHub Pages, try direct fetch first
            try {
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
                
                // Try with a proxy approach
                try {
                    const proxyUrl = 'https://corsproxy.io/?';
                    const proxyResponse = await fetch(proxyUrl + encodeURIComponent(targetUrl));
                    
                    if (proxyResponse.ok) {
                        htmlText = await proxyResponse.text();
                        console.log("Successful fetch through CORS proxy");
                    } else {
                        throw new Error("First proxy failed, trying alternative");
                    }
                } catch (primaryProxyError) {
                    console.warn("Primary proxy failed:", primaryProxyError.message);
                    
                    // Try alternative proxy
                    try {
                        const backupProxyUrl = 'https://api.allorigins.win/raw?url=';
                        const backupResponse = await fetch(backupProxyUrl + encodeURIComponent(targetUrl));
                        
                        if (backupResponse.ok) {
                            htmlText = await backupResponse.text();
                            console.log("Successful fetch through backup CORS proxy");
                        } else {
                            throw new Error("All proxies failed");
                        }
                    } catch (backupError) {
                        console.error("All proxy attempts failed:", backupError.message);
                        throw new Error("Failed to fetch earthquake data from any source");
                    }
                }
            }
        }
        
        if (!htmlText) {
            throw new Error("Failed to retrieve earthquake data");
        }
        
        // Parse the HTML and extract earthquake data
        return parseHtmlTableData(htmlText);
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        
        // Display an error to the user instead of using sample data
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p>${getText('loadingError')}</p>
            <p>Error: ${error.message}</p>
        `;
        document.getElementById('timeline').innerHTML = '';
        document.getElementById('timeline').appendChild(errorDiv);
        
        return [];
    }
}

// Function to parse the HTML table and extract earthquake data
function parseHtmlTableData(htmlText) {
    try {
        // Create a DOM parser
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(htmlText, 'text/html');
        
        // Find the main table containing earthquake data
        let tables = htmlDoc.querySelectorAll('table');
        console.log(`Found ${tables.length} tables in the HTML`);
        
        if (!tables || tables.length === 0) {
            console.warn('No tables found in the HTML, trying to parse the body directly');
            
            // Some proxies might change the structure, try to find tables in body
            const bodyContent = htmlDoc.querySelector('body');
            if (bodyContent) {
                // Create a temporary div to parse the potential HTML within the response
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = bodyContent.innerHTML;
                tables = tempDiv.querySelectorAll('table');
                console.log(`Found ${tables.length} tables after body parsing`);
            }
            
            if (!tables || tables.length === 0) {
                return [];
            }
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
                console.error('No suitable table found');
                return [];
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
                
                // Log for debugging
                console.log(`Processing: ${thaiDateTime} - Mag: ${magnitude} - Loc: ${locationCell}`);
                
                // Create earthquake object if we have valid critical data
                if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(magnitude) && timeObj) {
                    const earthquake = {
                        title: addSpaceBetweenLanguages(locationCell),
                        link: link,
                        latitude: latitude,
                        longitude: longitude,
                        depth: depth,
                        magnitude: magnitude,
                        time: timeObj,
                        comments: '',
                        pubDate: new Date(),
                        description: addSpaceBetweenLanguages(locationCell)
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

// Helper to parse time strings in various formats
function parseTimeString(timeStr) {
    if (!timeStr) return null;
    
    try {
        // Handle the case where we have both Thai time and UTC time without separator
        // Format: "2025-03-05 18:33:062025-03-05 11:33:06"
        const match = timeStr.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
        if (match) {
            // The first match is Thai time (GMT+7)
            const thaiDate = new Date(match[1]);
            if (!isNaN(thaiDate.getTime())) {
                return thaiDate;
            }
        }
        
        // Try direct Date parsing as fallback
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

// Detect if using a touch device
const isTouchDevice = () => {
    return ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0) || 
        (navigator.msMaxTouchPoints > 0);
};

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
    countInfo.id = 'eventCountInfo';  // Add ID for easier reference
    countInfo.textContent = getText('eventsShown', { count: earthquakeData.length });
    document.getElementById('timeline').appendChild(countInfo);
    
    // Add timezone information
    const timezoneInfo = document.createElement('div');
    timezoneInfo.className = 'timezone-info';
    timezoneInfo.id = 'timezoneInfo';  // Add ID for easier reference
    timezoneInfo.textContent = getText('timezoneNote');
    document.getElementById('timeline').appendChild(timezoneInfo);
    
    // Set up dimensions with better mobile sizing
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const isMobile = window.innerWidth < 768;
    
    // Make margins responsive for mobile
    if (isMobile) {
        margin.left = 45;
        margin.right = 15;
        margin.bottom = 45;
    }
    
    const width = document.getElementById('timeline').clientWidth - margin.left - margin.right;
    const height = isMobile ? 260 - margin.top - margin.bottom : 300 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#timeline')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('aria-labelledby', 'chart-heading')
        .style('touch-action', 'none'); // Prevent default touch actions for better zooming
    
    // Add appropriate message for device type
    const isTouch = isTouchDevice();
    
    const zoomHint = d3.select('#timeline')
        .append('div')
        .attr('class', 'zoom-hint')
        .html(`
            ${isTouch ? `
                <svg class="touch-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v7.5"></path>
                    <path d="M13 15.5v-3.24"></path>
                    <path d="M9 15.5v-3.24"></path>
                    <path d="M9 11.24c0 3.76 4 4.26 4 8.26"></path>
                </svg>
            ` : `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
            `}
            ${getText('zoomHint')}
        `);
    
    // Fade out the zoom hint after 5 seconds
    setTimeout(() => {
        zoomHint.classed('fade-out', true);
    }, 5000);
    
    // Add reset zoom button
    const resetButton = d3.select('#timeline')
        .append('button')
        .attr('class', 'reset-zoom-btn')
        .attr('aria-label', getText('resetZoom'))
        .text(getText('resetZoom'))
        .style('display', 'none')
        .on('click', resetZoom);
    
    // Add a clip path to ensure points stay within the chart area during zoom
    svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0);
    
    // Create main group for chart elements and apply margin transform
    const mainGroup = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const timeExtent = d3.extent(earthquakeData, d => d.time);
    // Add a small buffer to the time domain to avoid points at the edge
    const timeRange = timeExtent[1] - timeExtent[0];
    const bufferTime = timeRange * 0.05;
    const xScale = d3.scaleTime()
        .domain([
            new Date(timeExtent[0].getTime() - bufferTime),
            new Date(timeExtent[1].getTime() + bufferTime)
        ])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(earthquakeData, d => d.magnitude) + 1])
        .range([height, 0]);
    
    // Store the original scales for reset
    const xScaleOriginal = xScale.copy();
    const yScaleOriginal = yScale.copy();
    
    // Create axes with responsive font size
    const fontSize = isMobile ? 9 : 10;
    
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => {
            const date = luxon.DateTime.fromJSDate(d);
            return date.toFormat(isMobile ? 'dd/MM HH:mm' : 'dd/MM/yyyy HH:mm');
        })
        .ticks(isMobile ? 4 : 6); // Fewer ticks on mobile
    
    const yAxis = d3.axisLeft(yScale)
        .ticks(isMobile ? 5 : 8); // Fewer ticks on mobile
    
    // Create a group for zoom
    const zoomGroup = mainGroup.append('g')
        .attr('class', 'zoom-group')
        .attr('clip-path', 'url(#clip)');
    
    // Add X axis
    const xAxisGroup = mainGroup.append('g')
        .attr('class', 'timeline-axis x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);
    
    xAxisGroup.selectAll("text")
        .style("font-size", `${fontSize}px`)
        .attr("transform", isMobile ? "rotate(-45)" : "")
        .style("text-anchor", isMobile ? "end" : "middle")
        .attr("dx", isMobile ? "-0.5em" : "0")
        .attr("dy", isMobile ? "0.5em" : "0.7em");
    
    // Add X axis label
    mainGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + (isMobile ? 40 : margin.bottom - 10))
        .text(getText('xAxisLabel'))
        .attr('fill', '#666')
        .style('font-size', isMobile ? '10px' : '12px');
    
    // Add Y axis
    const yAxisGroup = mainGroup.append('g')
        .attr('class', 'timeline-axis y-axis')
        .call(yAxis);
    
    yAxisGroup.selectAll("text")
        .style("font-size", `${fontSize}px`);
    
    // Add Y axis label
    mainGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + (isMobile ? 15 : 15))
        .attr('x', -height / 2)
        .text(getText('yAxisLabel'))
        .attr('fill', '#666')
        .style('font-size', isMobile ? '10px' : '12px');
    
    // Create a tooltip div
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    // Function to calculate point radius based on magnitude and screen size
    function calculatePointRadius(magnitude) {
        // Base radius calculation
        let radius = 3 + magnitude * 1.8;
        
        // Adjust for mobile screens - larger touch targets
        if (isMobile) {
            radius = 4 + magnitude * 2;
            
            // Ensure minimum size for touch
            if (radius < 6) radius = 6;
        }
        
        return radius;
    }
    
    // Add the earthquake points to the zoomable group
    const points = zoomGroup.selectAll('.timeline-point')
        .data(earthquakeData)
        .enter()
        .append('circle')
        .attr('class', 'timeline-point')
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(d.magnitude))
        .attr('r', d => calculatePointRadius(d.magnitude))
        .attr('fill', d => getColorByMagnitude(d.magnitude))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('role', 'button')
        .attr('tabindex', 0) // Make focusable
        .attr('aria-label', d => `${d.title}, magnitude ${d.magnitude}, ${formatDate(d.time)}`)
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
            if (!d3.select(this).classed('selected')) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('stroke-width', 1);
            }
                
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
                .attr('stroke-width', 1)
                .classed('selected', false);
                
            d3.select(this)
                .attr('stroke', '#000')
                .attr('stroke-width', 2)
                .classed('selected', true);
                
            // Mobile-specific: scroll to details card
            if (isMobile) {
                const detailsElement = document.querySelector('.details-card');
                if (detailsElement) {
                    setTimeout(() => {
                        detailsElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start'
                        });
                    }, 300);
                }
            }
        })
        // Make keyboard accessible
        .on('keydown', function(event, d) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                d3.select(this).dispatch('click');
            }
        });
    
    // Define zoom behavior with touch-friendly settings
    const zoom = d3.zoom()
        .scaleExtent([1, isMobile ? 8 : 20])  // Less zoom on mobile to prevent getting lost
        .extent([[0, 0], [width, height]])
        .on('zoom', zoomed)
        .on('end', zoomEnded);
    
    // Apply zoom behavior to SVG
    svg.call(zoom)
        .on("dblclick.zoom", null); // Disable double-click zoom for better mobile experience
    
    // Function to handle zoom events
    function zoomed(event) {
        // Get the new transform
        const transform = event.transform;
        
        // Calculate new scales
        const newXScale = transform.rescaleX(xScale);
        
        // Update axes with new scales
        xAxisGroup.call(xAxis.scale(newXScale));
        
        // Update points position
        points.attr('cx', d => newXScale(d.time));
        
        // Show reset button when zoomed
        resetButton.style('display', 'block');
    }
    
    // Function triggered when zoom ends
    function zoomEnded(event) {
        if (event.transform.k === 1) {
            resetButton.style('display', 'none');
        }
    }
    
    // Function to reset zoom
    function resetZoom() {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
        
        resetButton.style('display', 'none');
    }
    
    // Initial fade-in animation for better UX
    points
        .attr('opacity', 0)
        .transition()
        .delay((d, i) => i * 10)
        .duration(500)
        .attr('opacity', 1);
        
    // Add touch feedback for mobile devices
    if (isTouch) {
        // Create a touch feedback marker
        const touchFeedback = mainGroup.append('circle')
            .attr('class', 'touch-feedback')
            .attr('r', 20)
            .attr('fill', 'rgba(26, 86, 219, 0.2)')
            .attr('stroke', 'rgba(26, 86, 219, 0.5)')
            .attr('stroke-width', 2)
            .style('opacity', 0)
            .style('pointer-events', 'none');
            
        // Add touch start event to show feedback
        svg.on('touchstart', function(event) {
            const touch = event.touches[0];
            const coords = d3.pointer(touch, mainGroup.node());
            
            touchFeedback
                .attr('cx', coords[0])
                .attr('cy', coords[1])
                .style('opacity', 0.8)
                .transition()
                .duration(500)
                .style('opacity', 0);
        });
    }
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
    currentEarthquake = earthquake;
    detailsContent.__earthquakeData = earthquake;
    
    // Hide "no selection" message and show details
    if (noSelection) noSelection.style.display = 'none';
    detailsContent.style.display = 'grid';
    
    // Clear previous content
    detailsContent.innerHTML = '';
    
    // Create detail items
    const locationItem = createDetailItem('labelLocation', earthquake.title);
    const datetimeItem = createDetailItem('labelDateTime', formatDate(earthquake.time));
    
    // Magnitude with appropriate class
    const magnitudeItem = createDetailItem('labelMagnitude', earthquake.magnitude);
    const magnitudeSpan = magnitudeItem.querySelector('span');
    
    let severityClass;
    let severityText;
    
    if (parseFloat(earthquake.magnitude) >= 7.0) {
        severityClass = 'magnitude-high';
        severityText = getText('magnitudeSeverityHigh');
    } else if (parseFloat(earthquake.magnitude) >= 5.0) {
        severityClass = 'magnitude-medium';
        severityText = getText('magnitudeSeverityMedium');
    } else {
        severityClass = 'magnitude-low';
        severityText = getText('magnitudeSeverityLow');
    }
    
    magnitudeSpan.className = severityClass;
    
    // Add severity label
    const severityLabel = document.createElement('span');
    severityLabel.className = 'severity-label';
    severityLabel.textContent = severityText;
    magnitudeSpan.appendChild(severityLabel);
    
    const depthItem = createDetailItem('labelDepth', `${earthquake.depth} ${getText('labelKm')}`);
    const coordinatesItem = createDetailItem('labelCoordinates', `${earthquake.latitude.toFixed(4)}°N, ${earthquake.longitude.toFixed(4)}°E`);
    
    // Process the description (which contains safety recommendations)
    const descriptionText = earthquake.description || '';
    
    // Create description item wrapper
    const descriptionItem = document.createElement('div');
    descriptionItem.className = 'detail-item safety-recommendations';
    
    const descriptionLabel = document.createElement('strong');
    descriptionLabel.id = 'labelDescription';
    descriptionLabel.textContent = getText('labelDescription');
    descriptionItem.appendChild(descriptionLabel);
    
    // Check if the description has safety recommendations format with [EN] and [TH] tags
    if (descriptionText.includes('[EN]') && descriptionText.includes('[TH]')) {
        // Split the text to get English and Thai parts
        const englishMatch = descriptionText.match(/\[EN\](.*?)(?=\[TH\]|\s*$)/s);
        const thaiMatch = descriptionText.match(/\[TH\](.*?)(?=\s*$)/s);
        
        if (englishMatch && thaiMatch) {
            const englishPart = englishMatch[1].trim();
            const thaiPart = thaiMatch[1].trim();
            
            // Get the appropriate content based on current language
            const content = currentLang === 'en' ? englishPart : thaiPart;
            
            // Extract earthquake type and severity level
            let severityLevel = null;
            let severityTranslationKey = null;
            
            // First determine severity based on magnitude
            const magnitudeValue = parseFloat(earthquake.magnitude);
            if (magnitudeValue >= 7.0) {
                severityLevel = "Major";
                severityTranslationKey = "severityMajor";
            } else if (magnitudeValue >= 6.0) {
                severityLevel = "Strong";
                severityTranslationKey = "severityStrong";
            } else if (magnitudeValue >= 5.0) {
                severityLevel = "Moderate";
                severityTranslationKey = "severityModerate";
            } else if (magnitudeValue >= 4.0) {
                severityLevel = "Light";
                severityTranslationKey = "severityLight";
            } else if (magnitudeValue >= 3.0) {
                severityLevel = "Minor";
                severityTranslationKey = "severityMinor";
            } else {
                severityLevel = "Micro";
                severityTranslationKey = "severityMicro";
            }
            
            // Instead of overriding magnitude-based classification, we'll only use the text-based
            // classification if it's consistent with the magnitude range
            let textBasedSeverity = "";
            let textBasedSeverityKey = "";
            
            if (content.includes("Major") || content.includes("รุนแรงมาก")) {
                textBasedSeverity = "Major";
                textBasedSeverityKey = "severityMajor";
            } else if (content.includes("Strong") || content.includes("รุนแรง")) {
                textBasedSeverity = "Strong";
                textBasedSeverityKey = "severityStrong";
            } else if (content.includes("Moderate") || content.includes("ส่งผลกระทบ")) {
                textBasedSeverity = "Moderate";
                textBasedSeverityKey = "severityModerate";
            } else if (content.includes("Light") || content.includes("ปานกลาง")) {
                textBasedSeverity = "Light";
                textBasedSeverityKey = "severityLight";
            } else if (content.includes("Minor") || content.includes("เล็กน้อย")) {
                textBasedSeverity = "Minor";
                textBasedSeverityKey = "severityMinor";
            } else if (content.includes("Micro") || content.includes("ไม่ส่งผลกระทบ")) {
                textBasedSeverity = "Micro";
                textBasedSeverityKey = "severityMicro";
            }
            
            // Only use text-based classification if it's reasonable for the magnitude
            // For debugging
            console.log(`Magnitude: ${magnitudeValue}, Magnitude-based: ${severityLevel}, Text-based: ${textBasedSeverity}`);
            
            // Some special handling to avoid misclassification
            if (textBasedSeverity === "Light" && magnitudeValue >= 5.0) {
                // Don't downgrade higher magnitudes to Light based on text
                console.log("Preventing downgrade of magnitude >= 5.0 to Light");
            } else if (textBasedSeverity === "Strong" && magnitudeValue < 4.5) {
                // Don't upgrade lower magnitudes to Strong based on text
                console.log("Preventing upgrade of magnitude < 4.5 to Strong");
            } else if (textBasedSeverity) {
                // In other cases where the text-based classification seems reasonable, use it
                severityLevel = textBasedSeverity;
                severityTranslationKey = textBasedSeverityKey;
            }
            
            // Create recommendation container
            const recommendationContainer = document.createElement('div');
            recommendationContainer.className = 'safety-recommendation';
            recommendationContainer.setAttribute('data-severity', severityLevel);

            // Create the title with icon
            const titleElement = document.createElement('div');
            titleElement.className = 'safety-recommendation-title';
            titleElement.textContent = getText('safetyRecommendationTitle');
            recommendationContainer.appendChild(titleElement);
            
            // Add severity badge with translated text
            const severityBadge = document.createElement('div');
            severityBadge.className = 'safety-badge';
            severityBadge.textContent = getText(severityTranslationKey);
            recommendationContainer.appendChild(severityBadge);
            
            // Format the content for better readability
            const contentElement = document.createElement('div');
            contentElement.className = 'safety-recommendation-content';
            
            // Process content to make it more readable
            // First, try to extract the actual safety advice part
            let cleanContent = content;
            
            // Look for patterns like "SAFETY ADVICE:" or "คำแนะนำความปลอดภัย:" and extract what follows
            const adviceMatch = content.match(/(?:SAFETY ADVICE:|คำแนะนำความปลอดภัย:)\s*(.*)/s);
            if (adviceMatch && adviceMatch[1]) {
                cleanContent = adviceMatch[1].trim();
            }
            
            // Split by semicolons, colons, or periods for better formatting
            const sentences = cleanContent.split(/[.:;]\s+/);
            
            if (sentences.length > 1) {
                // Format as paragraphs for better readability
                for (const sentence of sentences) {
                    if (sentence.trim().length > 0) {
                        const paragraph = document.createElement('p');
                        paragraph.textContent = sentence.trim() + '.';
                        contentElement.appendChild(paragraph);
                    }
                }
            } else {
                // Single sentence, just add as paragraph
                const paragraph = document.createElement('p');
                paragraph.textContent = cleanContent;
                contentElement.appendChild(paragraph);
            }
            
            recommendationContainer.appendChild(contentElement);
            
            // Add the recommendation to the description item
            descriptionItem.appendChild(recommendationContainer);
        } else {
            // Fallback if the format is unexpected
            const valueSpan = document.createElement('span');
            // Only show content in current language if possible
            if (currentLang === 'en' && englishMatch) {
                valueSpan.textContent = englishMatch[1].trim();
            } else if (currentLang === 'th' && thaiMatch) {
                valueSpan.textContent = thaiMatch[1].trim();
            } else {
                valueSpan.textContent = descriptionText;
            }
            descriptionItem.appendChild(valueSpan);
        }
    } else {
        // For backwards compatibility with older description format
        const valueSpan = document.createElement('span');
        valueSpan.textContent = descriptionText || '-';
        descriptionItem.appendChild(valueSpan);
    }
    
    // Add all items to the details content
    detailsContent.appendChild(locationItem);
    detailsContent.appendChild(datetimeItem);
    detailsContent.appendChild(magnitudeItem);
    detailsContent.appendChild(depthItem);
    detailsContent.appendChild(coordinatesItem);
    detailsContent.appendChild(descriptionItem);
    
    // Add link to detailed information if available
    if (earthquake.link) {
        const linkContainer = document.createElement('div');
        linkContainer.className = 'detail-link-container';
        linkContainer.innerHTML = `
            <a href="${earthquake.link}" target="_blank" rel="noopener noreferrer" class="detail-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                ${getText('viewOriginalLink')}
            </a>
        `;
        detailsContent.appendChild(linkContainer);
    }
    
    // Mobile-specific UI enhancement
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        // Add a "back to map" button for mobile users
        const backButton = document.createElement('button');
        backButton.className = 'mobile-back-button';
        backButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            ${getText('backToTimeline')}
        `;
        backButton.addEventListener('click', function() {
            // Scroll back to the visualization
            const vizElement = document.querySelector('.visualization-card');
            if (vizElement) {
                vizElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
            }
        });
        
        // Insert back button at the top
        detailsContent.insertBefore(backButton, detailsContent.firstChild);
        
        // Add some spacing for better mobile layout
        const mobileSpacer = document.createElement('div');
        mobileSpacer.className = 'mobile-spacer';
        detailsContent.appendChild(mobileSpacer);
    }
    
    // Fade in animation for the entire details section
    detailsContent.style.opacity = 0;
    setTimeout(() => {
        detailsContent.style.transition = 'opacity 0.3s ease';
        detailsContent.style.opacity = 1;
    }, 50);
}

// Helper function to create detail items
function createDetailItem(labelKey, value) {
    const item = document.createElement('div');
    item.className = 'detail-item';
    
    const label = document.createElement('strong');
    label.id = labelKey;
    label.textContent = getText(labelKey);
    
    const valueSpan = document.createElement('span');
    valueSpan.textContent = value;
    
    item.appendChild(label);
    item.appendChild(valueSpan);
    
    return item;
}

// Helper function to format date
function formatDate(date) {
    return luxon.DateTime.fromJSDate(date)
        .setZone('Asia/Bangkok')
        .toFormat('dd/MM/yyyy HH:mm');
}

// Function to update the last update time
function updateLastUpdateTime() {
    const now = new Date();
    const formattedDate = luxon.DateTime.fromJSDate(now)
        .setZone('Asia/Bangkok')
        .toFormat('dd MMM yyyy HH:mm:ss');
        
    document.getElementById('lastUpdate').textContent = `${getText('lastUpdate')} ${formattedDate}`;
}

// Update timeline with current filters
function updateTimeline() {
    if (allEarthquakeData && allEarthquakeData.length > 0) {
        renderTimeline(getFilteredEarthquakeData());
    }
}

// Update any dynamic elements that need translations
function updateDynamicElements() {
    // Update timezone info if it exists
    const timezoneInfo = document.getElementById('timezoneInfo');
    if (timezoneInfo) {
        timezoneInfo.textContent = getText('timezoneNote');
    }
    
    // Update event count if it exists
    const eventCountInfo = document.getElementById('eventCountInfo');
    if (eventCountInfo && document.getElementById('timeline').__earthquakeData) {
        const count = document.getElementById('timeline').__earthquakeData.length;
        eventCountInfo.textContent = getText('eventsShown', { count });
    }
    
    // Update zoom hint text if it exists
    const zoomHint = document.querySelector('.zoom-hint');
    if (zoomHint) {
        // Preserve the SVG icon if it exists
        const icon = zoomHint.querySelector('svg');
        const iconHTML = icon ? icon.outerHTML : '';
        zoomHint.innerHTML = `${iconHTML} ${getText('zoomHint')}`;
    }
    
    // Update reset zoom button if it exists
    const resetButton = document.querySelector('.reset-zoom-btn');
    if (resetButton) {
        resetButton.textContent = getText('resetZoom');
    }
} 

function addSpaceBetweenLanguages(text) {
    return text.replace(/([ก-๙])([A-Za-z])/g, '$1 $2')
               .replace(/([A-Za-z])([ก-๙])/g, '$1 $2');
}