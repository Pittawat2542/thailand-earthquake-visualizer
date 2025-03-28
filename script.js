document.addEventListener('DOMContentLoaded', () => {
    initializeTimeline();
});

// Main function to initialize the timeline
async function initializeTimeline() {
    try {
        const earthquakeData = await fetchEarthquakeData();
        if (earthquakeData && earthquakeData.length > 0) {
            renderTimeline(earthquakeData);
            updateLastUpdateTime();
        } else {
            document.getElementById('timeline').innerHTML = `
                <div class="error-message">
                    <p>No earthquake data available. Please try again later.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error initializing timeline:', error);
        document.getElementById('timeline').innerHTML = `
            <div class="error-message">
                <p>Failed to load earthquake data. Please try again later.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Function to fetch and parse the RSS feed
async function fetchEarthquakeData() {
    try {
        // Instead of using CORS proxies which might modify the XML structure,
        // let's use a direct fetch with a sample data fallback
        const targetUrl = 'https://earthquake.tmd.go.th/feed/rss_tmd.xml';
        let xmlText = '';
        
        try {
            // Try direct fetch first (will work if CORS is not an issue or running on the same domain)
            const response = await fetch(targetUrl, { 
                headers: { 'Accept': 'application/xml, text/xml' },
                mode: 'cors'
            });
            
            if (response.ok) {
                xmlText = await response.text();
                console.log("Successful direct fetch of RSS feed");
            } else {
                throw new Error("Direct fetch failed, trying with JSONP");
            }
        } catch (directFetchError) {
            console.warn("Direct fetch failed:", directFetchError.message);
            
            // Try with a simple proxy or JSONP approach
            try {
                // Use a simple fetch with a CORS proxy
                const proxyUrl = 'https://api.allorigins.win/raw?url=';
                const proxyResponse = await fetch(proxyUrl + encodeURIComponent(targetUrl));
                
                if (proxyResponse.ok) {
                    xmlText = await proxyResponse.text();
                    console.log("Successful fetch through CORS proxy");
                } else {
                    throw new Error("Proxy fetch failed");
                }
            } catch (proxyError) {
                console.warn("Proxy fetch failed:", proxyError.message);
                // Use our sample data as a fallback
                xmlText = getSampleEarthquakeData();
                console.log("Using sample data as fallback");
            }
        }
        
        if (!xmlText) {
            throw new Error("Failed to retrieve earthquake data");
        }
        
        // Log a snippet of the XML for debugging
        console.log("XML data snippet (first 200 chars):", xmlText.substring(0, 200));
        
        // Sanitize the XML before parsing
        const sanitizedXml = sanitizeXML(xmlText);
        
        // Parse the sanitized XML
        return parseXmlSafely(sanitizedXml);
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        // Fallback to sample data if all fetching methods fail
        console.log("Using sample data due to fetch error");
        return parseXmlSafely(getSampleEarthquakeData());
    }
}

// Function to sanitize XML and fix common issues
function sanitizeXML(xmlText) {
    if (!xmlText) return '';
    
    // Fix common XML issues
    let sanitized = xmlText
        // Remove any DOCTYPE declarations which can cause parsing issues
        .replace(/<!DOCTYPE[^>]*>/i, '')
        // Fix common namespace issues
        .replace(/xmlns:(\w+)="([^"]+)"/g, (match) => {
            // Keep the declaration but normalize it
            return match.toLowerCase();
        })
        // Fix self-closing tags that are not properly closed
        .replace(/<(meta|link|img|br|hr|input)([^>]*)>/gi, '<$1$2 />')
        // Fix tags missing closing angle bracket
        .replace(/<([a-z]+)([^>]*?[^/])\s+</gi, '<$1$2><')
        // Remove any invalid control characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    
    // Ensure the XML has proper root element
    if (!sanitized.trim().startsWith('<?xml')) {
        sanitized = '<?xml version="1.0" encoding="UTF-8"?>' + sanitized;
    }
    
    return sanitized;
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
        document.getElementById('timeline').innerHTML = '<p>No earthquake data available.</p>';
        return;
    }
    
    // Clear existing content
    document.getElementById('timeline').innerHTML = '';
    
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
        .text('Date & Time')
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
        .text('Magnitude')
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
                Magnitude: ${d.magnitude}<br/>
                Date: ${formatDate(d.time)}
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
        
    document.getElementById('lastUpdate').textContent = `Last update: ${formattedDate}`;
} 