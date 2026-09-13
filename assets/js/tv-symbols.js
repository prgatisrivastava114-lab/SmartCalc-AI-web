/**
 * MyFinancialPlan.in - Centralized TradingView Symbol Configuration
 * Single source of truth for all TradingView market data widgets.
 */

window.TV_MARKET_CONFIG = {
  // Group 1: Indian Indices
  indianIndices: [
    { s: "BSE:SENSEX", d: "SENSEX" },
    { s: "INDEX:NIFTY", d: "NIFTY 50" },
    { s: "NSE:NIFTYBANK", d: "BANK NIFTY" },
    { s: "NSE:NIFTYIT", d: "NIFTY IT" }
  ],

  // Group 2: Top Indian Equities
  topIndianEquities: [
    { s: "NSE:RELIANCE", d: "Reliance Industries" },
    { s: "NSE:HDFCBANK", d: "HDFC Bank" },
    { s: "NSE:TCS", d: "TCS" },
    { s: "NSE:ICICIBANK", d: "ICICI Bank" },
    { s: "NSE:INFY", d: "Infosys" },
    { s: "NSE:SBIN", d: "State Bank of India" },
    { s: "NSE:BHARTIARTL", d: "Bharti Airtel" },
    { s: "NSE:ITC", d: "ITC" },
    { s: "NSE:LT", d: "Larsen & Toubro" },
    { s: "NSE:TATAMOTORS", d: "Tata Motors" },
    { s: "NSE:AXISBANK", d: "Axis Bank" },
    { s: "NSE:KOTAKBANK", d: "Kotak Bank" },
    { s: "NSE:SUNPHARMA", d: "Sun Pharma" },
    { s: "NSE:MARUTI", d: "Maruti Suzuki" },
    { s: "NSE:TITAN", d: "Titan" },
    { s: "NSE:TATASTEEL", d: "Tata Steel" },
    { s: "NSE:BAJFINANCE", d: "Bajaj Finance" }
  ],

  // Group 3: Global Indices
  globalIndices: [
    { s: "SP:SPX", d: "S&P 500" },
    { s: "NASDAQ:NDX", d: "NASDAQ 100" },
    { s: "TVC:DJI", d: "DOW JONES" }
  ],

  // Group 4: Commodities
  commodities: [
    { s: "TVC:GOLD", d: "Gold 24K" },
    { s: "TVC:SILVER", d: "Silver" },
    { s: "TVC:USOIL", d: "Crude Oil" }
  ],

  // Group 5: Currencies
  currencies: [
    { s: "FX_IDC:USDINR", d: "USD / INR" },
    { s: "FX_IDC:EURINR", d: "EUR / INR" },
    { s: "FX_IDC:GBPINR", d: "GBP / INR" }
  ]
};

/**
 * Validate and build ticker tape symbols array
 */
window.getTvTickerSymbols = function() {
  var cfg = window.TV_MARKET_CONFIG;
  var items = [];

  function addGroup(arr) {
    if (!arr) return;
    arr.forEach(function(item) {
      if (item && item.s && item.s.indexOf(':') !== -1) {
        items.push({ proName: item.s, title: item.d });
      } else if (item && item.fallback && item.fallback.indexOf(':') !== -1) {
        items.push({ proName: item.fallback, title: item.d });
      } else {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[TradingView] Invalid or unmapped symbol skipped:', item);
        }
      }
    });
  }

  addGroup(cfg.indianIndices);
  addGroup(cfg.currencies);
  addGroup(cfg.commodities);
  addGroup(cfg.topIndianEquities);
  addGroup(cfg.globalIndices);

  return items;
};

/**
 * Validate and build market overview tabs array
 */
window.getTvOverviewTabs = function() {
  var cfg = window.TV_MARKET_CONFIG;

  function filterSymbols(arr) {
    if (!arr) return [];
    return arr.filter(function(item) {
      if (item && item.s && item.s.indexOf(':') !== -1) return true;
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[TradingView] Invalid symbol removed from tab:', item);
      }
      return false;
    });
  }

  return [
    { title: "Indian Indices", symbols: filterSymbols(cfg.indianIndices) },
    { title: "Top Indian Equities", symbols: filterSymbols(cfg.topIndianEquities) },
    { title: "Global Indices", symbols: filterSymbols(cfg.globalIndices) },
    { title: "Commodities", symbols: filterSymbols(cfg.commodities) },
    { title: "Currencies", symbols: filterSymbols(cfg.currencies) }
  ];
};

/**
 * Single Centralized TradingView Widget Initializer
 */
window.initTradingViewWidgets = function() {
  // 1. Ticker Tape Containers
  var tickerContainers = document.querySelectorAll('.tv-ticker-tape-container');
  tickerContainers.forEach(function(container) {
    if (container.dataset.tvInitialized) return;
    container.dataset.tvInitialized = 'true';

    var widgetBox = container.querySelector('.tradingview-widget-container__widget');
    if (!widgetBox) {
      widgetBox = document.createElement('div');
      widgetBox.className = 'tradingview-widget-container__widget';
      container.appendChild(widgetBox);
    }

    var symbols = window.getTvTickerSymbols();
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

  // 2. Market Overview Containers
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
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initTradingViewWidgets);
} else {
  window.initTradingViewWidgets();
}
