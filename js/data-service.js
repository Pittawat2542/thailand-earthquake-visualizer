/**
 * DataService handles data fetching, offline caching,
 * data normalization, multi-dimensional filtering, and statistical analysis.
 */

import { DEFAULT_CONFIG } from './constants.js';
import { sanitizeUrl, addSpaceBetweenLanguages, parseDateSafe } from './utils.js';

export class DataService {
    constructor() {
        this.rawData = [];
        this.lastUpdated = null;
        this.sourceUrl = null;
        this.uniqueLocations = [];
    }

    /**
     * Loads earthquake data with cache-first resilience.
     */
    async loadData() {
        let loadedData = null;
        let updateInfo = null;

        // Step 1: Try fetching the local JSON file
        try {
            const [dataRes, updateRes] = await Promise.allSettled([
                fetch('./data/earthquakes.json', { cache: 'no-cache' }),
                fetch('./data/last-update.json', { cache: 'no-cache' })
            ]);

            if (dataRes.status === 'fulfilled' && dataRes.value.ok) {
                loadedData = await dataRes.value.json();
                console.log(`[DataService] Loaded ${loadedData.length} records from earthquakes.json`);
            }

            if (updateRes.status === 'fulfilled' && updateRes.value.ok) {
                updateInfo = await updateRes.value.json();
                this.lastUpdated = parseDateSafe(updateInfo.lastUpdated);
                this.sourceUrl = updateInfo.source;
            }
        } catch (fetchErr) {
            console.warn('[DataService] Local fetch encountered an error:', fetchErr.message);
        }

        // Step 2: Fallback to localStorage cache if network/local file is unavailable
        if (!loadedData || loadedData.length === 0) {
            try {
                const cached = localStorage.getItem(DEFAULT_CONFIG.localStorageKeys.cachedData);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        loadedData = parsed;
                        console.log(`[DataService] Restored ${loadedData.length} records from offline localStorage`);
                    }
                }
            } catch (storageErr) {
                console.warn('[DataService] Could not read from localStorage:', storageErr);
            }
        }

        if (!loadedData || loadedData.length === 0) {
            throw new Error('No earthquake data available locally or in cache');
        }

        // Step 3: Normalize and sanitize records
        this.rawData = this.normalizeRecords(loadedData);

        // Step 4: Extract unique locations for dynamic filter options
        this.uniqueLocations = this.extractUniqueLocations(this.rawData);

        // Step 5: Update localStorage cache in background
        try {
            localStorage.setItem(DEFAULT_CONFIG.localStorageKeys.cachedData, JSON.stringify(this.rawData));
            if (this.lastUpdated) {
                localStorage.setItem(DEFAULT_CONFIG.localStorageKeys.lastCheck, this.lastUpdated.toISOString());
            }
        } catch {
            // Ignore quota errors if storage full
        }

        return this.rawData;
    }

    /**
     * Normalizes raw earthquake objects to ensure consistent types and valid IDs.
     */
    normalizeRecords(records) {
        return records
            .map((item, index) => {
                const time = parseDateSafe(item.time) || new Date();
                const magnitude = parseFloat(item.magnitude) || 0;
                const latitude = parseFloat(item.latitude);
                const longitude = parseFloat(item.longitude);
                const depth = parseFloat(item.depth) || 0;
                const link = sanitizeUrl(item.link || '');
                
                // Derive a stable unique identifier
                let id = item.id;
                if (!id) {
                    const linkMatch = link.match(/\/EQ\d+/i);
                    if (linkMatch) {
                        id = linkMatch[0].replace('/', '');
                    } else {
                        id = `eq_${time.getTime()}_${latitude.toFixed(2)}_${longitude.toFixed(2)}_${index}`;
                    }
                }

                const title = addSpaceBetweenLanguages(item.title || 'Earthquake');

                return {
                    id,
                    title,
                    link,
                    latitude,
                    longitude,
                    depth,
                    magnitude,
                    time,
                    description: item.description || title,
                    timezone: item.timezone || 'Asia/Bangkok'
                };
            })
            .filter(eq => !isNaN(eq.latitude) && !isNaN(eq.longitude) && !isNaN(eq.magnitude))
            .sort((a, b) => b.time.getTime() - a.time.getTime());
    }

    /**
     * Extracts unique, clean location labels from the dataset.
     */
    extractUniqueLocations(records) {
        const counts = new Map();
        
        for (const item of records) {
            const title = item.title.trim();
            // Split if title contains bilingual separator like "พรมแดน... Myanmar..."
            const parts = title.split(/\s{2,}|\s-\s/);
            const primary = parts[0].trim();
            counts.set(primary, (counts.get(primary) || 0) + 1);
        }

        return Array.from(counts.entries())
            .filter(([_, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }));
    }

    /**
     * Filters the dataset based on state criteria.
     */
    filterData(records, filters = {}) {
        const {
            preset = '30d',
            startDate = null,
            endDate = null,
            location = 'all',
            minMagnitude = 0,
            searchQuery = ''
        } = filters;

        const now = new Date();
        const minMag = parseFloat(minMagnitude) || 0;
        const query = searchQuery ? searchQuery.trim().toLowerCase() : '';

        // Calculate time boundary if preset is used
        let startTimeLimit = null;
        if (preset === '24h') {
            startTimeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (preset === '7d') {
            startTimeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (preset === '30d') {
            startTimeLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        return records.filter(item => {
            // Magnitude threshold
            if (minMag > 0 && item.magnitude < minMag) {
                return false;
            }

            // Time filters
            if (preset !== 'all' && preset !== 'custom' && startTimeLimit) {
                if (item.time < startTimeLimit) return false;
            } else if (preset === 'custom') {
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (item.time < start) return false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (item.time > end) return false;
                }
            }

            // Location filter
            if (location && location !== 'all') {
                if (location === 'myanmar') {
                    const isMyanmar = item.title.includes('เมียนมา') || item.title.toLowerCase().includes('myanmar');
                    if (!isMyanmar) return false;
                } else if (location === 'thailand') {
                    const isThailand = item.title.includes('ไทย') || item.title.toLowerCase().includes('thailand') || item.title.includes('พรมแดน');
                    if (!isThailand) return false;
                } else {
                    if (!item.title.toLowerCase().includes(location.toLowerCase())) {
                        return false;
                    }
                }
            }

            // Search query filter
            if (query) {
                const inTitle = item.title.toLowerCase().includes(query);
                const inDesc = item.description ? item.description.toLowerCase().includes(query) : false;
                if (!inTitle && !inDesc) return false;
            }

            return true;
        });
    }

    /**
     * Calculates summary metrics for the given set of earthquakes.
     */
    calculateStats(records) {
        if (!records || records.length === 0) {
            return {
                total: 0,
                maxMagnitude: 0,
                maxEvent: null,
                mostRecent: null,
                minDepth: 0,
                maxDepth: 0,
                regionsCount: 0
            };
        }

        let maxMag = -Infinity;
        let maxEvent = null;
        let minDepth = Infinity;
        let maxDepth = -Infinity;
        const regionsSet = new Set();

        for (const eq of records) {
            if (eq.magnitude > maxMag) {
                maxMag = eq.magnitude;
                maxEvent = eq;
            }
            if (eq.depth < minDepth) minDepth = eq.depth;
            if (eq.depth > maxDepth) maxDepth = eq.depth;
            
            // Extract region rough grouping
            const region = eq.title.split(' ')[0];
            if (region) regionsSet.add(region);
        }

        return {
            total: records.length,
            maxMagnitude: maxMag === -Infinity ? 0 : maxMag,
            maxEvent,
            mostRecent: records[0] || null,
            minDepth: minDepth === Infinity ? 0 : minDepth,
            maxDepth: maxDepth === -Infinity ? 0 : maxDepth,
            regionsCount: regionsSet.size
        };
    }
}
