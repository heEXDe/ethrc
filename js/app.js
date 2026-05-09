const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const COINCAP_API_URL = 'https://api.coincap.io/v2';
const BINANCE_API_URL = 'https://api.binance.com/api/v3';

const BAND_COLORS = [
    '#0099cc',
    '#00cc00',
    '#66ff66',
    '#ffff00',
    '#ffcc00',
    '#ff9900',
    '#ff6600',
    '#ff3300',
    '#cc0000',
    '#990000'
];

const BAND_NAMES = [
    'EXTREME BUY',
    'BUY',
    'BUY ZONE',
    'ACCUMULATE',
    'HODL',
    'STILL CHEAP',
    'MOVE ALONG',
    'FUD TIME',
    'SELL ZONE',
    'MAXIMUM BUBBLE'
];

const BAND_DESCRIPTIONS = [
    'Extreme buying opportunity',
    'Strong buy opportunity',
    'Good accumulation area',
    'Hold and wait',
    'Near rainbow center',
    'Price moving up',
    'Ignore the FUD',
    'Consider selling',
    'Sell zone',
    'Maximum bubble territory'
];

const MIN_BAND = 0.25;
const MAX_BAND = 3.00;

function generateUniformBandFactors(numBands) {
    const logMin = Math.log(MIN_BAND);
    const logMax = Math.log(MAX_BAND);
    const step = (logMax - logMin) / (numBands - 1);
    
    const factors = [];
    for (let i = 0; i < numBands; i++) {
        factors.push(Math.exp(logMin + step * i));
    }
    return factors;
}

const BAND_FACTORS = generateUniformBandFactors(10);

class EthereumRainbowChart {
    constructor() {
        this.chart = null;
        this.priceHistory = [];
        this.boundaries = [];
        this.currentPrice = 0;
        this.currentZoom = 1;
        this.zoomMinDate = null;
        this.zoomMaxDate = null;
        this.cacheExpiry = 3600000;
        this.historicalDataSource = '';
        this.currentPriceDataSource = '';
        this.init();
    }

    async init() {
        document.getElementById('refresh-btn').addEventListener('click', () => this.refreshData());

        document.getElementById('zoom-in-btn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-btn').addEventListener('click', () => this.zoomOut());
        document.getElementById('pan-left-btn').addEventListener('click', () => this.panLeft());
        document.getElementById('pan-right-btn').addEventListener('click', () => this.panRight());
        document.getElementById('pan-up-btn').addEventListener('click', () => this.panUp());
        document.getElementById('pan-down-btn').addEventListener('click', () => this.panDown());

        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': this.panUp(); break;
                case 'ArrowDown': this.panDown(); break;
                case 'ArrowLeft': this.panLeft(); break;
                case 'ArrowRight': this.panRight(); break;
            }
        });

        document.getElementById('reset-btn').addEventListener('click', () => this.resetZoom());

        const cacheKey = 'eth_rainbow_data';
        const cachedData = this.getFromCache(cacheKey);

        if (cachedData) {
            this.priceHistory = cachedData.priceHistory;
            this.calculateRainbow();
            this.updateUI();
        } else {
            await this.refreshData();
        }
    }

    async refreshData() {
        this.showLoading();
        
        try {
            const priceHistory = await this.fetchPriceHistory();
            
            if (!priceHistory || priceHistory.length === 0) {
                throw new Error('Failed to fetch price data');
            }
            
            this.priceHistory = priceHistory;
            this.cacheData('eth_rainbow_data', this.priceHistory);
            
            this.calculateRainbow();
            this.updateUI();
            
        } catch (error) {
            console.error('Error refreshing data:', error);
            showError('Failed to load data. Please try again.');
        }
    }

    async fetchPriceHistory() {
        let priceHistory = [];
        let lastError = null;

        const apis = [
            { name: 'CoinCap', fn: () => this.fetchFromCoinCap() },
            { name: 'Binance', fn: () => this.fetchFromBinance() },
            { name: 'CoinGecko', fn: () => this.fetchFromCoinGecko() }
        ];

        for (const api of apis) {
            try {
                console.log(`Trying ${api.name} API for historical data...`);
                priceHistory = await api.fn();
                if (priceHistory && priceHistory.length > 0) {
                    console.log(`Successfully fetched ${priceHistory.length} data points from ${api.name}`);
                    this.historicalDataSource = api.name;
                    this.currentPriceDataSource = api.name;
                    return this.processPriceData(priceHistory);
                }
            } catch (error) {
                console.warn(`${api.name} API failed:`, error.message);
                lastError = error;
            }
        }

        throw new Error(`All data sources failed. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
    }

    async fetchFromCoinGecko() {
        const endDate = Math.floor(Date.now() / 1000);
        const startDate = Math.floor(new Date('2015-07-30').getTime() / 1000);

        try {
            const response = await fetch(
                `${COINGECKO_API_URL}/coins/ethereum/market_history/range?vs_currency=usd&from=${startDate}&to=${ endDate}`
            );

            if (!response.ok) {
                throw new Error('CoinGecko API error');
            }

            const data = await response.json();

            if (data.prices && data.prices.length > 0) {
                this.currentPrice = data.prices[data.prices.length - 1][1];
                return data.prices.map(([timestamp, price]) => ({
                    date: new Date(timestamp),
                    price: price
                }));
            }
        } catch (error) {
            console.error('CoinGecko detailed fetch failed:', error);
        }

        return await this.fetchCoinGeckoDaily();
    }

    async fetchFromCoinCap() {
        try {
            const response = await fetch(
                `${COINCAP_API_URL}/assets/ethereum/history?interval=d7`
            );

            if (!response.ok) {
                throw new Error('CoinCap API error');
            }

            const data = await response.json();

            if (data && data.data && data.data.length > 0) {
                this.currentPrice = parseFloat(data.data[0].priceUsd);
                
                return data.data.map(item => ({
                    date: new Date(parseInt(item.time)),
                    price: parseFloat(item.priceUsd)
                }));
            }
        } catch (error) {
            throw new Error(`CoinCap fetch failed: ${error.message}`);
        }
    }

    // get prices from Binance API
    async fetchFromBinance() {
        const symbols = ['ETHUSDT'];
        const priceHistory = [];

        for (const symbol of symbols) {
            try {
                const intervals = ['1w', '1d'];
                let dataPoints = [];

                for (const interval of intervals) {
                    try {
                        const response = await fetch(
                            `${BINANCE_API_URL}/klines?symbol=${symbol}&interval=${interval}&limit=520`
                        );

                        if (!response.ok) {
                            continue;
                        }

                        const data = await response.json();

                        if (Array.isArray(data) && data.length > 0) {
                            dataPoints = dataPoints.concat(data.map(item => ({
                                date: new Date(item[0]),
                                price: parseFloat(item[4])
                            })));
                            break;
                        }
                    } catch (error) {
                        console.warn(`Binance ${interval} interval failed:`, error.message);
                    }
                }

                if (dataPoints.length > 0) {
                    this.currentPrice = dataPoints[dataPoints.length - 1].price;
                    priceHistory.push(...dataPoints);
                }
            } catch (error) {
                console.warn(`Binance symbol ${symbol} failed:`, error.message);
            }
        }

        if (priceHistory.length > 0) {
            return priceHistory;
        }

        throw new Error('No data returned from Binance');
    }

    async fetchCoinGeckoDaily() {
        try {
            const response = await fetch(
                `${COINGECKO_API_URL}/coins/ethereum/ohlc?vs_currency=usd&days=max`
            );

            if (!response.ok) {
                throw new Error('CoinGecko daily data error');
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                const closePrice = data[data.length - 1][4];
                if (closePrice) {
                    this.currentPrice = closePrice;
                }

                return data.map(([timestamp, open, high, low, close]) => ({
                    date: new Date(timestamp),
                    price: close || (high + low + open) / 3
                }));
            }

            throw new Error('No data returned from CoinGecko');
        } catch (error) {
            throw new Error(`CoinGecko daily fetch failed: ${error.message}`);
        }
    }

    async fetchCurrentPrice() {
        try {
            const response = await fetch(`${COINGECKO_API_URL}/simple/price?ids=ethereum&vs_currencies=usd`);
            const data = await response.json();

            if (data.ethereum && data.ethereum.usd) {
                this.currentPrice = data.ethereum.usd;
                return this.currentPrice;
            }
        } catch (error) {
            console.error('Failed to fetch current price from CoinGecko:', error);
        }

        try {
            const response = await fetch(`${COINCAP_API_URL}/assets/ethereum`);
            const data = await response.json();

            if (data && data.data && data.data.priceUsd) {
                this.currentPrice = parseFloat(data.data.priceUsd);
                return this.currentPrice;
            }
        } catch (error) {
            console.error('Failed to fetch current price from CoinCap:', error);
        }

        return this.currentPrice || 0;
    }

    processPriceData(priceData) {
        if (!priceData || priceData.length === 0) {
            return [];
        }
        
        const sortedData = priceData
            .filter(item => item.date && item.price > 0)
            .sort((a, b) => a.date - b.date);
        
        const genesisDate = new Date('2015-07-30');
        const filteredData = sortedData.filter(item => item.date >= genesisDate);
        
        if (filteredData.length === 0) {
            return sortedData;
        }
        
        return filteredData;
    }

    calculateRainbow() {
        if (this.priceHistory.length < 30) {
            warning('Not enough data for accurate rainbow calculation');
            return;
        }

        const genesisDate = new Date('2015-07-30');
        const dataPoints = this.priceHistory.map(item => ({
            days: Math.floor((item.date - genesisDate) / (1000 * 60 * 60 * 24)),
            lnPrice: Math.log(item.price)
        }));

        const regression = this.calculateLogRegression(dataPoints);

        if (!regression) {
            warning('Failed to calculate regression');
            return;
        }

        let minRatio = Infinity;
        let maxRatio = -Infinity;

        for (const item of this.priceHistory) {
            const days = Math.floor((item.date - genesisDate) / (1000 * 60 * 60 * 24));
            const predictedPrice = Math.exp(regression.slope * days + regression.intercept);
            const ratio = item.price / predictedPrice;
            if (ratio < minRatio) minRatio = ratio;
            if (ratio > maxRatio) maxRatio = ratio;
        }

        const adjustedMinBand = Math.min(minRatio * 0.9, MIN_BAND);
        const adjustedMaxBand = Math.max(maxRatio * 1.1, MAX_BAND);

        const numBands = 10;
        const logMin = Math.log(adjustedMinBand);
        const logMax = Math.log(adjustedMaxBand);
        const step = (logMax - logMin) / (numBands - 1);

        const adjustedFactors = [];
        for (let i = 0; i < numBands; i++) {
            adjustedFactors.push(Math.exp(logMin + step * i));
        }

        this.adjustedBandFactors = adjustedFactors;

        const startDate = new Date('2015-07-30');
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 2);

        const allDates = [];
        const currentDate = new Date(startDate);
        const oldestPriceDate = this.priceHistory.length > 0 ? this.priceHistory[0].date : startDate;

        while (currentDate <= endDate) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 7);
        }

        this.boundaries = allDates.map(date => {
            const days = Math.floor((date - genesisDate) / (1000 * 60 * 60 * 24));
            const basePrice = Math.exp(regression.slope * days + regression.intercept);

            const bands = adjustedFactors.map(factor => basePrice * factor);

            return {
                date,
                basePrice,
                bands
            };
        });

        this.oldestDataDate = oldestPriceDate;
    }

    calculateLogRegression(dataPoints) {
        if (dataPoints.length < 2) {
            return null;
        }
        
        const n = dataPoints.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;
        let sumY2 = 0;
        
        for (const point of dataPoints) {
            sumX += point.days;
            sumY += point.lnPrice;
            sumXY += point.days * point.lnPrice;
            sumX2 += point.days * point.days;
            sumY2 += point.lnPrice * point.lnPrice;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const r2 = this.calculateR2(dataPoints, slope, intercept);
        
        console.log(`Regression slope: ${slope.toExponential(4)}, intercept: ${intercept.toExponential(4)}, R²: ${r2.toFixed(4)}`);
        
        return { slope, intercept, r2 };
    }

    calculateR2(dataPoints, slope, intercept) {
        if (dataPoints.length < 2) {
            return 0;
        }
        
        const meanY = dataPoints.reduce((sum, p) => sum + p.lnPrice, 0) / dataPoints.length;
        
        let ssTotal = 0;
        let ssResidual = 0;
        
        for (const point of dataPoints) {
            const predicted = slope * point.days + intercept;
            ssTotal += Math.pow(point.lnPrice - meanY, 2);
            ssResidual += Math.pow(point.lnPrice - predicted, 2);
        }
        
        if (ssTotal === 0) {
            return 0;
        }
        
        return 1 - ssResidual / ssTotal;
    }

    getCurrentBand() {
        if (this.currentPrice === 0 || this.boundaries.length === 0) {
            return -1;
        }
        
        const latestBoundary = this.boundaries[this.boundaries.length - 1];
        const bands = latestBoundary.bands;
        
        for (let i = 0; i < bands.length; i++) {
            if (this.currentPrice <= bands[i]) {
                return i;
            }
        }
        
        return bands.length - 1;
    }

    createChart() {
        const ctx = document.getElementById('rainbowChart').getContext('2d');

        const datasets = [];

        for (let i = 0; i < BAND_COLORS.length; i++) {
            const lowerData = this.boundaries.map(b => ({
                x: b.date,
                y: i === 0 ? Math.max(b.bands[i] / 100, b.bands[i]) : b.bands[i - 1]
            }));

            const upperData = this.boundaries.map(b => ({
                x: b.date,
                y: b.bands[i]
            }));

            const fillColor = i === 0 ? BAND_COLORS[0] : BAND_COLORS[i - 1];

            datasets.push({
                label: BAND_NAMES[i],
                data: [...lowerData, ...upperData.reverse()],
                backgroundColor: fillColor,
                borderColor: fillColor,
                borderWidth: 1,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0,
                order: i
            });
        }

        const priceData = this.priceHistory.map(p => ({
            x: p.date,
            y: p.price
        }));

        datasets.push({
            label: 'ETH Price',
            data: priceData,
            borderColor: '#ffffff',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#ffffff',
            order: 100,
            tension: 0.1
        });

        const currentBand = this.getCurrentBand();
        if (currentBand >= 0 && currentBand < BAND_COLORS.length) {
            datasets.push({
                label: 'Current Price',
                data: [{
                    x: new Date(),
                    y: this.currentPrice
                }],
                backgroundColor: BAND_COLORS[currentBand],
                borderColor: '#ffffff',
                pointRadius: 8,
                pointHoverRadius: 10,
                order: 101
            });
        }

        const minDate = this.oldestDataDate || this.priceHistory[0]?.date || new Date('2015-07-30');
        const maxDate = this.zoomMaxDate || (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 2);
            return d;
        })();
        const zoomedMinDate = this.zoomMinDate || minDate;

        const config = {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'year',
                            displayFormats: {
                                year: 'yyyy'
                            }
                        },
                        min: zoomedMinDate,
                        max: maxDate,
                        title: {
                            display: true,
                            text: 'Year',
                            color: '#888'
                        },
                        ticks: {
                            color: '#888',
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 10
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: 'ETH Price (USD)',
                            color: '#888'
                        },
                        ticks: {
                            color: '#888',
                            callback: function(value) {
                                if (value >= 1) {
                                    return '$' + value.toLocaleString();
                                }
                                return value.toFixed(2);
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#fff',
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#444',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.label === 'ETH Price' || context.dataset.label === 'Current Price') {
                                    return `${context.dataset.label}: $${context.parsed.y.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}`;
                                }
                                return null;
                            }
                        }
                    }
                }
            }
        };

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, config);
    }

    updateUI() {
        this.showLoading(false);

        if (this.boundaries.length === 0) {
            showError('No data available to display.');
            return;
        }

        this.createChart();
        this.updateStatusPanel();
        this.createLegend();
        this.updateDataSourcesDisplay();
    }

    updateDataSourcesDisplay() {
        const dataSourcesEl = document.getElementById('data-sources');

        const historicalText = this.historicalDataSource ? `Historical: ${this.historicalDataSource}` : 'Historical: None';
        const currentText = this.currentPriceDataSource ? `Current price: ${this.currentPriceDataSource}` : `Current price: ${this.historicalDataSource}`;

        dataSourcesEl.textContent = `${historicalText} • ${currentText}`;
    }

    updateStatusPanel() {
        const currentPriceEl = document.getElementById('current-price');
        const currentBandNameEl = document.getElementById('current-band-name');
        const sentimentValueEl = document.getElementById('sentiment-value');
        const lastUpdatedEl = document.getElementById('last-updated');
        
        const formattedPrice = this.currentPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        currentPriceEl.textContent = `$${formattedPrice}`;
        currentPriceEl.style.color = BAND_COLORS[4];
        
        const currentBand = this.getCurrentBand();
        
        if (currentBand >= 0 && currentBand < BAND_COLORS.length) {
            currentBandNameEl.textContent = BAND_NAMES[currentBand];
            currentBandNameEl.style.color = BAND_COLORS[currentBand];
            sentimentValueEl.textContent = BAND_DESCRIPTIONS[currentBand];
            sentimentValueEl.style.color = BAND_COLORS[currentBand];
        } else {
            currentBandNameEl.textContent = 'Calculating...';
            sentimentValueEl.textContent = '--';
        }
        
        lastUpdatedEl.textContent = new Date().toLocaleString();
    }

    createLegend() {
        const legendContainer = document.getElementById('legend-items');
        legendContainer.innerHTML = '';
        
        BAND_COLORS.forEach((color, index) => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            
            const info = document.createElement('div');
            info.className = 'band-info';
            
            const name = document.createElement('div');
            name.className = 'band-name';
            name.textContent = BAND_NAMES[index];
            name.style.color = color;
            
            const description = document.createElement('div');
            description.className = 'band-description';
            description.textContent = BAND_DESCRIPTIONS[index];
            
            info.appendChild(name);
            info.appendChild(description);
            item.appendChild(swatch);
            item.appendChild(info);
            legendContainer.appendChild(item);
        });
    }

    showLoading(show = true) {
        const loadingEl = document.getElementById('loading-indicator');
        const statusContentEl = document.getElementById('status-content');
        
        if (show) {
            loadingEl.classList.remove('hidden');
            statusContentEl.classList.add('hidden');
        } else {
            loadingEl.classList.add('hidden');
            statusContentEl.classList.remove('hidden');
        }
    }

    cacheData(key, data) {
        try {
            const cache = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(cache));
        } catch (error) {
            console.error('Failed to cache data:', error);
        }
    }

    getFromCache(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) {
                return null;
            }

            const cache = JSON.parse(cached);
            const elapsed = Date.now() - cache.timestamp;

            if (elapsed > this.cacheExpiry) {
                localStorage.removeItem(key);
                return null;
            }

            return cache.data;
        } catch (error) {
            console.error('Failed to read cache:', error);
            return null;
        }
    }

    zoomIn() {
        if (!this.chart) return;

        const xAxis = this.chart.scales.x;
        const currentMin = xAxis.min;
        const currentMax = xAxis.max;
        const range = currentMax - currentMin;
        const zoomFactor = 0.5;
        const newRange = range * zoomFactor;
        const center = currentMin + range / 2;
        const newMin = center - newRange / 2;
        const newMax = center + newRange / 2;

        this.zoomMinDate = newMin;
        this.zoomMaxDate = newMax;
        this.chart.options.scales.x.min = this.zoomMinDate;
        this.chart.options.scales.x.max = this.zoomMaxDate;
        this.chart.update();
    }

    zoomOut() {
        if (!this.chart) return;

        const xAxis = this.chart.scales.x;
        const currentMin = xAxis.min;
        const currentMax = xAxis.max;
        const range = currentMax - currentMin;
        const zoomFactor = 2;
        const newRange = range * zoomFactor;
        const center = currentMin + range / 2;
        const newMin = center - newRange / 2;
        const newMax = center + newRange / 2;

        const absoluteMin = this.oldestDataDate;
        const absoluteMax = (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 2);
            return d;
        })();

        this.zoomMinDate = newMin < absoluteMin ? absoluteMin : newMin;
        this.zoomMaxDate = newMax > absoluteMax ? absoluteMax : newMax;
        this.chart.options.scales.x.min = this.zoomMinDate;
        this.chart.options.scales.x.max = this.zoomMaxDate;
        this.chart.update();
    }

    resetZoom() {
        if (!this.chart) return;

        this.zoomMinDate = null;
        this.zoomMaxDate = null;
        const minDate = this.oldestDataDate || this.priceHistory[0]?.date || new Date('2015-07-30');
        const maxDate = (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 2);
            return d;
        })();

        this.chart.options.scales.x.min = minDate;
        this.chart.options.scales.x.max = maxDate;
        this.chart.options.scales.y.min = undefined;
        this.chart.options.scales.y.max = undefined;
        this.chart.update();
    }

    panLeft() {
        if (!this.chart) return;

        const xAxis = this.chart.scales.x;
        const currentMin = xAxis.min;
        const currentMax = xAxis.max;
        const range = currentMax - currentMin;
        const panAmount = range * 0.25;
        const absoluteMin = this.oldestDataDate || new Date('2015-07-30');

        let newMin = currentMin - panAmount;
        let newMax = currentMax - panAmount;

        if (newMin < absoluteMin) {
            newMin = absoluteMin;
            newMax = absoluteMin + range;
        }

        this.zoomMinDate = newMin;
        this.zoomMaxDate = newMax;
        this.chart.options.scales.x.min = this.zoomMinDate;
        this.chart.options.scales.x.max = this.zoomMaxDate;
        this.chart.update();
    }

    panRight() {
        if (!this.chart) return;

        const xAxis = this.chart.scales.x;
        const currentMin = xAxis.min;
        const currentMax = xAxis.max;
        const range = currentMax - currentMin;
        const panAmount = range * 0.25;
        const absoluteMax = (() => {
            const d = new Date();
            d.setFullYear(d.getFullYear() + 2);
            return d;
        })();

        let newMin = currentMin + panAmount;
        let newMax = currentMax + panAmount;

        if (newMax > absoluteMax) {
            newMax = absoluteMax;
            newMin = absoluteMax - range;
        }

        this.zoomMinDate = newMin;
        this.zoomMaxDate = newMax;
        this.chart.options.scales.x.min = this.zoomMinDate;
        this.chart.options.scales.x.max = this.zoomMaxDate;
        this.chart.update();
    }

    panUp() {
        if (!this.chart) return;

        const yAxis = this.chart.scales.y;
        const currentMin = yAxis.min;
        const currentMax = yAxis.max;
        const panFactor = 1.2;

        const newMin = currentMin * panFactor;
        const newMax = currentMax * panFactor;

        this.chart.options.scales.y.min = newMin;
        this.chart.options.scales.y.max = newMax;
        this.chart.update();
    }

    panDown() {
        if (!this.chart) return;

        const yAxis = this.chart.scales.y;
        const currentMin = yAxis.min;
        const currentMax = yAxis.max;
        const panFactor = 1.2;

        const newMin = Math.max(0.001, currentMin / panFactor);
        const newMax = Math.max(0.01, currentMax / panFactor);

        this.chart.options.scales.y.min = newMin;
        this.chart.options.scales.y.max = newMax;
        this.chart.update();
    }
}

function showError(message) {
    const statusContentEl = document.getElementById('status-content');
    
    statusContentEl.innerHTML = `
        <div class="error">
            ${message}
        </div>
        <button id="refresh-btn" onclick="location.reload()">Try Again</button>
    `;
}

function warning(message) {
    console.warn(message);
}

document.addEventListener('DOMContentLoaded', () => {
    new EthereumRainbowChart();
});