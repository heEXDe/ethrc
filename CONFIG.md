# API Configuration

## Data Sources Used

This application uses multiple APIs with specific purposes:

### Primary Data Sources for Historical Data

1. **Binance API** (Primary)
   - Provides historical ETH prices (weekly/daily candles)
   - CORS-friendly, works directly from browser
   - No API key required
   - Currently working great!

2. **CoinCap API** (Secondary)
   - Provides historical ETH price data
   - CORS-friendly
   - No API key required
   - Used as fallback if Binance fails

3. **CoinGecko API** (Tertiary)
   - Provides historical price data
   - Has CORS issues in some browsers
   - Rate limited
   - Used as last resort fallback

### Etherscan API (Current Price Only)

**IMPORTANT:** Etherscan API **does NOT provide historical price data** on the free tier. It only provides:
- Current ETH price
- ETH market statistics
- Block and transaction data

For this reason, Etherscan is **not used** for fetching historical price data needed for the rainbow chart.

#### Why Provide an Etherscan API Key?

The Etherscan API key is useful for:
- **Verifying current price accuracy** - cross-check with Binance data
- **Future enhancements** - if you want to add block data or transaction analytics
- **Rate limiting benefits** - better limits for any future Etherscan features

#### The API Key IS Being Used!

If you provided your Etherscan API key, it **is being used** to fetch the current ETH price! Check the console:
```
Fetching current price from Etherscan for accuracy...
Etherscan current price: $3456.78
```

This ensures that the displayed current price is accurate and cross-verified.

## How to Get an Etherscan API Key (Optional)

1. Visit https://etherscan.io
2. Sign up or log in
3. Go to your Account Settings
4. Generate an API Key (free)
5. Copy your API key

### How to Configure

Edit `js/app.js` and replace the placeholder:

```javascript
// Find this line (around line 2):
const ETHERSCAN_API_KEY = 'YOUR_API_KEY_HERE';

// Replace with your actual API key:
const ETHERSCAN_API_KEY = 'paste_your_api_key_here';
```

### API Selection Logic

The app automatically selects the best API:

```javascript
// Historical Data (for the rainbow chart):
CoinCap → Binance → CoinGecko

// Current Price (for display panel):
Etherscan (if key provided) OR fallback to Binance
```

**Current Behavior:**
- ✅ Binance is successfully fetching 449 historical data points
- ✅ Etherscan is being used to verify the current price
- ❌ CoinCap is failing (CORS/network issue, but that's okay - Binance is working!)

### What If I Don't Add an Etherscan API Key?

The application will still work perfectly!
- Historical data from Binance/CoinCap (full functionality)
- Current price from the historical data endpoint (slightly less precise)
- No issues with the rainbow chart calculation

### Alternative APIs

If you experience issues with all APIs, you can add other data sources by editing `js/app.js`:

- **CryptoCompare**: Free tier available
- **Bitfinex**: Public API, no key required
- **Kraken**: Public API available

## Cache Configuration

The application caches data for 1 hour by default to reduce API calls.

To change cache duration, edit `js/app.js`:

```javascript
// Find this line (around line 54):
this.cacheExpiry = 3600000; // 1 hour in milliseconds

// Change to desired duration:
this.cacheExpiry = 1800000; // 30 minutes
// or
this.cacheExpiry = 7200000; // 2 hours
```

## Deployment

No configuration needed for deployment. Simply upload all files to your hosting provider.

For static hosting:
- GitHub Pages
- Netlify
- Vercel
- Any static file hosting service

The app is designed to work as a pure static site with no backend requirements.