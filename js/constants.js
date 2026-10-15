/**
 * Constants, localization dictionaries, and configuration settings
 * for Thailand Earthquake Visualizer.
 */

export const TRANSLATIONS = {
    en: {
        siteTitle: 'Thailand Earthquake Visualizer',
        liveFeed: 'LIVE MONITOR',
        lastUpdate: 'Last update:',
        updatedJustNow: 'Updated just now',
        refreshBtn: 'Refresh data',
        refreshing: 'Refreshing...',
        themeToggle: 'Toggle theme',
        darkTheme: 'Dark theme',
        lightTheme: 'Light theme',
        
        // Stats
        statTotalLabel: 'Total Events',
        statShowingCount: 'Showing {count} of {total}',
        statMaxMagLabel: 'Max Magnitude',
        statRecentLabel: 'Most Recent',
        statDepthRangeLabel: 'Depth Range',
        statRegionsLabel: 'Active Regions',
        
        // Filters
        filterSectionTitle: 'Filters & Controls',
        dateFilterLabel: 'Date Range',
        datePreset24h: '24 Hours',
        datePreset7d: '7 Days',
        datePreset30d: '30 Days',
        datePresetAll: 'All Time',
        dateRangeSeparator: 'to',
        locationFilterLabel: 'Location / Region',
        locationFilterAll: 'All locations',
        locationFilterMyanmar: 'Myanmar only',
        locationFilterThailand: 'Thailand & Border',
        searchPlaceholder: 'Search by location or description...',
        magnitudeFilterLabel: 'Minimum Magnitude',
        magnitudeFilterAll: 'All magnitudes (≥ 0.0)',
        resetFilters: 'Reset filters',
        
        // Legend
        legendTitle: 'Magnitude Scale (Richter)',
        severityMicro: 'Micro (< 3.0)',
        severityMinor: 'Minor (3.0 - 3.9)',
        severityLight: 'Light (4.0 - 4.9)',
        severityModerate: 'Moderate (5.0 - 5.9)',
        severityStrong: 'Strong (6.0 - 6.9)',
        severityMajor: 'Major (≥ 7.0)',
        
        // Map & Timeline
        mapTitle: 'Interactive Earthquake Map',
        timelineTitle: 'Timeline (Magnitude vs Date)',
        resetZoom: 'Reset Zoom',
        zoomHint: 'Scroll to zoom, drag to pan',
        timezoneNote: 'Times shown in GMT+7 (Asia/Bangkok)',
        noData: 'No earthquakes found matching the selected filters.',
        loadingData: 'Loading earthquake data...',
        loadingError: 'Failed to fetch live data. Displaying cached records.',
        
        // Inspector / Details
        detailsTitle: 'Earthquake Inspector',
        noSelectionPrompt: 'Select an event on the map or timeline to inspect details.',
        labelLocation: 'Location',
        labelDateTime: 'Date & Time (GMT+7)',
        labelDateTimeUtc: 'Date & Time (UTC)',
        labelMagnitude: 'Magnitude',
        labelDepth: 'Focal Depth',
        labelKm: 'km',
        labelCoordinates: 'Coordinates',
        labelClassification: 'Classification',
        labelSafetyAdvice: 'Safety Guidance',
        copyCoordinates: 'Copy coordinates',
        copied: 'Copied!',
        viewOnGoogleMaps: 'Google Maps',
        viewTmdReport: 'Official TMD Report',
        
        // Depth tiers
        depthShallow: 'Shallow (≤ 70 km)',
        depthIntermediate: 'Intermediate (70 - 300 km)',
        depthDeep: 'Deep (> 300 km)',
        
        // Relative times
        timeAgoSec: '{sec}s ago',
        timeAgoMin: '{min}m ago',
        timeAgoHour: '{hour}h ago',
        timeAgoDay: '{day}d ago',
        
        // Footer
        dataSourceText: 'Data source:',
        sourceCodeText: 'Source code:'
    },
    th: {
        siteTitle: 'ระบบติดตามแผ่นดินไหวประเทศไทย',
        liveFeed: 'สถานะสด',
        lastUpdate: 'อัปเดตล่าสุด:',
        updatedJustNow: 'เพิ่งอัปเดตเมื่อสักครู่',
        refreshBtn: 'รีเฟรชข้อมูล',
        refreshing: 'กำลังรีเฟรช...',
        themeToggle: 'เปลี่ยนธีม',
        darkTheme: 'ธีมมืด',
        lightTheme: 'ธีมสว่าง',
        
        // Stats
        statTotalLabel: 'เหตุการณ์ทั้งหมด',
        statShowingCount: 'กำลังแสดง {count} จาก {total} เหตุการณ์',
        statMaxMagLabel: 'ขนาดสูงสุด',
        statRecentLabel: 'ล่าสุดเมื่อ',
        statDepthRangeLabel: 'ช่วงความลึก',
        statRegionsLabel: 'ภูมิภาคที่เกิด',
        
        // Filters
        filterSectionTitle: 'ตัวกรองและการค้นหา',
        dateFilterLabel: 'ช่วงเวลา',
        datePreset24h: '24 ชั่วโมง',
        datePreset7d: '7 วัน',
        datePreset30d: '30 วัน',
        datePresetAll: 'ทั้งหมด',
        dateRangeSeparator: 'ถึง',
        locationFilterLabel: 'พื้นที่ / ภูมิภาค',
        locationFilterAll: 'ทุกพื้นที่',
        locationFilterMyanmar: 'เฉพาะประเทศเมียนมา',
        locationFilterThailand: 'ไทยและแนวพรมแดน',
        searchPlaceholder: 'ค้นหาตามชื่อพื้นที่หรือคำอธิบาย...',
        magnitudeFilterLabel: 'ขนาดขั้นต่ำ',
        magnitudeFilterAll: 'ทุกขนาด (≥ 0.0)',
        resetFilters: 'ล้างตัวกรอง',
        
        // Legend
        legendTitle: 'ระดับขนาดแผ่นดินไหว (มาตราริกเตอร์)',
        severityMicro: 'เล็กมาก (< 3.0)',
        severityMinor: 'เล็กน้อย (3.0 - 3.9)',
        severityLight: 'เบา (4.0 - 4.9)',
        severityModerate: 'ปานกลาง (5.0 - 5.9)',
        severityStrong: 'รุนแรง (6.0 - 6.9)',
        severityMajor: 'รุนแรงมาก (≥ 7.0)',
        
        // Map & Timeline
        mapTitle: 'แผนที่แผ่นดินไหวแบบโต้ตอบ',
        timelineTitle: 'ไทม์ไลน์ (ขนาดและวันเวลาที่เกิด)',
        resetZoom: 'รีเซ็ตการซูม',
        zoomHint: 'เลื่อนลูกกลิ้งเพื่อซูม, ลากเพื่อเลื่อนดู',
        timezoneNote: 'เวลาทั้งหมดแสดงในรูปแบบ GMT+7 (เวลาประเทศไทย)',
        noData: 'ไม่พบข้อมูลแผ่นดินไหวตามเงื่อนไขที่เลือก',
        loadingData: 'กำลังโหลดข้อมูลแผ่นดินไหว...',
        loadingError: 'ไม่สามารถดึงข้อมูลสดได้ กำลังแสดงข้อมูลที่บันทึกล่าสุด',
        
        // Inspector / Details
        detailsTitle: 'รายละเอียดเหตุการณ์',
        noSelectionPrompt: 'เลือกจุดบนแผนที่หรือไทม์ไลน์เพื่อดูรายละเอียดเชิงลึก',
        labelLocation: 'ตำแหน่งที่เกิด',
        labelDateTime: 'วันเวลา (GMT+7)',
        labelDateTimeUtc: 'วันเวลา (UTC)',
        labelMagnitude: 'ขนาดการสั่นไหว',
        labelDepth: 'ความลึกศูนย์กลาง',
        labelKm: 'กม.',
        labelCoordinates: 'พิกัดภูมิศาสตร์',
        labelClassification: 'ระดับความรุนแรง',
        labelSafetyAdvice: 'ข้อแนะนำความปลอดภัย',
        copyCoordinates: 'คัดลอกพิกัด',
        copied: 'คัดลอกแล้ว!',
        viewOnGoogleMaps: 'ดูบน Google Maps',
        viewTmdReport: 'รายงานฉบับเต็มจากกรมอุตุฯ',
        
        // Depth tiers
        depthShallow: 'ระดับตื้น (≤ 70 กม.)',
        depthIntermediate: 'ระดับปานกลาง (70 - 300 กม.)',
        depthDeep: 'ระดับลึก (> 300 กม.)',
        
        // Relative times
        timeAgoSec: '{sec} วินาทีที่แล้ว',
        timeAgoMin: '{min} นาทีที่แล้ว',
        timeAgoHour: '{hour} ชั่วโมงที่แล้ว',
        timeAgoDay: '{day} วันที่แล้ว',
        
        // Footer
        dataSourceText: 'แหล่งข้อมูล:',
        sourceCodeText: 'ซอร์สโค้ด:'
    }
};

export const SEVERITY_LEVELS = [
    {
        key: 'micro',
        nameEn: 'Micro',
        nameTh: 'เล็กมาก',
        min: 0,
        max: 3.0,
        color: '#10b981', // Emerald
        bgColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: '#10b981',
        adviceEn: 'No action required: These micro-earthquakes are rarely felt by humans and pose no danger.',
        adviceTh: 'ไม่จำเป็นต้องดำเนินการใดๆ: แผ่นดินไหวขนาดเล็กมากเหล่านี้แทบจะไม่รู้สึกและไม่ก่อให้เกิดอันตราย'
    },
    {
        key: 'minor',
        nameEn: 'Minor',
        nameTh: 'เล็กน้อย',
        min: 3.0,
        max: 4.0,
        color: '#84cc16', // Lime
        bgColor: 'rgba(132, 204, 22, 0.15)',
        borderColor: '#84cc16',
        adviceEn: 'No special actions needed: May be felt by individuals at rest on upper floors. Stay informed.',
        adviceTh: 'ไม่จำเป็นต้องดำเนินการพิเศษ: อาจรู้สึกได้เฉพาะผู้อยู่ชั้นบนของอาคารสูง ติดตามข้อมูลตามปกติ'
    },
    {
        key: 'light',
        nameEn: 'Light',
        nameTh: 'เบา',
        min: 4.0,
        max: 5.0,
        color: '#eab308', // Amber/Yellow
        bgColor: 'rgba(234, 179, 8, 0.15)',
        borderColor: '#eab308',
        adviceEn: 'Stay alert: Felt indoors by many, rattling dishes and windows. Secure loose falling objects.',
        adviceTh: 'เตรียมพร้อม: สั่นไหวชัดเจนในอาคาร สิ่งของอาจแกว่งไหว ยึดวัตถุที่อาจร่วงหล่น'
    },
    {
        key: 'moderate',
        nameEn: 'Moderate',
        nameTh: 'ปานกลาง',
        min: 5.0,
        max: 6.0,
        color: '#f97316', // Orange
        bgColor: 'rgba(249, 115, 22, 0.15)',
        borderColor: '#f97316',
        adviceEn: 'Take precautions: Stay away from glass and heavy fixtures. Minor damage possible to non-engineered structures. Be prepared for aftershocks.',
        adviceTh: 'ใช้ความระมัดระวัง: อยู่ห่างจากกระจกและของหนัก ระวังความเสียหายต่อสิ่งปลูกสร้าง เตรียมรับมือแผ่นดินไหวตาม (Aftershock)'
    },
    {
        key: 'strong',
        nameEn: 'Strong',
        nameTh: 'รุนแรง',
        min: 6.0,
        max: 7.0,
        color: '#ef4444', // Red
        bgColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: '#ef4444',
        adviceEn: 'Take immediate protective action: Drop, Cover, and Hold On! Stay indoors away from windows until shaking ceases. Inspect structures before re-entering.',
        adviceTh: 'ดำเนินการป้องกันทันที: หมอบ ปกป้อง เกาะยึด! อยู่ในอาคารห่างจากหน้าต่างจนกว่าการสั่นจะหยุด ตรวจสอบความปลอดภัยก่อนเข้าอาคาร'
    },
    {
        key: 'major',
        nameEn: 'Major',
        nameTh: 'รุนแรงมาก',
        min: 7.0,
        max: 10.0,
        color: '#b91c1c', // Deep Crimson
        bgColor: 'rgba(185, 28, 28, 0.2)',
        borderColor: '#b91c1c',
        adviceEn: 'EMERGENCY: Seek shelter immediately. Severe damage likely. Evacuate unstable structures once shaking ends. Beware of tsunami risk if near coastlines.',
        adviceTh: 'เหตุฉุกเฉินร้ายแรง: หาที่กำบังทันที อาจเกิดความเสียหายรุนแรงเป็นบริเวณกว้าง อพยพสู่พื้นที่ปลอดภัยหลังการสั่นสิ้นสุด ระวังสึนามิหากอยู่ใกล้ชายฝั่ง'
    }
];

export const MAP_TILES = {
    osm: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        maxZoom: 19
    }
};

export const DEFAULT_CONFIG = {
    mapCenter: [17.5, 99.0],
    mapZoom: 5.5,
    autoRefreshIntervalMs: 5 * 60 * 1000, // 5 minutes
    localStorageKeys: {
        lang: 'earthquake_lang',
        theme: 'earthquake_theme',
        cachedData: 'earthquake_cached_data',
        lastCheck: 'earthquake_last_check'
    }
};
