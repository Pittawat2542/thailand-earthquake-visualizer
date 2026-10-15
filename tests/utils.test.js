import test from 'node:test';
import assert from 'node:assert/strict';
import {
    addSpaceBetweenLanguages,
    sanitizeUrl,
    getSeverityByMagnitude,
    calculatePointRadius,
    formatRelativeTime,
    getDepthClassification
} from '../js/utils.js';

test('addSpaceBetweenLanguages adds space between Thai and Latin characters', () => {
    const input = 'ประเทศเมียนมาMyanmar';
    const output = addSpaceBetweenLanguages(input);
    assert.equal(output, 'ประเทศเมียนมา Myanmar');
});

test('sanitizeUrl cleans double slashes in paths while preserving protocol', () => {
    const dirtyUrl = 'https://earthquake.tmd.go.th//EQ17225';
    const cleanUrl = sanitizeUrl(dirtyUrl);
    assert.equal(cleanUrl, 'https://earthquake.tmd.go.th/EQ17225');

    const multiSlash = 'https://example.com///a//b';
    assert.equal(sanitizeUrl(multiSlash), 'https://example.com/a/b');
});

test('getSeverityByMagnitude categorizes Richter magnitudes accurately', () => {
    assert.equal(getSeverityByMagnitude(1.5).key, 'micro');
    assert.equal(getSeverityByMagnitude(2.9).key, 'micro');
    assert.equal(getSeverityByMagnitude(3.0).key, 'minor');
    assert.equal(getSeverityByMagnitude(3.8).key, 'minor');
    assert.equal(getSeverityByMagnitude(4.2).key, 'light');
    assert.equal(getSeverityByMagnitude(5.5).key, 'moderate');
    assert.equal(getSeverityByMagnitude(6.3).key, 'strong');
    assert.equal(getSeverityByMagnitude(7.8).key, 'major');
});

test('calculatePointRadius scales proportionally with magnitude', () => {
    const rSmall = calculatePointRadius(2.0, false);
    const rLarge = calculatePointRadius(7.0, false);
    assert.ok(rLarge > rSmall);
    assert.ok(rSmall >= 4);
    assert.ok(rLarge <= 22);
});

test('formatRelativeTime returns accurate human-readable intervals', () => {
    const base = new Date('2026-10-15T12:00:00Z');
    
    // 30 seconds ago
    const t30s = new Date(base.getTime() - 30 * 1000);
    assert.equal(formatRelativeTime(t30s, 'en', base), '30s ago');
    
    // 15 minutes ago
    const t15m = new Date(base.getTime() - 15 * 60 * 1000);
    assert.equal(formatRelativeTime(t15m, 'en', base), '15m ago');
    assert.equal(formatRelativeTime(t15m, 'th', base), '15 นาทีที่แล้ว');
    
    // 3 hours ago
    const t3h = new Date(base.getTime() - 3 * 3600 * 1000);
    assert.equal(formatRelativeTime(t3h, 'en', base), '3h ago');
    assert.equal(formatRelativeTime(t3h, 'th', base), '3 ชั่วโมงที่แล้ว');
    
    // 4 days ago
    const t4d = new Date(base.getTime() - 4 * 86400 * 1000);
    assert.equal(formatRelativeTime(t4d, 'en', base), '4d ago');
});

test('getDepthClassification assigns correct depth tier', () => {
    assert.equal(getDepthClassification(10, 'en').tier, 'shallow');
    assert.equal(getDepthClassification(70, 'en').tier, 'shallow');
    assert.equal(getDepthClassification(120, 'en').tier, 'intermediate');
    assert.equal(getDepthClassification(350, 'en').tier, 'deep');
});
