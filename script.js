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
        timeFilterRecent: 'Recent events (after Mar 28, 2025 12:00:00Z)',
        timeFilterAll: 'All events',
        eventsShown: 'Showing {count} events',
        resetZoom: 'Reset Zoom',
        zoomHint: 'Scroll to zoom, drag to pan'
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
        timeFilterRecent: 'เหตุการณ์ล่าสุด (หลังวันที่ 28 มี.ค. 2568 12:00:00Z)',
        timeFilterAll: 'เหตุการณ์ทั้งหมด',
        eventsShown: 'กำลังแสดง {count} เหตุการณ์',
        resetZoom: 'รีเซ็ตการซูม',
        zoomHint: 'เลื่อนเพื่อซูม, ลากเพื่อเลื่อน'
    }
};

// Current language
let currentLang = localStorage.getItem('earthquakeAppLang') || 'en';

// Current time filter setting
let currentTimeFilter = localStorage.getItem('earthquakeAppTimeFilter') || 'recent';

// Cut-off date for recent events (March 28, 2025)
const RECENT_DATE_CUTOFF = new Date('2025-03-28T12:00:00Z');

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
        sourceCodeText: document.getElementById('sourceCodeText'),
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
                    console.log("Using sample data as fallback");
                    return parseHtmlTableData(getSampleEarthquakeData());
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
                        console.log("Using sample data as fallback");
                        return parseHtmlTableData(getSampleEarthquakeData());
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
        // Fallback to sample data if all fetching methods fail
        console.log("Using sample data due to fetch error");
        return parseHtmlTableData(getSampleEarthquakeData());
    }
}

// Function to parse the HTML table and extract earthquake data
function parseHtmlTableData(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    const rows = Array.from(table.querySelectorAll('tr')).slice(1); // Skip header row

    return rows.map(row => {
        const cells = row.querySelectorAll('td');
        const dateStr = cells[0].textContent.trim();
        const timeStr = cells[1].textContent.trim();
        const latitude = parseFloat(cells[2].textContent.trim());
        const longitude = parseFloat(cells[3].textContent.trim());
        const depth = parseFloat(cells[4].textContent.trim());
        const magnitude = parseFloat(cells[5].textContent.trim());
        const location = cells[6].textContent.trim();

        // Parse date and time
        const [day, month, year] = dateStr.split('/').map(Number);
        const [hour, minute, second] = timeStr.split(':').map(Number);
        
        // Create UTC date
        const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        
        // Convert to Thai time (UTC+7)
        const thaiDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));

        return {
            date: thaiDate,
            latitude,
            longitude,
            depth,
            magnitude,
            location,
            utcDate // Keep original UTC date for reference
        };
    });
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
    // Create a simple HTML table that matches our expected format
    return `
    <html>
    <body>
        <table>
            <tr>
                <th>Origin Time</th>
                <th>Magnitude</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Depth</th>
                <th>Phases</th>
                <th>Region</th>
            </tr>
            <tr>
                <td>2025-03-29 05:20:38 2025-03-28 22:20:38 UTC</td>
                <td>1.5</td>
                <td>18.856°N</td>
                <td>97.984°E</td>
                <td>2</td>
                <td>8</td>
                <td>ต.ขุนยวม อ.ขุนยวม จ.แม่ฮ่องสอน (Tambon Khun Yuam, Amphoe KhunYuam, MaeHongSon)</td>
            </tr>
            <tr>
                <td>2025-03-29 05:15:02 2025-03-28 22:15:02 UTC</td>
                <td>3.1</td>
                <td>18.340°N</td>
                <td>96.458°E</td>
                <td>10</td>
                <td>12</td>
                <td>ประเทศเมียนมา (Myanmar)</td>
            </tr>
        </table>
    </body>
    </html>`;
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
    // Make margins responsive for mobile
    if (window.innerWidth < 768) {
        margin.left = 40;
        margin.right = 20;
    }
    
    const width = document.getElementById('timeline').clientWidth - margin.left - margin.right;
    const height = window.innerWidth < 768 ? 250 - margin.top - margin.bottom : 300 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#timeline')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    
    // Add zoom hint with appropriate icon for device type
    const isMobile = window.innerWidth < 768;
    
    const zoomHint = d3.select('#timeline')
        .append('div')
        .attr('class', 'zoom-hint')
        .html(`
            ${isMobile ? `
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
    const timeExtent = d3.extent(earthquakeData, d => d.date);
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
    const fontSize = window.innerWidth < 768 ? 9 : 10;
    
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => {
            // Format dates for better mobile reading
            if (window.innerWidth < 768) {
                return d3.timeFormat('%d/%m')(d);
            }
            return d3.timeFormat('%d %b')(d);
        });
    
    const yAxis = d3.axisLeft(yScale);
    
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
        .attr("transform", window.innerWidth < 768 ? "rotate(-45)" : "")
        .style("text-anchor", window.innerWidth < 768 ? "end" : "middle");
    
    // Add X axis label
    mainGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + (window.innerWidth < 768 ? 50 : margin.bottom - 10))
        .text(getText('xAxisLabel'))
        .attr('fill', '#666')
        .style('font-size', window.innerWidth < 768 ? '11px' : '12px');
    
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
        .attr('y', -margin.left + (window.innerWidth < 768 ? 10 : 15))
        .attr('x', -height / 2)
        .text(getText('yAxisLabel'))
        .attr('fill', '#666')
        .style('font-size', window.innerWidth < 768 ? '11px' : '12px');
    
    // Create a tooltip div
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    // Function to calculate point radius based on magnitude and screen size
    function calculatePointRadius(magnitude) {
        // Base radius calculation
        let radius = 3 + magnitude * 2;
        
        // Adjust for mobile screens
        if (window.innerWidth < 768) {
            // Make points slightly larger on mobile for better touch targets
            radius = 4 + magnitude * 2.2;
        }
        
        return radius;
    }
    
    // Add the earthquake points to the zoomable group
    const points = zoomGroup.selectAll('.timeline-point')
        .data(earthquakeData)
        .enter()
        .append('circle')
        .attr('class', 'timeline-point')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.magnitude))
        .attr('r', d => calculatePointRadius(d.magnitude)) // Dynamic sizing function
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
                <strong>${d.location}</strong><br/>
                ${getText('labelMagnitude')} ${d.magnitude.toFixed(1)}<br/>
                ${getText('labelDateTime')} ${formatDate(d.date)}
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
                
            // Scroll to the details on mobile
            if (window.innerWidth < 768) {
                const detailsElement = document.querySelector('.earthquake-details');
                if (detailsElement) {
                    setTimeout(() => {
                        detailsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
            }
        });
    
    // Define zoom behavior with different limits for mobile
    const zoom = d3.zoom()
        .scaleExtent([1, window.innerWidth < 768 ? 10 : 20])  // Less zoom on mobile to prevent getting lost
        .extent([[0, 0], [width, height]])
        .on('zoom', zoomed)
        .on('end', zoomEnded);
    
    // Apply zoom behavior to SVG
    svg.call(zoom);
    
    // Function to handle zoom events
    function zoomed(event) {
        // Get the new transform
        const transform = event.transform;
        
        // Calculate new scales
        const newXScale = transform.rescaleX(xScale);
        
        // Update axes with new scales
        xAxisGroup.call(xAxis.scale(newXScale));
        
        // Update points position
        points.attr('cx', d => newXScale(d.date));
        
        // Show reset button when zoomed
        resetButton.style('display', 'block');
    }
    
    // Function triggered when zoom ends
    function zoomEnded(event) {
        // We can add additional behavior on zoom end if needed
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
    const details = document.getElementById('earthquakeDetails');
    const magnitude = earthquake.magnitude;
    const magnitudeClass = magnitude >= 6 ? 'magnitude-high' : 
                          magnitude >= 5 ? 'magnitude-medium' : 'magnitude-low';
    
    // Format dates in Thai timezone
    const thaiDate = luxon.DateTime.fromJSDate(earthquake.date)
        .setZone('Asia/Bangkok')
        .toFormat('dd/MM/yyyy HH:mm:ss');
    
    const utcDate = luxon.DateTime.fromJSDate(earthquake.utcDate)
        .setZone('UTC')
        .toFormat('dd/MM/yyyy HH:mm:ss');

    details.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">${translations[currentLang].date}:</span>
            <span class="detail-value">${thaiDate} (UTC+7)</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">UTC:</span>
            <span class="detail-value">${utcDate}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">${translations[currentLang].magnitude}:</span>
            <span class="detail-value ${magnitudeClass}">${magnitude.toFixed(1)}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">${translations[currentLang].depth}:</span>
            <span class="detail-value">${earthquake.depth} km</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">${translations[currentLang].location}:</span>
            <span class="detail-value">${earthquake.location}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">${translations[currentLang].coordinates}:</span>
            <span class="detail-value">${earthquake.latitude.toFixed(4)}°N, ${earthquake.longitude.toFixed(4)}°E</span>
        </div>
    `;
    details.style.display = 'block';
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
    const now = luxon.DateTime.now().setZone('Asia/Bangkok');
    const lastUpdate = document.getElementById('lastUpdate');
    lastUpdate.textContent = `${translations[currentLang].lastUpdate}: ${now.toFormat('dd/MM/yyyy HH:mm:ss')} (UTC+7)`;
} 