/**
 * AIOS 实时数据加载器 — 所有可视化面板共用
 * 从 GitHub Pages data/ 目录拉取实时JSON
 */
const AIOS_DATA_BASE = 'https://ninghan1980.github.io/aios-visual/data';

const AIOSData = {
  _cache: {},
  _cacheTime: {},
  TTL: 30000, // 30秒缓存

  async fetch(name) {
    const now = Date.now();
    if (this._cache[name] && (now - this._cacheTime[name]) < this.TTL) {
      return this._cache[name];
    }
    try {
      const r = await fetch(`${AIOS_DATA_BASE}/${name}?t=${now}`);
      if (!r.ok) return this._cache[name] || null;
      const data = await r.json();
      this._cache[name] = data;
      this._cacheTime[name] = now;
      return data;
    } catch(e) {
      console.warn(`AIOSData fetch ${name} failed:`, e);
      return this._cache[name] || null;
    }
  },

  async system() { return this.fetch('system_status.json'); },
  async aether() { return this.fetch('aether_status.json'); },
  async token() { return this.fetch('token_stats.json'); },
  async activities() { return this.fetch('activities.json'); },

  async all() {
    const [sys, aether, token, act] = await Promise.all([
      this.system(), this.aether(), this.token(), this.activities()
    ]);
    return { sys, aether, token, act };
  },

  // 状态颜色
  statusColor(status) {
    return status === 'online' ? '#3fb950' : status === 'offline' || status === 'banned' ? '#f85149' : '#d29922';
  },

  // 格式化数字
  fmtNum(n) {
    if (n >= 1000000) return (n/10000).toFixed(0) + '万';
    if (n >= 10000) return (n/10000).toFixed(1) + '万';
    if (n >= 1000) return (n/1000).toFixed(1) + 'K';
    return String(n);
  },

  fmtTime(iso) {
    if (!iso) return '--';
    return iso.replace(/.*T(\d{2}:\d{2}).*/, '$1');
  }
};

// 自动刷新工具
function autoRefresh(fn, intervalMs = 60000) {
  fn();
  return setInterval(fn, intervalMs);
}
