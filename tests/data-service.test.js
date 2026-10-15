import test from 'node:test';
import assert from 'node:assert/strict';
import { DataService } from '../js/data-service.js';

const sampleRecords = [
    {
        title: 'ประเทศเมียนมา Myanmar',
        link: 'https://earthquake.tmd.go.th//EQ17224',
        latitude: 19.61,
        longitude: 94.13,
        depth: 80,
        magnitude: 3.6,
        time: '2026-10-14T18:45:05.000Z',
        description: 'Minor Earthquake in Myanmar'
    },
    {
        title: 'พรมแดนประเทศเมียนมา - ประเทศจีน Myanmar - China Border Region',
        link: 'https://earthquake.tmd.go.th//EQ17225',
        latitude: 22.99,
        longitude: 99.54,
        depth: 10,
        magnitude: 5.2,
        time: '2026-10-14T19:25:20.000Z',
        description: 'Moderate Earthquake near China Border'
    },
    {
        title: 'หมู่เกาะอันดามัน ประเทศอินเดีย Andaman Islands, India Region',
        link: 'https://earthquake.tmd.go.th//EQ17223',
        latitude: 13.41,
        longitude: 92.27,
        depth: 10,
        magnitude: 2.5,
        time: '2026-10-10T12:00:00.000Z',
        description: 'Micro event'
    },
    {
        title: 'อ.แม่สรวย จ.เชียงราย Chiang Rai, Thailand',
        link: 'https://earthquake.tmd.go.th//EQ17200',
        latitude: 19.7,
        longitude: 99.5,
        depth: 5,
        magnitude: 2.1,
        time: '2026-09-01T00:00:00.000Z',
        description: 'Small tremor in Thailand'
    }
];

test('DataService.normalizeRecords parses fields and sorts newest first', () => {
    const service = new DataService();
    const normalized = service.normalizeRecords(sampleRecords);
    
    assert.equal(normalized.length, 4);
    assert.equal(normalized[0].id, 'EQ17225');
    assert.equal(normalized[0].magnitude, 5.2);
    assert.equal(normalized[0].link, 'https://earthquake.tmd.go.th/EQ17225');
    assert.ok(normalized[0].time >= normalized[1].time);
});

test('DataService.calculateStats computes summary indicators accurately', () => {
    const service = new DataService();
    const normalized = service.normalizeRecords(sampleRecords);
    const stats = service.calculateStats(normalized);
    
    assert.equal(stats.total, 4);
    assert.equal(stats.maxMagnitude, 5.2);
    assert.equal(stats.maxEvent.id, 'EQ17225');
    assert.equal(stats.mostRecent.id, 'EQ17225');
    assert.equal(stats.minDepth, 5);
    assert.equal(stats.maxDepth, 80);
});

test('DataService.filterData filters by minimum magnitude', () => {
    const service = new DataService();
    const normalized = service.normalizeRecords(sampleRecords);
    
    const m3 = service.filterData(normalized, { minMagnitude: 3.0, preset: 'all' });
    assert.equal(m3.length, 2);
    
    const m5 = service.filterData(normalized, { minMagnitude: 5.0, preset: 'all' });
    assert.equal(m5.length, 1);
    assert.equal(m5[0].id, 'EQ17225');
});

test('DataService.filterData filters by location keyword', () => {
    const service = new DataService();
    const normalized = service.normalizeRecords(sampleRecords);
    
    const myanmarOnly = service.filterData(normalized, { location: 'myanmar', preset: 'all' });
    assert.equal(myanmarOnly.length, 2);
    
    const thailandOnly = service.filterData(normalized, { location: 'thailand', preset: 'all' });
    assert.equal(thailandOnly.length, 2); // Chiang Rai and Border
});

test('DataService.filterData filters by search query', () => {
    const service = new DataService();
    const normalized = service.normalizeRecords(sampleRecords);
    
    const searchChiangRai = service.filterData(normalized, { searchQuery: 'Chiang Rai', preset: 'all' });
    assert.equal(searchChiangRai.length, 1);
    assert.equal(searchChiangRai[0].id, 'EQ17200');
});
