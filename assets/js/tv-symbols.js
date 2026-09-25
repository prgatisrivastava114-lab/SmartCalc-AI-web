/**
 * MyFinancialPlan.in - Centralized TradingView Market Symbols & Widget Manager
 * Single source of truth for all TradingView market data embeds across web & app.
 *
 * Total API / Data Cost: ₹0
 * No paid APIs, no API keys required, no web scraping, no fake prices.
 */

window.MARKET_SYMBOLS = {
  // 1. Indian Indices
  indianIndices: [
    { symbol: "INDEX:NIFTY", name: "NIFTY 50" },
    { symbol: "BSE:SENSEX", name: "SENSEX" },
    { symbol: "NSE:NIFTYBANK", name: "NIFTY BANK" },
    { symbol: "NSE:NIFTYIT", name: "NIFTY IT" },
    { symbol: "NSE:NIFTYMIDCAP50", name: "NIFTY MIDCAP 50" }
  ],

  // 2. Top Indian Equities
  indianEquities: [
    { symbol: "NSE:ICICIBANK", name: "ICICI Bank" },
    { symbol: "NSE:INFY", name: "Infosys" },
    { symbol: "NSE:SBIN", name: "State Bank of India" },
    { symbol: "NSE:BHARTIARTL", name: "Bharti Airtel" },
    { symbol: "NSE:LT", name: "Larsen & Toubro" },
    { symbol: "NSE:RELIANCE", name: "Reliance Industries" },
    { symbol: "NSE:HDFCBANK", name: "HDFC Bank" },
    { symbol: "NSE:TCS", name: "TCS" },
    { symbol: "NSE:TATAMOTORS", name: "Tata Motors" },
    { symbol: "NSE:AXISBANK", name: "Axis Bank" },
    { symbol: "NSE:KOTAKBANK", name: "Kotak Bank" },
    { symbol: "NSE:SUNPHARMA", name: "Sun Pharma" },
    { symbol: "NSE:MARUTI", name: "Maruti Suzuki" },
    { symbol: "NSE:TITAN", name: "Titan" },
    { symbol: "NSE:TATASTEEL", name: "Tata Steel" },
    { symbol: "NSE:BAJFINANCE", name: "Bajaj Finance" }
  ],

  // 3. Global Indices
  globalIndices: [
    { symbol: "SP:SPX", name: "S&P 500" },
    { symbol: "NASDAQ:NDX", name: "NASDAQ 100" },
    { symbol: "TVC:DJI", name: "Dow Jones" },
    { symbol: "INDEX:UKX", name: "FTSE 100" },
    { symbol: "INDEX:DAX", name: "DAX" },
    { symbol: "TVC:NI225", name: "Nikkei 225" },
    { symbol: "INDEX:HSI", name: "Hang Seng" }
  ],

  // 4. Commodities
  commodities: [
    { symbol: "TVC:GOLD", name: "Gold" },
    { symbol: "TVC:SILVER", name: "Silver" },
    { symbol: "TVC:USOIL", name: "WTI Crude Oil" },
    { symbol: "TVC:UKOIL", name: "Brent Crude" },
    { symbol: "TVC:NATGAS", name: "Natural Gas" }
  ],

  // 5. Currencies
  currencies: [
    { symbol: "FX_IDC:USDINR", name: "USD/INR" },
    { symbol: "FX_IDC:EURINR", name: "EUR/INR" },
    { symbol: "FX_IDC:GBPINR", name: "GBP/INR" },
    { symbol: "FX_IDC:EURUSD", name: "EUR/USD" },
    { symbol: "FX_IDC:GBPUSD", name: "GBP/USD" },
    { symbol: "FX_IDC:USDJPY", name: "USD/JPY" }
  ]
};

/**
 * Validates symbol format (MUST be EXCHANGE:SYMBOL)
 */
window.validateTvSymbol = function(item) {
  if (!item || !item.symbol) return null;
  var sym = String(item.symbol).trim();
  if (sym.indexOf(':') === -1) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[TradingView] Rejected bare or invalid symbol (missing EXCHANGE: prefix):', sym);
    }
    return null;
  }
  return { symbol: sym, name: item.name || sym };
};

/**
 * Builds validated symbols array for Market Overview widget tabs
 */
window.getTvOverviewTabs = function() {
  var cfg = window.MARKET_SYMBOLS;

  function buildTabSymbols(arr) {
    var valid = [];
    if (!arr) return valid;
    arr.forEach(function(item) {
      var v = window.validateTvSymbol(item);
      if (v) {
        valid.push({ s: v.symbol, d: v.name });
      }
    });
    return valid;
  }

  return [
    { title: "Indian Indices", symbols: buildTabSymbols(cfg.indianIndices) },
    { title: "Top Indian Equities", symbols: buildTabSymbols(cfg.indianEquities) },
    { title: "Global Indices", symbols: buildTabSymbols(cfg.globalIndices) },
    { title: "Commodities", symbols: buildTabSymbols(cfg.commodities) },
    { title: "Currencies", symbols: buildTabSymbols(cfg.currencies) }
  ];
};

/**
 * Builds validated symbols array for Ticker Tape widget
 */
window.getTvTickerTapeSymbols = function() {
  var tapeList = [
    { symbol: "INDEX:NIFTY", name: "NIFTY 50" },
    { symbol: "BSE:SENSEX", name: "SENSEX" },
    { symbol: "NSE:ICICIBANK", name: "ICICI BANK" },
    { symbol: "NSE:INFY", name: "INFOSYS" },
    { symbol: "NSE:SBIN", name: "SBI" },
    { symbol: "NSE:BHARTIARTL", name: "AIRTEL" },
    { symbol: "TVC:GOLD", name: "GOLD 24K" },
    { symbol: "TVC:USOIL", name: "CRUDE OIL" },
    { symbol: "FX_IDC:USDINR", name: "USD/INR" }
  ];

  var valid = [];
  tapeList.forEach(function(item) {
    var v = window.validateTvSymbol(item);
    if (v) {
      valid.push({ proName: v.symbol, title: v.name });
    }
  });
  return valid;
};

/**
 * Single TradingView Widget Initializer with Error & WebView Fallback Handling
 */
window.initTradingViewWidgets = function() {
  // 1. Initialize Ticker Tape Containers
  var tickerContainers = document.querySelectorAll('.tv-ticker-tape-container');
  tickerContainers.forEach(function(container) {
    if (container.dataset.tvInitialized || container.querySelector('script')) return;
    container.dataset.tvInitialized = 'true';

    var widgetBox = container.querySelector('.tradingview-widget-container__widget');
    if (!widgetBox) {
      widgetBox = document.createElement('div');
      widgetBox.className = 'tradingview-widget-container__widget';
      container.appendChild(widgetBox);
    }

    var symbols = window.getTvTickerTapeSymbols();
    var config = {
      symbols: symbols,
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: false,
      displayMode: "regular",
      locale: "in"
    };

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);
  });

  // 2. Initialize Market Overview Containers
  var overviewContainers = document.querySelectorAll('.tv-market-overview-container');
  overviewContainers.forEach(function(container) {
    if (container.dataset.tvInitialized) return;
    container.dataset.tvInitialized = 'true';

    var widgetBox = container.querySelector('.tradingview-widget-container__widget');
    if (!widgetBox) {
      widgetBox = document.createElement('div');
      widgetBox.className = 'tradingview-widget-container__widget';
      container.appendChild(widgetBox);
    }

    var tabs = window.getTvOverviewTabs();
    var config = {
      colorTheme: "light",
      dateRange: "12M",
      showChart: true,
      locale: "in",
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: "100%",
      height: "500",
      plotLineColorGrowing: "rgba(14, 157, 120, 1)",
      plotLineColorFalling: "rgba(214, 69, 69, 1)",
      gridLineColor: "rgba(240, 243, 250, 0.6)",
      scaleFontColor: "rgba(19, 23, 34, 1)",
      belowLineFillColorGrowing: "rgba(221, 244, 236, 0.5)",
      belowLineFillColorFalling: "rgba(253, 234, 234, 0.5)",
      belowLineFillColorGrowingBottom: "rgba(221, 244, 236, 0)",
      belowLineFillColorFallingBottom: "rgba(253, 234, 234, 0)",
      symbolActiveColor: "rgba(76, 98, 206, 0.12)",
      tabs: tabs
    };

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.onerror = function() {
      // Graceful fallback for restricted WebViews or offline environments
      var fallbackMsg = container.querySelector('.tv-fallback-msg');
      if (fallbackMsg) fallbackMsg.style.display = 'block';
    };
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initTradingViewWidgets);
} else {
  window.initTradingViewWidgets();
}
