# Ethereum Rainbow Chart

A visualization of Ethereum's long-term price trends using rainbow bands based on logarithmic regression analysis, inspired by the Bitcoin Rainbow Chart from Blockchain Center.

## Features

- 🌈 **Rainbow Bands Visualization**: 10 colored bands showing different price zones from "BUY" to "Maximum Bubble Territory"
- 📊 **Historical Price Data**: Un-complete Ethereum price history
- 📈 **Logarithmic Scale**: Accurate representation of exponential price growth
- 🎯 **Current Price Assessment**: Real-time display of current ETH price and its position in the rainbow
- 🔄 **Automatic Updates**: Scheduled data refreshes with manual refresh option
- 💾 **Local Caching**: Reduces API calls and improves performance
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Methodology

The rainbow chart uses logarithmic regression to identify long-term price trends:

1. **Data Collection**: Historical daily Ethereum prices (not from the genesis)
2. **Logarithmic Regression**: Calculates best-fit line: `ln(price) = slope × days + intercept`
3. **Band Creation**: 10 bands created by multiplying the regression line by specific factors:
   - BUY (0.25× baseline)
   - BUY PRICE ZONE (0.40× baseline)
   - ACCUMULATE (0.55× baseline)
   - HODL (0.70× baseline)
   - STILL CHEAP (0.85× baseline)
   - MOVE ALONG (1.00× baseline) ← Regression line
   - STAY COOL (1.25× baseline)
   - FUDDING (1.60× baseline)
   - SELL (2.10× baseline)
   - MAXIMUM BUBBLE (3.00× baseline)

## Installation

### Option 1: Direct Usage

Simply open `index.html` in a web browser. No build process required!

```bash
# Clone or download the repository
cd eth_rainbow_chart

# Open in browser
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### Option 2: Local Server

For better development experience:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

### Etherscan API Key (Optional)

For preferential API access, add your Etherscan API key:

1. Get a free API key from [Etherscan](https://etherscan.io/myapikey)
2. Edit `js/app.js`
3. Replace `YOUR_API_KEY_HERE` with your actual API key:

```javascript
const ETHERSCAN_API_KEY = 'your_actual_api_key_here';
```
## Browser Support

- Modern browsers with ES6+ support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Libraries Used

- **Chart.js** (v4.4.0) - Chart visualization
- **chartjs-adapter-date-fns** (v3.0.0) - Date handling for charts
- 

Both loaded via CDN for zero-build deployment.

## Important Disclaimer

⚠️ **This is NOT financial advice!**

The Rainbow Chart is meant to be a fun way of looking at historical long-term price movements, disregarding daily volatility "noise". There is no scientific basis underpinning it, and past performance is not an indication of future results.

You cannot predict the price of Ethereum with a rainbow!

### Key Components

1. **API Integration**: Handles multiple data sources with fallbacks
2. **Rainbow Algorithm**: Implements logarithmic regression and band calculation
3. **Chart.js Integration**: Renders the interactive chart
4. **UI Components**: Status panel and legend

### Customization

You can customize the rainbow by modifying these constants in `js/app.js`:

```javascript
const BAND_COLORS      // Array of color hex codes
const BAND_NAMES       // Array of band names
const BAND_DESCRIPTIONS // Array of band descriptions
const BAND_FACTORS     // Array of band multiplier factors
```

## Troubleshooting

### Data Not Loading

- Check your internet connection
- Verify API key (if using Etherscan)
- Try refreshing the page
- Check browser console for errors

### Chart Not Displaying

- Ensure Chart.js CDN is accessible
- Check browser compatibility
- Clear browser cache
- Try a different browser

## Licenses

This project is for educational and entertainment purposes only.
This project is licensed under MIT license.
ChartJS and BootStrap libraries are both licensed under MIT license (LICENSES folder)

## Credits

Inspired by: 
- the Bitcoin Rainbow Chart from [Blockchain Center](https://www.blockchaincenter.net/bitcoin-rainbow-chart/)
- the Ethereum Rainbow Chart from [coinstats](https://coinstats.app/ethereum-rainbow-chart/)

## Future Enhancements

Potential improvements:

- [ ] Support for multiple cryptocurrencies
- [ ] Customizable time ranges
- [ ] Export chart as image
- [ ] Historical band tracking
- [ ] Mobile app version
- [ ] Comparison with BTC rainbow
- [ ] Advanced technical indicators
- [ ] Dark/light mode toggle

---