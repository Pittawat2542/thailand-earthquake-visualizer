/**
 * DetailsView renders the Earthquake Inspector card, providing
 * depth gauges, severity badges, copyable coordinates, and structured safety advice.
 */

import { TRANSLATIONS } from './constants.js';
import {
    getSeverityByMagnitude,
    getDepthClassification,
    formatBangkokDateTime,
    formatUtcDateTime
} from './utils.js';

export class DetailsView {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = options;
        this.currentLang = options.lang || 'en';
        this.currentEarthquake = null;
    }

    /**
     * Renders or updates the details card.
     */
    render(earthquake = null, lang = this.currentLang) {
        this.currentLang = lang;
        this.currentEarthquake = earthquake;
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;

        if (!earthquake) {
            container.innerHTML = `
                <div class="inspector-empty-state">
                    <div class="empty-icon-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="empty-title">${dict.detailsTitle}</div>
                    <p class="empty-desc">${dict.noSelectionPrompt}</p>
                </div>
            `;
            return;
        }

        const severity = getSeverityByMagnitude(earthquake.magnitude);
        const depthInfo = getDepthClassification(earthquake.depth, this.currentLang);
        const bangkokTime = formatBangkokDateTime(earthquake.time, 'dd MMM yyyy, HH:mm:ss');
        const utcTime = formatUtcDateTime(earthquake.time);
        const coordString = `${earthquake.latitude.toFixed(4)}°N, ${earthquake.longitude.toFixed(4)}°E`;
        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${earthquake.latitude},${earthquake.longitude}`;

        // Extract safety guidance
        let safetyText = this.currentLang === 'th' ? severity.adviceTh : severity.adviceEn;
        if (earthquake.description) {
            if (this.currentLang === 'th' && earthquake.description.includes('[TH]')) {
                const match = earthquake.description.match(/\[TH\](.*?)(?=\[EN\]|$)/s);
                if (match) safetyText = match[1].replace(/คำแนะนำความปลอดภัย:/, '').trim();
            } else if (this.currentLang === 'en' && earthquake.description.includes('[EN]')) {
                const match = earthquake.description.match(/\[EN\](.*?)(?=\[TH\]|$)/s);
                if (match) safetyText = match[1].replace(/SAFETY ADVICE:/, '').trim();
            }
        }

        container.innerHTML = `
            <div class="inspector-card">
                <div class="inspector-header">
                    <div class="magnitude-gauge" style="border-color: ${severity.borderColor}; background: ${severity.bgColor}">
                        <div class="mag-val" style="color: ${severity.color}">M ${earthquake.magnitude.toFixed(1)}</div>
                        <div class="mag-class" style="background-color: ${severity.color}">
                            ${this.currentLang === 'th' ? severity.nameTh : severity.nameEn}
                        </div>
                    </div>
                    <div class="inspector-headline">
                        <div class="inspector-badge">${dict.detailsTitle}</div>
                        <h3 class="inspector-location">${earthquake.title}</h3>
                        <div class="inspector-time-primary">${bangkokTime} (GMT+7)</div>
                    </div>
                </div>

                <div class="inspector-grid">
                    <div class="grid-cell">
                        <span class="cell-label">${dict.labelDepth}</span>
                        <div class="cell-value-group">
                            <span class="cell-val">${earthquake.depth} ${dict.labelKm}</span>
                            <span class="depth-badge" style="color: ${depthInfo.color}">${depthInfo.label}</span>
                        </div>
                    </div>

                    <div class="grid-cell">
                        <span class="cell-label">${dict.labelCoordinates}</span>
                        <div class="cell-value-group">
                            <span class="cell-val coords-val">${coordString}</span>
                            <button class="btn-copy-coords" id="btnCopyCoords" title="${dict.copyCoordinates}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                <span>${dict.copyCoordinates}</span>
                            </button>
                        </div>
                    </div>

                    <div class="grid-cell">
                        <span class="cell-label">${dict.labelDateTimeUtc}</span>
                        <span class="cell-val utc-val">${utcTime}</span>
                    </div>

                    <div class="grid-cell external-links-cell">
                        <span class="cell-label">Quick Links</span>
                        <div class="external-links">
                            <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="ext-btn gmaps-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                ${dict.viewOnGoogleMaps}
                            </a>
                            ${earthquake.link ? `
                                <a href="${earthquake.link}" target="_blank" rel="noopener noreferrer" class="ext-btn tmd-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    ${dict.viewTmdReport}
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="safety-advisory-box" style="border-left: 4px solid ${severity.color}; background: ${severity.bgColor}">
                    <div class="advisory-title" style="color: ${severity.color}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <span>${dict.labelSafetyAdvice} &bull; ${this.currentLang === 'th' ? severity.nameTh : severity.nameEn}</span>
                    </div>
                    <p class="advisory-content">${safetyText}</p>
                </div>
            </div>
        `;

        // Wire copy coordinates button
        const copyBtn = document.getElementById('btnCopyCoords');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(coordString).then(() => {
                    const span = copyBtn.querySelector('span');
                    if (span) {
                        const orig = span.textContent;
                        span.textContent = dict.copied;
                        setTimeout(() => { span.textContent = orig; }, 1800);
                    }
                }).catch(() => {});
            });
        }
    }
}
