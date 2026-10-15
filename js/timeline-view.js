/**
 * TimelineView manages the D3.js interactive seismic timeline visualization
 * using DOM element recycling, zoom/brush controls, and singleton tooltips.
 */

import { getSeverityByMagnitude, calculatePointRadius, formatBangkokDateTime } from './utils.js';

export class TimelineView {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = options;
        this.onSelect = options.onSelect || (() => {});
        this.onHover = options.onHover || (() => {});
        this.currentLang = options.lang || 'en';
        this.currentTheme = options.theme || 'dark';

        this.container = null;
        this.svg = null;
        this.mainGroup = null;
        this.zoomGroup = null;
        this.xAxisGroup = null;
        this.yAxisGroup = null;
        this.gridGroup = null;
        this.tooltip = null;
        this.resetButton = null;
        this.zoomBehavior = null;

        this.xScale = null;
        this.yScale = null;
        this.currentXScale = null;
        this.data = [];
        this.selectedId = null;
        this.margin = { top: 25, right: 30, bottom: 45, left: 50 };
        this.width = 0;
        this.height = 0;
        this.resizeObserver = null;
    }

    /**
     * Initializes the D3 SVG canvas and singleton tooltip.
     */
    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) return;

        this.container.innerHTML = '';
        this.container.style.position = 'relative';

        // Singleton tooltip
        let existingTooltip = document.getElementById('timelineSingletonTooltip');
        if (!existingTooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.id = 'timelineSingletonTooltip';
            this.tooltip.className = 'timeline-tooltip';
            this.tooltip.style.opacity = '0';
            document.body.appendChild(this.tooltip);
        } else {
            this.tooltip = existingTooltip;
        }

        // Reset zoom button
        this.resetButton = document.createElement('button');
        this.resetButton.className = 'timeline-reset-zoom-btn';
        this.resetButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span>Reset Zoom</span>
        `;
        this.resetButton.style.display = 'none';
        this.resetButton.addEventListener('click', () => this.resetZoom());
        this.container.appendChild(this.resetButton);

        // Create SVG element
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('class', 'timeline-svg')
            .style('display', 'block')
            .style('overflow', 'hidden')
            .style('touch-action', 'none');

        // Clip path for zooming
        this.svg.append('defs')
            .append('clipPath')
            .attr('id', 'timeline-clip')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0);

        // Groups
        this.mainGroup = this.svg.append('g').attr('class', 'main-group');
        this.gridGroup = this.mainGroup.append('g').attr('class', 'grid-group');
        this.zoomGroup = this.mainGroup.append('g')
            .attr('class', 'zoom-group')
            .attr('clip-path', 'url(#timeline-clip)');
        this.xAxisGroup = this.mainGroup.append('g').attr('class', 'timeline-axis x-axis');
        this.yAxisGroup = this.mainGroup.append('g').attr('class', 'timeline-axis y-axis');

        // Axis labels
        this.yLabel = this.mainGroup.append('text')
            .attr('class', 'axis-label y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .attr('fill', 'currentColor');

        this.xLabel = this.mainGroup.append('text')
            .attr('class', 'axis-label x-axis-label')
            .attr('text-anchor', 'middle')
            .attr('fill', 'currentColor');

        // Setup Zoom behavior
        this.zoomBehavior = d3.zoom()
            .scaleExtent([1, 25])
            .on('zoom', (event) => this.onZoom(event))
            .on('end', (event) => {
                if (event.transform.k <= 1.01) {
                    this.resetButton.style.display = 'none';
                }
            });

        this.svg.call(this.zoomBehavior).on('dblclick.zoom', null);

        // Setup ResizeObserver for responsive redraws
        this.updateDimensions();
        this.resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        this.resizeObserver.observe(this.container);

        return this;
    }

    /**
     * Updates width and height dimensions based on container.
     */
    updateDimensions() {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;

        this.margin = isMobile 
            ? { top: 20, right: 15, bottom: 40, left: 40 }
            : { top: 25, right: 30, bottom: 45, left: 50 };

        const totalWidth = rect.width || 800;
        const totalHeight = isMobile ? 260 : 320;

        this.width = Math.max(100, totalWidth - this.margin.left - this.margin.right);
        this.height = Math.max(100, totalHeight - this.margin.top - this.margin.bottom);

        this.svg
            .attr('width', totalWidth)
            .attr('height', totalHeight);

        this.svg.select('#timeline-clip rect')
            .attr('width', this.width)
            .attr('height', this.height);

        this.mainGroup.attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        this.xAxisGroup.attr('transform', `translate(0,${this.height})`);

        this.yLabel
            .attr('x', -this.height / 2)
            .attr('y', -this.margin.left + 14)
            .text(this.currentLang === 'th' ? 'ขนาดการสั่นไหว (Magnitude)' : 'Magnitude (ML)');

        this.xLabel
            .attr('x', this.width / 2)
            .attr('y', this.height + this.margin.bottom - 5)
            .text(this.currentLang === 'th' ? 'วันและเวลา (GMT+7)' : 'Date & Time (GMT+7)');
    }

    /**
     * Debounced resize handler.
     */
    handleResize() {
        if (!this.data || this.data.length === 0) return;
        this.updateDimensions();
        this.render(this.data, this.selectedId, false);
    }

    /**
     * Renders earthquake points and scales with DOM recycling.
     */
    render(earthquakes, selectedId = null, animate = true) {
        this.data = earthquakes || [];
        this.selectedId = selectedId;

        if (!this.svg) this.init();
        if (!this.data || this.data.length === 0) {
            this.zoomGroup.selectAll('.timeline-point').remove();
            this.gridGroup.selectAll('.grid-line').remove();
            return;
        }

        const isMobile = window.innerWidth < 768;

        // Calculate scales
        const timeExtent = d3.extent(this.data, d => d.time);
        const timeRange = (timeExtent[1] ? timeExtent[1].getTime() : Date.now()) - (timeExtent[0] ? timeExtent[0].getTime() : Date.now());
        const timeBuffer = Math.max(1000 * 60 * 60, timeRange * 0.04);

        const startDomain = new Date(timeExtent[0].getTime() - timeBuffer);
        const endDomain = new Date(timeExtent[1].getTime() + timeBuffer);

        this.xScale = d3.scaleTime()
            .domain([startDomain, endDomain])
            .range([0, this.width]);

        const maxMag = d3.max(this.data, d => d.magnitude) || 6.0;
        this.yScale = d3.scaleLinear()
            .domain([0, Math.ceil(maxMag + 0.8)])
            .range([this.height, 0]);

        this.currentXScale = this.xScale;

        // Render reference magnitude grid lines
        const gridValues = [2.0, 3.0, 4.0, 5.0, 6.0, 7.0].filter(v => v <= this.yScale.domain()[1]);
        this.gridGroup.selectAll('.grid-line')
            .data(gridValues)
            .join('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', this.width)
            .attr('y1', d => this.yScale(d))
            .attr('y2', d => this.yScale(d))
            .attr('stroke', 'currentColor')
            .attr('stroke-dasharray', '2,4')
            .attr('stroke-opacity', 0.15);

        // Render Axes
        const xAxis = d3.axisBottom(this.xScale)
            .ticks(isMobile ? 4 : 7)
            .tickFormat(d => {
                const date = window.luxon ? window.luxon.DateTime.fromJSDate(d).setZone('Asia/Bangkok') : null;
                if (date) {
                    return date.toFormat(isMobile ? 'dd/MM' : 'dd/MM HH:mm');
                }
                return d.toLocaleDateString();
            });

        const yAxis = d3.axisLeft(this.yScale)
            .ticks(isMobile ? 5 : 7)
            .tickFormat(d => `${d.toFixed(1)}`);

        this.xAxisGroup.call(xAxis);
        this.yAxisGroup.call(yAxis);

        // Recycle circle elements via D3 join
        const points = this.zoomGroup.selectAll('.timeline-point')
            .data(this.data, d => d.id);

        const enterPoints = points.enter()
            .append('circle')
            .attr('class', 'timeline-point')
            .attr('tabindex', 0)
            .attr('role', 'button')
            .attr('cx', d => this.xScale(d.time))
            .attr('cy', d => this.yScale(d.magnitude))
            .attr('r', 0)
            .on('mouseenter', (event, d) => this.showTooltip(event, d))
            .on('mousemove', (event, d) => this.positionTooltip(event))
            .on('mouseleave', () => this.hideTooltip())
            .on('click', (event, d) => {
                this.selectedId = d.id;
                this.updateSelectedState();
                this.onSelect(d);
            })
            .on('keydown', (event, d) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.selectedId = d.id;
                    this.updateSelectedState();
                    this.onSelect(d);
                }
            });

        // Merge enter + update
        points.merge(enterPoints)
            .attr('data-id', d => d.id)
            .attr('fill', d => getSeverityByMagnitude(d.magnitude).color)
            .attr('stroke', d => (d.id === this.selectedId ? '#ffffff' : 'rgba(255,255,255,0.4)'))
            .attr('stroke-width', d => (d.id === this.selectedId ? 3 : 1.2))
            .classed('is-selected', d => d.id === this.selectedId)
            .transition()
            .duration(animate ? 400 : 0)
            .attr('cx', d => (this.currentXScale ? this.currentXScale(d.time) : this.xScale(d.time)))
            .attr('cy', d => this.yScale(d.magnitude))
            .attr('r', d => calculatePointRadius(d.magnitude, isMobile));

        // Remove old points cleanly
        points.exit()
            .transition()
            .duration(200)
            .attr('r', 0)
            .remove();
    }

    /**
     * Updates point classes when selection changes.
     */
    updateSelectedState() {
        this.zoomGroup.selectAll('.timeline-point')
            .attr('stroke', d => (d.id === this.selectedId ? '#ffffff' : 'rgba(255,255,255,0.4)'))
            .attr('stroke-width', d => (d.id === this.selectedId ? 3 : 1.2))
            .classed('is-selected', d => d.id === this.selectedId);
    }

    /**
     * Highlights an individual earthquake point programmatically.
     */
    highlightPoint(id) {
        this.selectedId = id;
        this.updateSelectedState();

        const node = this.zoomGroup.select(`.timeline-point[data-id="${id}"]`).node();
        if (node) {
            node.focus({ preventScroll: true });
        }
    }

    /**
     * Handles pan and zoom gestures.
     */
    onZoom(event) {
        const transform = event.transform;
        this.currentXScale = transform.rescaleX(this.xScale);

        // Update X-axis
        const isMobile = window.innerWidth < 768;
        const xAxis = d3.axisBottom(this.currentXScale)
            .ticks(isMobile ? 4 : 7)
            .tickFormat(d => {
                const date = window.luxon ? window.luxon.DateTime.fromJSDate(d).setZone('Asia/Bangkok') : null;
                if (date) {
                    return date.toFormat(isMobile ? 'dd/MM' : 'dd/MM HH:mm');
                }
                return d.toLocaleDateString();
            });

        this.xAxisGroup.call(xAxis);

        // Update point positions
        this.zoomGroup.selectAll('.timeline-point')
            .attr('cx', d => this.currentXScale(d.time));

        // Toggle reset zoom button
        if (transform.k > 1.05 || transform.x !== 0) {
            this.resetButton.style.display = 'inline-flex';
        } else {
            this.resetButton.style.display = 'none';
        }
    }

    /**
     * Resets zoom transformation back to identity.
     */
    resetZoom() {
        if (!this.svg || !this.zoomBehavior) return;

        this.svg.transition()
            .duration(500)
            .call(this.zoomBehavior.transform, d3.zoomIdentity);

        this.resetButton.style.display = 'none';
    }

    /**
     * Displays the singleton tooltip on hover.
     */
    showTooltip(event, eq) {
        const severity = getSeverityByMagnitude(eq.magnitude);
        const timeBangkok = formatBangkokDateTime(eq.time, 'dd MMM yyyy, HH:mm:ss');

        this.tooltip.innerHTML = `
            <div class="tt-header">
                <span class="tt-badge" style="background-color: ${severity.color}">M ${eq.magnitude.toFixed(1)}</span>
                <span class="tt-time">${timeBangkok}</span>
            </div>
            <div class="tt-title">${eq.title}</div>
            <div class="tt-meta">
                <span>Depth: <strong>${eq.depth} km</strong></span>
                <span>Coords: <strong>${eq.latitude.toFixed(2)}°N, ${eq.longitude.toFixed(2)}°E</strong></span>
            </div>
        `;
        this.tooltip.style.opacity = '1';
        this.positionTooltip(event);
        this.onHover(eq);
    }

    /**
     * Positions the singleton tooltip avoiding viewport boundary cut-offs.
     */
    positionTooltip(event) {
        if (!this.tooltip) return;

        const x = event.clientX;
        const y = event.clientY;
        const ttRect = this.tooltip.getBoundingClientRect();

        let posX = x + 15;
        let posY = y - ttRect.height - 12;

        if (posX + ttRect.width > window.innerWidth - 10) {
            posX = x - ttRect.width - 15;
        }
        if (posY < 10) {
            posY = y + 20;
        }

        this.tooltip.style.left = `${posX}px`;
        this.tooltip.style.top = `${posY}px`;
    }

    /**
     * Hides the singleton tooltip.
     */
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
        }
    }
}
