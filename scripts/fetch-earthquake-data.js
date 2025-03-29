// Fetch earthquake data from Thai Meteorological Department and save as CSV
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const { JSDOM } = jsdom;

// URL for the earthquake data webpage
const targetUrl = 'https://earthquake.tmd.go.th/inside.html?ps=200';

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

// Function to generate a more informative description for each earthquake
function generateEnhancedDescription(earthquake) {
    // Classify magnitude severity
    let magnitudeSeverity;
    let safetyRecommendationsEN;
    let safetyRecommendationsTH;
    
    if (earthquake.magnitude >= 7.0) {
        magnitudeSeverity = 'Major';
        safetyRecommendationsEN = "SEEK SHELTER IMMEDIATELY: Drop, Cover, Hold On. Stay away from windows and exterior walls. If outdoors, stay in open areas away from buildings, trees, and power lines. After shaking stops, evacuate to higher ground if near the coast due to tsunami risk. Expect aftershocks.";
        safetyRecommendationsTH = "หาที่หลบภัยทันที: หมอบ ปกป้อง เกาะยึด อยู่ห่างจากหน้าต่างและผนังด้านนอก หากอยู่นอกอาคาร ให้อยู่ในพื้นที่โล่งห่างจากอาคาร ต้นไม้ และสายไฟ หลังการสั่นไหวหยุดลง ให้อพยพไปยังพื้นที่สูงหากอยู่ใกล้ชายฝั่งเนื่องจากมีความเสี่ยงเรื่องสึนามิ เตรียมรับมือกับแผ่นดินไหวตาม";
    } else if (earthquake.magnitude >= 6.0) {
        magnitudeSeverity = 'Strong';
        safetyRecommendationsEN = "Take immediate protective action: Drop, Cover, Hold On. Stay indoors until shaking stops. Be prepared for power outages and damage to structures. Check for injuries and damage after shaking stops. Listen to authorities for emergency information.";
        safetyRecommendationsTH = "ดำเนินการป้องกันทันที: หมอบ ปกป้อง เกาะยึด อยู่ในอาคารจนกว่าการสั่นไหวจะหยุด เตรียมพร้อมสำหรับไฟฟ้าดับและความเสียหายต่อโครงสร้าง ตรวจสอบการบาดเจ็บและความเสียหายหลังจากการสั่นไหวหยุด ฟังข้อมูลฉุกเฉินจากเจ้าหน้าที่";
    } else if (earthquake.magnitude >= 5.0) {
        magnitudeSeverity = 'Moderate';
        safetyRecommendationsEN = "Take precautions: Stay away from objects that could fall. Expect minor damage to well-built structures. Find safe locations to shelter. Be prepared for aftershocks. Check news sources for updates and instructions.";
        safetyRecommendationsTH = "ใช้ความระมัดระวัง: อยู่ห่างจากวัตถุที่อาจร่วงหล่น คาดการณ์ความเสียหายเล็กน้อยต่ออาคารที่สร้างอย่างดี หาที่หลบภัยที่ปลอดภัย เตรียมพร้อมสำหรับแผ่นดินไหวตาม ติดตามข่าวสารเพื่อรับการอัปเดตและคำแนะนำ";
    } else if (earthquake.magnitude >= 4.0) {
        magnitudeSeverity = 'Light';
        safetyRecommendationsEN = "Stay alert: Be aware of possible light shaking. Secure loose objects that could fall. No immediate action typically needed, but be prepared to take cover if shaking intensifies.";
        safetyRecommendationsTH = "เตรียมพร้อม: ระวังการสั่นไหวเล็กน้อยที่อาจเกิดขึ้น ยึดวัตถุที่อาจร่วงหล่น โดยทั่วไปไม่จำเป็นต้องดำเนินการทันที แต่เตรียมพร้อมที่จะหาที่กำบังหากการสั่นไหวรุนแรงขึ้น";
    } else if (earthquake.magnitude >= 3.0) {
        magnitudeSeverity = 'Minor';
        safetyRecommendationsEN = "No special actions needed: Earthquake likely only felt by sensitive individuals at rest, especially on upper floors of buildings. Be mindful of your surroundings and stay informed.";
        safetyRecommendationsTH = "ไม่จำเป็นต้องดำเนินการพิเศษ: แผ่นดินไหวมักจะรู้สึกได้เฉพาะบุคคลที่ไวต่อความรู้สึกขณะพัก โดยเฉพาะบนชั้นบนของอาคาร ให้ระมัดระวังสิ่งรอบตัวและติดตามข้อมูล";
    } else {
        magnitudeSeverity = 'Micro';
        safetyRecommendationsEN = "No action required: These micro-earthquakes are rarely felt and pose no danger. They are only detectable by seismographs.";
        safetyRecommendationsTH = "ไม่จำเป็นต้องดำเนินการใดๆ: แผ่นดินไหวขนาดเล็กมากเหล่านี้แทบจะไม่รู้สึกและไม่ก่อให้เกิดอันตราย สามารถตรวจพบได้โดยเครื่องวัดแผ่นดินไหวเท่านั้น";
    }
    
    // Format date for reference
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
    });
    
    const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
    });
    
    // Format time for English and Thai dates
    const formattedDate = dateFormatter.format(earthquake.time);
    const thaiFormattedDate = thaiDateFormatter.format(earthquake.time);
    
    // Generate safety recommendation description in both languages
    return `[EN] ${magnitudeSeverity} Earthquake (${earthquake.magnitude.toFixed(1)} ML) - SAFETY ADVICE: ${safetyRecommendationsEN}\n\n[TH] แผ่นดินไหวระดับ${magnitudeSeverity} (${earthquake.magnitude.toFixed(1)} ML) - คำแนะนำความปลอดภัย: ${safetyRecommendationsTH}`;
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
                        title: addSpaceBetweenLanguages(locationCell),
                        link: link,
                        latitude: latitude,
                        longitude: longitude,
                        depth: depth,
                        magnitude: magnitude,
                        time: timeObj,
                        description: addSpaceBetweenLanguages(locationCell) // Default description is the location
                    };
                    
                    // Update with enhanced description
                    earthquake.description = generateEnhancedDescription(earthquake);
                    
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
        'timezone',
        'description'
    ];
    
    // Create CSV content with headers
    let csvContent = headers.join(',') + '\n';
    
    // Add each earthquake as a row
    earthquakes.forEach(quake => {
        // Store the original time in ISO format but add timezone information
        // We need to preserve that this is Bangkok time (GMT+7)
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
            'Asia/Bangkok', // Add timezone information
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
            timeout: 60000 // 60 second timeout
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
        
        // Add timezone information to each earthquake object before saving
        const earthquakesWithTimezone = earthquakes.map(quake => ({
            ...quake,
            timezone: 'Asia/Bangkok', // Add timezone information
            // We need to keep the time as ISO string for proper JSON serialization
            time: quake.time.toISOString()
        }));
        
        fs.writeFileSync(jsonFilePath, JSON.stringify(earthquakesWithTimezone, null, 2));
        
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

function addSpaceBetweenLanguages(text) {
    return text.replace(/([ก-๙])([A-Za-z])/g, '$1 $2')
               .replace(/([A-Za-z])([ก-๙])/g, '$1 $2');
}

// Run the main function
fetchAndSaveEarthquakeData(); 