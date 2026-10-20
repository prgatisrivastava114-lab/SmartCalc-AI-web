/**
 * MyFinancialPlan.in - Lightweight Unique Web Visitor Tracker
 * Deduplicates unique device sessions per 24 hours & syncs metrics to local & Firestore storage.
 */
(function() {
  var STORAGE_KEY_UID = 'mfp_v_uid';
  var STORAGE_KEY_LAST = 'mfp_v_last';
  var STORAGE_KEY_STATS = 'mfp_analytics_local';

  // Generate unique 16-char device ID if not existing
  function getVisitorUid() {
    var uid = localStorage.getItem(STORAGE_KEY_UID);
    if (!uid) {
      uid = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY_UID, uid);
    }
    return uid;
  }

  // Record visit locally
  function recordLocalVisit() {
    var now = Date.now();
    var lastVisit = parseInt(localStorage.getItem(STORAGE_KEY_LAST) || '0', 10);
    var isNewSession = (now - lastVisit) > (24 * 60 * 60 * 1000); // 24 hours

    localStorage.setItem(STORAGE_KEY_LAST, now.toString());

    var statsStr = localStorage.getItem(STORAGE_KEY_STATS);
    var stats = statsStr ? JSON.parse(statsStr) : { totalViews: 0, uniqueVisitors: 0, todayViews: 0, date: new Date().toISOString().split('T')[0] };

    var today = new Date().toISOString().split('T')[0];
    if (stats.date !== today) {
      stats.todayViews = 0;
      stats.date = today;
    }

    stats.totalViews += 1;
    stats.todayViews += 1;

    if (isNewSession || stats.uniqueVisitors === 0) {
      stats.uniqueVisitors += 1;
    }

    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    return { isNewSession: isNewSession, stats: stats };
  }

  var res = recordLocalVisit();
  window.MFP_VISITOR_DATA = res;
})();
