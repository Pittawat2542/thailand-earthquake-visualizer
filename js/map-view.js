/**
 * MapView manages the Leaflet interactive map using the Canvas renderer
 * for maximum performance with 200+ markers, theme switching, and bidirectional syncing.
 */

import { MAP_TILES, DEFAULT_CONFIG } from './constants.js';
import { getSeverityByMagnitude, calculatePointRadius, formatBangkokDateTime } from './utils.js';

export class MapView {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = options;
        this.map = null;
        this.tileLayer = null;
        this.markerLayer = null;
        this.highlightLayer = null;
        this.markersMap = new Map();
        this.currentTheme = options.theme || 'dark';
        this.onSelect = options.onSelect || (() => {});
        this.onHover = options.onHover || (() => {});
        this.canvasRenderer = null;
    }

    /**
     * Initializes the Leaflet map.
     */
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Ensure Canvas renderer is used for maximum framerate
        this.canvasRenderer = L.canvas({ padding: 0.5 });

        this.map = L.map(this.containerId, {
            center: DEFAULT_CONFIG.mapCenter,
            zoom: DEFAULT_CONFIG.mapZoom,
            zoomControl: false,
            renderer: this.canvasRenderer,
            preferCanvas: true
        });

        // Add zoom control in top-right
        L.control.zoom({ position: 'topright' }).addTo(this.map);

        // Add OpenStreetMap base tile layer (100% open-source, no API keys)
        const tileConfig = MAP_TILES.osm;
        this.tileLayer = L.tileLayer(tileConfig.url, {
            attribution: tileConfig.attribution,
            maxZoom: tileConfig.maxZoom || 19
        }).addTo(this.map);

        // Create layer groups for markers and highlights
        this.markerLayer = L.layerGroup().addTo(this.map);
        this.highlightLayer = L.layerGroup().addTo(this.map);

        return this;
    }

    /**
     * Handles theme switching (dark/light).
     */
    setTheme(theme) {
        this.currentTheme = theme;
        if (this.currentData) {
            this.renderMarkers(this.currentData, this.selectedId);
        }
    }

    /**
     * Renders circle markers for the filtered dataset.
     */
    renderMarkers(earthquakes, selectedId = null) {
        this.currentData = earthquakes;
        this.selectedId = selectedId;
        if (!this.map) return;

        this.markerLayer.clearLayers();
        this.highlightLayer.clearLayers();
        this.markersMap.clear();

        if (!earthquakes || earthquakes.length === 0) return;

        const isMobile = window.innerWidth < 768;
        const latLngs = [];

        earthquakes.forEach((eq, idx) => {
            const severity = getSeverityByMagnitude(eq.magnitude);
            const radius = calculatePointRadius(eq.magnitude, isMobile);
            const isSelected = selectedId === eq.id;

            const marker = L.circleMarker([eq.latitude, eq.longitude], {
                renderer: this.canvasRenderer,
                radius: isSelected ? radius + 3 : radius,
                fillColor: severity.color,
                color: isSelected ? '#ffffff' : (this.currentTheme === 'dark' ? '#1e293b' : '#ffffff'),
                weight: isSelected ? 3 : 1.5,
                opacity: 1,
                fillOpacity: isSelected ? 0.95 : 0.8
            });

            // Rich popup
            const popupHtml = `
                <div class="map-popup-card">
                    <div class="popup-header">
                        <span class="popup-badge" style="background-color: ${severity.color}">
                            M ${eq.magnitude.toFixed(1)}
                        </span>
                        <span class="popup-time">${formatBangkokDateTime(eq.time, 'dd/MM/yy HH:mm')}</span>
                    </div>
                    <div class="popup-title">${eq.title}</div>
                    <div class="popup-meta">
                        <span>Depth: <strong>${eq.depth} km</strong></span> &bull; 
                        <span>Coords: <strong>${eq.latitude.toFixed(2)}°, ${eq.longitude.toFixed(2)}°</strong></span>
                    </div>
                </div>
            `;
            marker.bindPopup(popupHtml, { className: 'custom-leaflet-popup', offset: [0, -4] });

            marker.on('click', () => {
                this.onSelect(eq);
            });

            marker.on('mouseover', () => {
                this.onHover(eq);
            });

            marker.addTo(this.markerLayer);
            this.markersMap.set(eq.id, marker);
            latLngs.push([eq.latitude, eq.longitude]);

            // Add highlight ring to selected marker or the most recent earthquake if none selected
            if (isSelected) {
                this.drawHighlightRing(eq);
            }
        });

        // Fit map bounds smoothly
        if (latLngs.length > 0) {
            const bounds = L.latLngBounds(latLngs);
            this.map.fitBounds(bounds, {
                padding: [40, 40],
                maxZoom: 8,
                animate: true
            });
        }
    }

    /**
     * Highlights an earthquake marker with an animated pulsing ring.
     */
    drawHighlightRing(eq) {
        if (!this.map || !eq) return;
        this.highlightLayer.clearLayers();

        const severity = getSeverityByMagnitude(eq.magnitude);

        const pulseRing = L.circleMarker([eq.latitude, eq.longitude], {
            radius: calculatePointRadius(eq.magnitude) + 7,
            fillColor: 'transparent',
            color: severity.color,
            weight: 2,
            opacity: 0.9,
            className: 'pulsing-map-ring',
            interactive: false
        });

        pulseRing.addTo(this.highlightLayer);
    }

    /**
     * Selects and centers a marker by ID.
     */
    selectMarker(id) {
        const marker = this.markersMap.get(id);
        if (marker && this.map) {
            const latLng = marker.getLatLng();
            this.map.panTo(latLng, { animate: true, duration: 0.5 });
            marker.openPopup();
        }
    }

    /**
     * Invalidate size to prevent grey tiles after resize.
     */
    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }
}
