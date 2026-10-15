/**
 * Utility functions for date/time formatting, timezone handling,
 * severity classifications, and UI helpers.
 */

import { SEVERITY_LEVELS, TRANSLATIONS } from './constants.js';

/**
 * Normalizes spacing between Thai and Latin script characters.
 */
export function addSpaceBetweenLanguages(text) {
    if (!text) return '';
    return text
        .replace(/([ก-๙])([A-Za-z0-9])/g, '$1 $2')
        .replace(/([A-Za-z0-9])([ก-๙])/g, '$1 $2');
}

/**
 * Sanitizes URLs to prevent malformed double slashes.
 */
export function sanitizeUrl(url) {
    if (!url) return '';
    return url.replace(/([^:])\/{2,}/g, '$1/');
}

/**
 * Looks up the severity object for a given magnitude.
 */
export function getSeverityByMagnitude(magnitude) {
    const mag = typeof magnitude === 'number' ? magnitude : parseFloat(magnitude);
    if (isNaN(mag) || mag < 0) return SEVERITY_LEVELS[0];
    
    for (const level of SEVERITY_LEVELS) {
        if (mag >= level.min && mag < level.max) {
            return level;
        }
    }
    // Fallback to highest severity for >= 7.0
    return SEVERITY_LEVELS[SEVERITY_LEVELS.length - 1];
}

/**
 * Returns point radius scaled by magnitude and screen size.
 */
export function calculatePointRadius(magnitude, isMobile = false) {
    const mag = parseFloat(magnitude) || 2.0;
    const base = isMobile ? 4.5 + mag * 2.2 : 3.5 + mag * 2.0;
    return Math.max(isMobile ? 5 : 4, Math.min(22, base));
}

/**
 * Safely parse a date or ISO string into a JavaScript Date object.
 */
export function parseDateSafe(val) {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    
    // Check if ISO string
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
    
    return null;
}

/**
 * Formats a Date object into Bangkok Time (GMT+7).
 */
export function formatBangkokDateTime(date, format = 'dd/MM/yyyy HH:mm:ss') {
    const d = parseDateSafe(date);
    if (!d) return '-';
    
    // Use Luxon if available globally, otherwise use Intl
    if (typeof window !== 'undefined' && window.luxon && window.luxon.DateTime) {
        return window.luxon.DateTime.fromJSDate(d)
            .setZone('Asia/Bangkok')
            .toFormat(format);
    }
    
    // Fallback to Intl.DateTimeFormat
    try {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: format.includes('ss') ? '2-digit' : undefined,
            hour12: false
        });
        return formatter.format(d).replace(',', '');
    } catch {
        return d.toISOString();
    }
}

/**
 * Formats a Date object into UTC Time string.
 */
export function formatUtcDateTime(date) {
    const d = parseDateSafe(date);
    if (!d) return '-';
    
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

/**
 * Returns a human-readable relative time string ("5m ago", "2h ago", etc.)
 */
export function formatRelativeTime(date, lang = 'en', now = new Date()) {
    const d = parseDateSafe(date);
    if (!d) return '-';
    
    const diffMs = Math.max(0, now.getTime() - d.getTime());
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    
    if (diffSecs < 60) {
        return dict.timeAgoSec.replace('{sec}', diffSecs);
    }
    if (diffMins < 60) {
        return dict.timeAgoMin.replace('{min}', diffMins);
    }
    if (diffHours < 24) {
        return dict.timeAgoHour.replace('{hour}', diffHours);
    }
    return dict.timeAgoDay.replace('{day}', diffDays);
}

/**
 * Categorizes earthquake focal depth into depth tiers.
 */
export function getDepthClassification(depthKm, lang = 'en') {
    const depth = parseFloat(depthKm);
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    
    if (isNaN(depth) || depth <= 70) {
        return { tier: 'shallow', label: dict.depthShallow, color: '#38bdf8' };
    }
    if (depth <= 300) {
        return { tier: 'intermediate', label: dict.depthIntermediate, color: '#f59e0b' };
    }
    return { tier: 'deep', label: dict.depthDeep, color: '#8b5cf6' };
}

/**
 * Debounce helper for event handling.
 */
export function debounce(func, waitMs = 200) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, waitMs);
    };
}

/**
 * Throttle helper.
 */
export function throttle(func, limitMs = 100) {
    let inThrottle = false;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => { inThrottle = false; }, limitMs);
        }
    };
}
