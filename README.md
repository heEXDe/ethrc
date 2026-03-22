# Ethereum Rainbow Chart

A visualization of Ethereum's long-term price trends using rainbow bands based on logarithmic regression analysis, inspired by the Bitcoin Rainbow Chart from Blockchain Center.

## Features

- 🌈 **Rainbow Bands Visualization**: 10 colored bands showing different price zones from "BUY" to "Maximum Bubble Territory"
- 📊 **Historical Price Data**: Complete Ethereum price history from genesis (July 30, 2015) to present
- 📈 **Logarithmic Scale**: Accurate representation of exponential price growth
- 🎯 **Current Price Assessment**: Real-time display of current ETH price and its position in the rainbow
- 🔄 **Automatic Updates**: Scheduled data refreshes with manual refresh option
- 💾 **Local Caching**: Reduces API calls and improves performance
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Methodology

The rainbow chart uses logarithmic regression to identify long-term price trends:

1. **Data Collection**: Historical daily Ethereum prices from genesis date
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

## Data Sources

The application automatically tries multiple data sources:

### Historical Price Data (for Rainbow Chart)

1. **Binance API** (Primary - Recommended)
   - Provides comprehensive historical ETH prices
   - CORS-friendly, works directly from browser
   - No API key required
   - Currently provides 400-500+ data points

2. **CoinCap API** (Secondary)
   - Provides historical ETH price data
   - CORS-friendly
   - No API key required
   - Used as fallback if Binance fails

3. **CoinGecko API** (Tertiary)
   - Provides historical price data
   - Has CORS issues in some browsers
   - Free, no API key required
   - Used as last resort fallback

### Current Price Data

1. **Etherscan API** (Preferred for accuracy)
   - Provides real-time ETH price
   - Requires API key (optional)
   - **Does NOT provide historical data** on free tier
   - Used to verify and cross-check current price

2. **Binance API** (Fallback)
   - Current price from last historical data point
   - Used if Etherscan API key not provided

**Important Note:** Etherscan's free tier API only provides current ETH price and basic statistics. It does NOT provide historical price data needed for the rainbow chart. That's why we use Binance/CoinCap for historical data and optionally Etherscan for verifying the current price.

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

## Configuration

### Etherscan API Key (Optional)

For preferential API access, add your Etherscan API key:

1. Get a free API key from [Etherscan](https://etherscan.io/myapikey)
2. Edit `js/app.js`
3. Replace `YOUR_API_KEY_HERE` with your actual API key:

```javascript
const ETHERSCAN_API_KEY = 'your_actual_api_key_here';
```

**Note**: The app works without an API key using CoinGecko as a fallback.

## Browser Support

- Modern browsers with ES6+ support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Libraries Used

- **Chart.js** (v4.4.0) - Chart visualization
- **chartjs-adapter-date-fns** (v3.0.0) - Date handling for charts

Both loaded via CDN for zero-build deployment.

## Color Legend

| Band | Color | Description |
|------|-------|-------------|
| BUY | 🔵 Blue | Extreme buying opportunity |
| BUY PRICE ZONE | 🟢 Green | Strong buy zone |
| ACCUMULATE | 🟢 Light Green | Good accumulation area |
| HODL | 🟡 Yellow | Hold and wait |
| STILL CHEAP | 🟠 Orange | Near rainbow center |
| MOVE ALONG | 🟠 Orange-Red | Price moving up |
| STAY COOL | 🔴 Red | Remain calm |
| FUDDING | 🔴 Dark Red | Ignore FUD |
| SELL | 🔴 Crimson | Consider selling |
| MAXIMUM BUBBLE | 🔴 Deep Red | Maximum bubble territory |

## Current Price Assessment

The status panel shows:

- **Current ETH Price**: Live price with color-coded band indication
- **Current Band**: Which rainbow band contains the current price
- **Sentiment**: Brief description of the current market phase
- **Last Updated**: Timestamp of last data refresh

## Important Disclaimer

⚠️ **This is NOT financial advice!**

The Rainbow Chart is meant to be a fun way of looking at historical long-term price movements, disregarding daily volatility "noise". There is no scientific basis underpinning it, and past performance is not an indication of future results.

You cannot predict the price of Ethereum with a rainbow!

## Development

### Project Structure

```
eth_rainbow_chart/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styles and responsive design
├── js/
│   └── app.js          # Main application logic
└── README.md           # This file
```

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

### Rate Limiting

- Etherscan free tier: 5 calls/second
- CoinGecko: Rate limits apply
- Local caching reduces API calls

## License

This project is for educational and entertainment purposes only.

## Credits

- Inspired by the Bitcoin Rainbow Chart from [Blockchain Center](https://www.blockchaincenter.net/bitcoin-rainbow-chart/)
- Data sources: [Etherscan](https://etherscan.io) and [CoinGecko](https://www.coingecko.com)
- Built with [Chart.js](https://www.chartjs.org)

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

Made with ❤️ for the Ethereum community