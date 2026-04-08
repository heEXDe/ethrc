# AGENTS.md

This file provides guidance for AI coding agents working on this Ethereum Rainbow Chart project.

## Project Overview

This is a standalone HTML5 application that visualizes Ethereum's long-term price trends using rainbow bands based on logarithmic regression. The chart helps users assess whether the current ETH price is in buying, holding, or selling zones relative to historical trends.

**Technology Stack:**
- Frontend: Vanilla HTML5 + JavaScript (no framework)
- Charting: Chart.js (v4.4.0) via CDN
- Date Handling: chartjs-adapter-date-fns via CDN
- Data Sources: Etherscan API (preferred), CoinGecko API (fallback)
- Build: None required - static files served directly

## Build/Lint/Test Commands

```bash
# Start local development server
python3 -m http.server 8000
# or
npx http-server -p 8000

# Check syntax (if you have jshint installed)
jshint js/app.js

# No formal test suite - manual testing in browser
# Open http://localhost:8000 in browser
# Test:
# 1. Chart renders correctly
# 2. Current price displays
# 3. Bands have correct colors
# 4. Legend matches chart colors
# 5. Refresh button works
# 6. Responsive on mobile
```

## Code Style Guidelines

### File Structure
- All files in root, css/, or js/ directories
- No build process, webpack, or bundlers
- Clear separation between HTML, CSS, and JavaScript

### Imports and Modules
- No ES6 imports/exports (vanilla JS)
- All code in single js/app.js file or clearly separated classes/functions
- Libraries loaded via CDN in HTML head

### Formatting
- Indentation: 4 spaces (no tabs)
- Line length: aim for < 120 characters
- Semicolons: always use semicolons
- Quote style: single quotes for strings, double quotes for HTML attributes

### Types
- Plain JavaScript (no TypeScript)
- Type hints in JSDoc comments for complex functions
- Validate data from APIs before use
- Use null checks: `if (!data || data.length === 0)`

### Naming Conventions

**Variables & Functions:** camelCase
```javascript
const currentPrice = 100;
function calculateRainbow() {}
```

**Classes:** PascalCase
```javascript
class EthereumRainbowChart {}
```

**Constants:** UPPER_SNAKE_CASE
```javascript
const ETHERSCAN_API_KEY = 'YOUR_API_KEY';
const BAND_COLORS = [...];
```

**Private Properties:** prefix with underscore (when relevant)
```javascript
this._internalState = {};
```

### Error Handling

- Use try/catch for all async operations
- Provide user-friendly error messages
- Log errors to console for debugging
- Always have fallback data sources
- Validate API responses before processing

```javascript
try {
  const data = await fetchData();
  if (!data || data.length === 0) {
    throw new Error('Invalid data received');
  }
} catch (error) {
  console.error('Operation failed:', error);
  showError('Failed to load data. Please try again.');
}
```

### API Integration

- Always implement fallback data sources
- Respect rate limits (5 calls/sec for Etherscan)
- Implement local caching to reduce API calls
- Cache expiry: 1 hour (3600000ms)
- Handle network failures gracefully

```javascript
// Pattern for API calls with fallback
async function getData() {
  try {
    return await primarySource();
  } catch (error) {
    return await fallbackSource();
  }
}
```

### Chart.js Integration

- Use Chart.js v4+ API
- Configure logarithmic Y-axis for crypto prices
- Destroy old charts before creating new ones
- Use responsive: true, maintainAspectRatio: false
- Set appropriate colors and opacity for bands

```javascript
if (this.chart) {
  this.chart.destroy();
}
this.chart = new Chart(ctx, config);
```

### Rainbow Algorithm

- Logarithmic regression: ln(price) = slope × days + intercept
- Days calculated from Ethereum genesis date: July 30, 2015
- Band factors: [0.25, 0.40, 0.55, 0.70, 0.85, 1.00, 1.25, 1.60, 2.10, 3.00]
- 10 bands with incremental factors around regression line (index 5 = 1.00)
- R² correlation should be calculated for validation

### Color Management

- Use exact hex codes from BAND_COLORS constant
- Rainbow colors progress from blue (bottom) to deep red (top)
- Current price point uses color of its containing band
- All colors defined in constants at top of file

```javascript
const BAND_COLORS = [
  '#0099cc', '#00cc00', '#66ff66', '#ffff00', '#ffcc00',
  '#ff9900', '#ff6600', '#ff3300', '#cc0000', '#990000'
];
```

### DOM Manipulation

- Use document.getElementById() or querySelector()
- Cache DOM references when used frequently
- Update UI efficiently (avoid full re-renders)
- Show/hide elements using CSS classes (.hidden)

```javascript
const element = document.getElementById('my-element');
element.textContent = 'New value';
element.classList.add('hidden');
```

### Responsive Design

- Mobile-first CSS approach
- Use CSS Grid/Flexbox for layouts
- Chart container should have fixed height
- Test on different screen sizes

```css
@media (max-width: 768px) {
  /* Mobile-specific styles */
}
```

### Accessibility

- Use semantic HTML (header, main, footer)
- Provide text alternatives for visual elements
- Ensure sufficient color contrast
- Button labels should be descriptive

### Performance

- Implement data caching (localStorage)
- Debounce rapid refresh attempts
- Use Chart.js pointRadius: 0 for large datasets
- Limit tooltips to avoid performance issues

### Comments

- Add comments for complex algorithms
- Document API endpoints and parameters
- Explain rainbow methodology
- No leading/trailing whitespace on comment lines

```javascript
// Calculate logarithmic regression coefficients
// Returns: { slope, intercept, r2 }
function calculateLogRegression(dataPoints) {}
```

## Key Constants to Maintain

When modifying behavior, ensure these constants remain consistent:

```javascript
// Data
const ETHERSCAN_API_KEY = 'YOUR_API_KEY_HERE';
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Bands
const BAND_COLORS = [...];      // 10 hex codes
const BAND_NAMES = [...];       // 10 names
const BAND_DESCRIPTIONS = [...]; // 10 descriptions
const BAND_FACTORS = [...];     // 10 multipliers

// Time
const genesisDate = new Date('2015-07-30');
const cacheExpiry = 3600000;     // 1 hour
```

## Testing Checklist

Before committing changes, verify:

- [ ] Chart loads and displays correctly
- [ ] All 10 bands are visible with correct colors
- [ ] Current price is displayed accurately
- [ ] Current band is highlighted correctly
- [ ] Refresh button works
- [ ] Fallback to CoinGecko works if Etherscan fails
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] Legend colors match chart bands
- [ ] Time axis shows years correctly
- [ ] Logarithmic scale works for prices
- [ ] Caching reduces API calls

## Common Issues

**Chart not displaying:**
- Check Chart.js CDN is accessible
- Verify canvas element exists
- Ensure data is properly formatted

**API rate limiting:**
- Implement request queuing
- Use cached data when possible
- Respect Etherscan 5 calls/second limit

**Price accuracy:**
- Validate data before processing
- Handle very early prices (<$1) correctly
- Ensure logarithmic scale handles 0-1 range

## Dependencies

All loaded via CDN - no npm install required:

- Chart.js: https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
- chartjs-adapter-date-fns: https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js

## Deployment

This is a static site. Can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

No build process required - just upload the files.

## Important Notes

- This is NOT financial advice
- Rainbow chart methodology is not scientifically validated
- Past performance ≠ future results
- Always use proper error handling for external APIs
- Test with different browsers before production use