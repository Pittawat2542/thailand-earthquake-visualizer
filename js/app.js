/**
 * Application controller for Thailand Earthquake Visualizer.
 * Coordinates DataService, MapView, TimelineView, DetailsView,
 * and handles UI state, localization, and theme management.
 */

import { TRANSLATIONS, DEFAULT_CONFIG, SEVERITY_LEVELS } from './constants.js';
import { DataService } from './data-service.js';
import { MapView } from './map-view.js';
import { TimelineView } from './timeline-view.js';
import { DetailsView } from './details-view.js';
import { formatBangkokDateTime, formatRelativeTime, debounce } from './utils.js';

export class App {
    constructor() {
        this.dataService = new DataService();
        this.mapView = null;
        this.timelineView = null;
        this.detailsView = null;

        // Initialize state from storage or defaults
        const savedLang = localStorage.getItem(DEFAULT_CONFIG.localStorageKeys.lang);
        const savedTheme = localStorage.getItem(DEFAULT_CONFIG.localStorageKeys.theme);
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.state = {
            lang: savedLang === 'en' ? 'en' : 'th',
            theme: savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light'),
            rawData: [],
            filteredData: [],
            selectedEvent: null,
            filters: {
                preset: '30d',
                startDate: null,
                endDate: null,
                location: 'all',
                minMagnitude: 0,
                searchQuery: ''
            }
        };

        this.refreshTimer = null;
    }

    /**
     * Initializes components, loads data, and binds event listeners.
     */
    async init() {
        console.log('[App] Initializing application...');

        // Apply theme immediately to prevent flashing
        this.applyTheme(this.state.theme);

        // Initialize view components
        this.mapView = new MapView('map', {
            theme: this.state.theme,
            onSelect: (eq) => this.selectEvent(eq, 'map'),
            onHover: (eq) => {}
        }).init();

        this.timelineView = new TimelineView('timeline', {
            lang: this.state.lang,
            theme: this.state.theme,
            onSelect: (eq) => this.selectEvent(eq, 'timeline'),
            onHover: (eq) => {}
        }).init();

        this.detailsView = new DetailsView('detailsContent', {
            lang: this.state.lang
        });

        // Bind UI events
        this.bindEvents();

        // Parse any URL search query params
        this.parseUrlParams();

        // Apply localization to static elements
        this.applyLanguage(this.state.lang);

        // Fetch and render initial data
        await this.refreshData();

        // Schedule periodic auto-refresh
        this.refreshTimer = setInterval(() => {
            console.log('[App] Auto-refresh triggering...');
            this.refreshData(false);
        }, DEFAULT_CONFIG.autoRefreshIntervalMs);

        // Keyboard accessibility: Escape clears selection
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.selectEvent(null);
            }
        });

        console.log('[App] Initialization complete.');
    }

    /**
     * Fetches fresh data and refreshes all views.
     */
    async refreshData(showLoading = true) {
        const refreshBtn = document.getElementById('btnRefresh');
        if (refreshBtn) refreshBtn.classList.add('is-spinning');

        try {
            this.state.rawData = await this.dataService.loadData();
            this.populateLocationFilter();
            this.applyFilters(false);
            this.updateHeaderTime();

            // Default select the latest event if none is selected
            if (!this.state.selectedEvent && this.state.filteredData.length > 0) {
                this.selectEvent(this.state.filteredData[0], 'init');
            }
        } catch (err) {
            console.error('[App] Error refreshing data:', err);
        } finally {
            if (refreshBtn) {
                setTimeout(() => refreshBtn.classList.remove('is-spinning'), 600);
            }
        }
    }

    /**
     * Populates the location filter dropdown with dynamic locations.
     */
    populateLocationFilter() {
        const select = document.getElementById('locationFilter');
        if (!select || !this.dataService.uniqueLocations) return;

        // Keep default options (all, myanmar, thailand) and append prominent locations
        const existing = select.querySelectorAll('option');
        if (existing.length <= 3) {
            this.dataService.uniqueLocations.slice(0, 10).forEach(loc => {
                const opt = document.createElement('option');
                opt.value = loc.name;
                opt.textContent = `${loc.name} (${loc.count})`;
                select.appendChild(opt);
            });
        }
    }

    /**
     * Centralized filter dispatcher.
     * Updates dataset, map markers, timeline chart, and statistics.
     */
    applyFilters(updateUrl = true) {
        this.state.filteredData = this.dataService.filterData(this.state.rawData, this.state.filters);
        const selectedId = this.state.selectedEvent ? this.state.selectedEvent.id : null;

        // 1. Update Map (fixes bug where map never updated)
        if (this.mapView) {
            this.mapView.renderMarkers(this.state.filteredData, selectedId);
        }

        // 2. Update Timeline Chart
        if (this.timelineView) {
            this.timelineView.render(this.state.filteredData, selectedId);
        }

        // 3. Update Summary Statistics
        this.updateStatsCards();

        // 4. Check if selected event is still in filtered results
        if (this.state.selectedEvent) {
            const stillVisible = this.state.filteredData.some(eq => eq.id === this.state.selectedEvent.id);
            if (!stillVisible) {
                this.selectEvent(this.state.filteredData[0] || null, 'filter');
            }
        } else if (this.state.filteredData.length > 0) {
            this.selectEvent(this.state.filteredData[0], 'filter');
        } else {
            this.selectEvent(null);
        }

        // 5. Update URL search query params
        if (updateUrl) {
            this.syncUrlParams();
        }
    }

    /**
     * Selects an earthquake event and synchronizes Inspector, Map, and Timeline.
     */
    selectEvent(event, source = 'user') {
        this.state.selectedEvent = event;
        const id = event ? event.id : null;

        // Render Inspector
        if (this.detailsView) {
            this.detailsView.render(event, this.state.lang);
        }

        // Sync Map
        if (this.mapView && source !== 'map' && id) {
            this.mapView.selectMarker(id);
        }

        // Sync Timeline
        if (this.timelineView && source !== 'timeline' && id) {
            this.timelineView.highlightPoint(id);
        }

        // On mobile: scroll to Inspector if user clicked point
        if (window.innerWidth < 768 && source !== 'init' && source !== 'filter' && event) {
            const inspector = document.getElementById('detailsSection');
            if (inspector) {
                inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    /**
     * Updates KPI metrics in the summary cards.
     */
    updateStatsCards() {
        const stats = this.dataService.calculateStats(this.state.filteredData);
        const dict = TRANSLATIONS[this.state.lang];

        // Total count
        const totalEl = document.getElementById('statTotal');
        const subCountEl = document.getElementById('statShowingCount');
        if (totalEl) totalEl.textContent = stats.total;
        if (subCountEl) {
            subCountEl.textContent = dict.statShowingCount
                .replace('{count}', stats.total)
                .replace('{total}', this.state.rawData.length);
        }

        // Max magnitude
        const maxMagEl = document.getElementById('statMaxMag');
        const maxBadgeEl = document.getElementById('statMaxMagBadge');
        if (maxMagEl) {
            maxMagEl.textContent = stats.maxMagnitude > 0 ? `M ${stats.maxMagnitude.toFixed(1)}` : '-';
        }
        if (maxBadgeEl && stats.maxEvent) {
            const sev = SEVERITY_LEVELS.find(l => stats.maxMagnitude >= l.min && stats.maxMagnitude < l.max) || SEVERITY_LEVELS[0];
            maxBadgeEl.textContent = this.state.lang === 'th' ? sev.nameTh : sev.nameEn;
            maxBadgeEl.style.backgroundColor = sev.color;
            maxBadgeEl.style.display = 'inline-block';
        }

        // Most recent
        const recentEl = document.getElementById('statRecent');
        const recentSubEl = document.getElementById('statRecentSub');
        if (recentEl && stats.mostRecent) {
            recentEl.textContent = formatRelativeTime(stats.mostRecent.time, this.state.lang);
        } else if (recentEl) {
            recentEl.textContent = '-';
        }
        if (recentSubEl && stats.mostRecent) {
            recentSubEl.textContent = stats.mostRecent.title.split(' ')[0];
        }

        // Depth range
        const depthEl = document.getElementById('statDepthRange');
        if (depthEl) {
            depthEl.textContent = stats.total > 0 ? `${stats.minDepth} - ${stats.maxDepth} km` : '-';
        }
    }

    /**
     * Updates header status timestamp.
     */
    updateHeaderTime() {
        const lastUpdateEl = document.getElementById('lastUpdate');
        const time = this.dataService.lastUpdated || new Date();
        const formatted = formatBangkokDateTime(time, 'dd MMM yyyy, HH:mm:ss');
        const dict = TRANSLATIONS[this.state.lang];
        if (lastUpdateEl) {
            lastUpdateEl.textContent = `${dict.lastUpdate} ${formatted} (GMT+7)`;
        }
    }

    /**
     * Changes language and updates all UI labels and active views.
     */
    applyLanguage(lang) {
        this.state.lang = lang;
        localStorage.setItem(DEFAULT_CONFIG.localStorageKeys.lang, lang);
        const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

        document.documentElement.lang = lang;

        // Toggle button states
        const btnTh = document.getElementById('langTh');
        const btnEn = document.getElementById('langEn');
        if (btnTh && btnEn) {
            btnTh.classList.toggle('active', lang === 'th');
            btnTh.setAttribute('aria-pressed', lang === 'th');
            btnEn.classList.toggle('active', lang === 'en');
            btnEn.setAttribute('aria-pressed', lang === 'en');
        }

        // Text replacements by data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) {
                el.setAttribute('placeholder', dict[key]);
            }
        });

        // Update active views
        if (this.detailsView) {
            this.detailsView.render(this.state.selectedEvent, lang);
        }
        if (this.timelineView) {
            this.timelineView.currentLang = lang;
            this.timelineView.updateDimensions();
        }
        this.updateStatsCards();
        this.updateHeaderTime();
    }

    /**
     * Toggles between Dark and Light mode.
     */
    applyTheme(theme) {
        this.state.theme = theme;
        localStorage.setItem(DEFAULT_CONFIG.localStorageKeys.theme, theme);
        document.documentElement.setAttribute('data-theme', theme);

        const themeBtn = document.getElementById('btnThemeToggle');
        if (themeBtn) {
            const isDark = theme === 'dark';
            themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            themeBtn.innerHTML = isDark
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
        }

        // Notify map and timeline
        if (this.mapView) {
            this.mapView.setTheme(theme);
        }
        if (this.timelineView) {
            this.timelineView.currentTheme = theme;
        }
    }

    /**
     * Binds UI events.
     */
    bindEvents() {
        // Language switcher
        const btnTh = document.getElementById('langTh');
        const btnEn = document.getElementById('langEn');
        if (btnTh) btnTh.addEventListener('click', () => this.applyLanguage('th'));
        if (btnEn) btnEn.addEventListener('click', () => this.applyLanguage('en'));

        // Theme toggle
        const themeBtn = document.getElementById('btnThemeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.applyTheme(this.state.theme === 'dark' ? 'light' : 'dark');
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('btnRefresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData(true));
        }

        // Date Preset Buttons (24h, 7d, 30d, all)
        const presetButtons = document.querySelectorAll('.preset-btn');
        const customDateInputs = document.getElementById('customDateInputs');

        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                presetButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const preset = btn.getAttribute('data-preset');
                this.state.filters.preset = preset;

                if (customDateInputs) {
                    customDateInputs.style.display = preset === 'custom' ? 'flex' : 'none';
                }

                this.applyFilters();
            });
        });

        // Custom date pickers
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => {
                this.state.filters.preset = 'custom';
                this.state.filters.startDate = startDateInput.value;
                this.applyFilters();
            });
            endDateInput.addEventListener('change', () => {
                this.state.filters.preset = 'custom';
                this.state.filters.endDate = endDateInput.value;
                this.applyFilters();
            });
        }

        // Location dropdown
        const locationSelect = document.getElementById('locationFilter');
        if (locationSelect) {
            locationSelect.addEventListener('change', (e) => {
                this.state.filters.location = e.target.value;
                this.applyFilters();
            });
        }

        // Minimum magnitude dropdown
        const magnitudeSelect = document.getElementById('magnitudeFilter');
        if (magnitudeSelect) {
            magnitudeSelect.addEventListener('change', (e) => {
                this.state.filters.minMagnitude = parseFloat(e.target.value) || 0;
                this.applyFilters();
            });
        }

        // Search text input (debounced 250ms)
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = debounce((val) => {
                this.state.filters.searchQuery = val;
                this.applyFilters();
            }, 250);

            searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
        }

        // Reset filters button
        const resetBtn = document.getElementById('btnResetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }

        // Interactive Magnitude Legend items
        document.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const minMag = parseFloat(item.getAttribute('data-min-mag')) || 0;
                if (magnitudeSelect) {
                    magnitudeSelect.value = minMag.toString();
                }
                this.state.filters.minMagnitude = minMag;
                this.applyFilters();
            });
        });
    }

    /**
     * Resets all filters back to default.
     */
    resetFilters() {
        this.state.filters = {
            preset: '30d',
            startDate: null,
            endDate: null,
            location: 'all',
            minMagnitude: 0,
            searchQuery: ''
        };

        // Reset UI elements
        const locSelect = document.getElementById('locationFilter');
        if (locSelect) locSelect.value = 'all';

        const magSelect = document.getElementById('magnitudeFilter');
        if (magSelect) magSelect.value = '0';

        const search = document.getElementById('searchInput');
        if (search) search.value = '';

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-preset') === '30d');
        });

        const customInputs = document.getElementById('customDateInputs');
        if (customInputs) customInputs.style.display = 'none';

        this.applyFilters();
    }

    /**
     * Parses URL search parameters for deep-linking.
     */
    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('minMag')) {
            const mag = parseFloat(params.get('minMag'));
            if (!isNaN(mag)) this.state.filters.minMagnitude = mag;
        }
        if (params.has('loc')) {
            this.state.filters.location = params.get('loc');
        }
        if (params.has('preset')) {
            this.state.filters.preset = params.get('preset');
        }
        if (params.has('q')) {
            this.state.filters.searchQuery = params.get('q');
        }
    }

    /**
     * Serializes current filters to browser URL without reload.
     */
    syncUrlParams() {
        const params = new URLSearchParams();
        if (this.state.filters.minMagnitude > 0) {
            params.set('minMag', this.state.filters.minMagnitude);
        }
        if (this.state.filters.location !== 'all') {
            params.set('loc', this.state.filters.location);
        }
        if (this.state.filters.preset !== '30d') {
            params.set('preset', this.state.filters.preset);
        }
        if (this.state.filters.searchQuery) {
            params.set('q', this.state.filters.searchQuery);
        }

        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
    }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    window.__EARTHQUAKE_APP__ = app;
});
