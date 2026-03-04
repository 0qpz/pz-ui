const d = {
  debug: !1,
  log: "info"
}, _ = ["log"], C = [
  "pz-ui",
  "config.js",
  "node_modules",
  "vite",
  "webpack",
  "rollup",
  "chunk"
  // 有时候打包会生成 chunk-xxxx.js
];
function L() {
  const e = new Error().stack;
  if (!e) return "未知位置";
  const t = e.split(`
`);
  for (let n = 2; n < t.length; n++) {
    const r = t[n].trim();
    if (!r) continue;
    const s = r.match(/\((.+):(\d+):(\d+)\)$/) || r.match(/at (.+):(\d+):(\d+)$/);
    if (s) {
      const c = s[1] || s[4], a = s[2] || s[5], l = c.split("/").pop().split("\\").pop().split("?")[0];
      if (C.some((b) => c.includes(b)) || c.includes("runtime-core") || c.includes("runtime-dom"))
        continue;
      return l === "anonymous" || l === "empty" || l.endsWith(".html") ? `${l}:${a} (内联脚本)` : l.endsWith(".vue") ? `${l}:${a}` : `${l}:${a}`;
    }
  }
  const o = t.find((n) => n.includes("at HTML") || n.includes("at Proxy"));
  return o ? `事件处理器 (${o.trim().substring(0, 30)}...)` : "内联脚本 (请检查绑定该事件的组件)";
}
const p = {
  Get(e) {
    return d[e];
  },
  Debug() {
    d.debug = !0;
    const e = L(), t = [
      "background: #fffbe6",
      "color: #d32f2f",
      "padding: 6px 10px",
      "border-radius: 4px",
      "font-weight: bold",
      "font-family: Consolas, monospace",
      "border: 1px solid #ffc107",
      "font-size: 13px",
      "display: inline-block"
    ].join(";"), o = `⚠️ 调试模式已开启！上线前请移除，位置：${e}`;
    console.log(`%c ${o}`, t);
  },
  SetKey(e, t) {
    if (!_.includes(e)) {
      console.warn(`禁止修改配置：${e}`);
      return;
    }
    d[e] = t, console.log(`已修改配置：${e} = ${t}`);
  }
}, z = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
}, $ = {
  debug: "#909399",
  // 灰色
  info: "#409EFF",
  // 蓝色
  warn: "#E6A23C",
  // 橙色
  error: "#F56C6C"
  // 红色
}, w = {
  _shouldLog(e) {
    if (p.Get("debug") !== !0) return !1;
    const t = p.Get("log"), o = z[t] || 2;
    return (z[e] || 2) >= o;
  },
  /**
   * 简单获取调用位置 (文件名:行号)
   * 优化：清理掉 URL 中的查询参数（如 ?_ijt=...），让显示更干净
   */
  _getLocation() {
    const t = new Error().stack.split(`
`), o = t[4] || t[5];
    if (!o) return "";
    const n = o.match(/([^)]+):\d+:\d+/);
    if (n) {
      let s = n[1].split("/").pop().split("\\").pop();
      s = s.split("?")[0];
      const c = o.match(/:(\d+):\d+/), a = c ? c[1] : "";
      return `${s}:${a}`;
    }
    return "";
  },
  _print(e, t, ...o) {
    const n = (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour12: !1 }), r = this._getLocation(), s = $[e] || "#333", c = e.toUpperCase(), a = e === "error" ? console.error : e === "warn" ? console.warn : console.log;
    let l = "", u = "";
    r && (l = ` (${r})`, u = "color: #aaa; font-style: italic; font-size: 0.9em;"), a(
      `%c[${c}]%c ${n} %c${t}%c${l}`,
      `color: ${s}; font-weight: bold;`,
      // 1. 级别样式
      "color: #999; font-size: 0.9em;",
      // 2. 时间样式
      "color: #FAFAFAFF;",
      // 3. 消息样式 (保持默认黑，方便阅读)
      u
      // 4. 位置样式
    );
  },
  debug(e, ...t) {
    this._shouldLog("debug") && this._print("debug", e, ...t);
  },
  info(e, ...t) {
    this._shouldLog("info") && this._print("info", e, ...t);
  },
  warn(e, ...t) {
    this._shouldLog("warn") && this._print("warn", e, ...t);
  },
  error(e, ...t) {
    this._shouldLog("error") && this._print("error", e, ...t);
  }
};
function P(e) {
  if (!e) return {};
  const t = {};
  if (typeof e == "string" && e.startsWith("background-")) {
    const o = e.substring(11);
    /^[0-9a-fA-F]{6}$/.test(o) ? t["background-color"] = "#" + o : t["background-color"] = o;
  }
  return t;
}
const f = /* @__PURE__ */ new Map();
let i = null;
function y(e) {
  let t = 0;
  for (let o = 0; o < e.length; o++) {
    const n = e.charCodeAt(o);
    t = (t << 5) - t + n, t = t & t;
  }
  return Math.abs(t).toString(36);
}
function N() {
  return i || (i = document.createElement("style"), i.setAttribute("data-pz-auto", "true"), document.head.appendChild(i)), i;
}
function h(e) {
  const o = `pz-${y(e)}`;
  if (f.has(e))
    return f.get(e);
  const n = P(e), r = Object.entries(n);
  if (r.length === 0)
    return null;
  const s = r.map(([a, l]) => `${a.replace(/([A-Z])/g, "-$1").toLowerCase()}:${l}`).join(";"), c = N();
  return c.textContent += `.${o}{${s}}`, f.set(e, o), o;
}
function m() {
  const e = document.querySelectorAll("[data-pz]"), t = e.length;
  if (t !== 0)
    for (let o = 0; o < t; o++) {
      const n = e[o], r = n.dataset.pz || n.getAttribute("data-pz");
      if (!(n._pzProcessed && n._pzValue === r) && r)
        try {
          const s = h(r);
          s && (n._pzClassName && n._pzClassName !== s && n.classList.remove(n._pzClassName), n.classList.add(s), n._pzClassName = s), n._pzProcessed = !0, n._pzValue = r;
        } catch {
        }
    }
}
function E() {
  let e = !1;
  const t = new MutationObserver((o) => {
    if (e) return;
    let n = !1;
    for (let r = 0; r < o.length; r++) {
      const s = o[r];
      if (s.type === "attributes" && s.attributeName === "data-pz") {
        n = !0;
        const c = s.target;
        (c.dataset.pz || c.getAttribute("data-pz")) !== c._pzValue && (c._pzProcessed = !1);
      }
    }
    n && (e = !0, Promise.resolve().then(() => {
      m(), e = !1;
    }));
  });
  return t.observe(document.documentElement, {
    attributes: !0,
    subtree: !0
  }), t;
}
const g = {
  Config: p,
  Log: w,
  install(e) {
    console.log("✅ 破竹 UI (Pz) 已就绪");
    let t = null;
    e.directive("pz", {
      mounted(o, n) {
        const r = n.value;
        r && (t || (t = [], Promise.resolve().then(() => {
          const s = t;
          t = null;
          for (let c = 0; c < s.length; c++) {
            const a = s[c], l = h(a.pzValue);
            l && (a.el.classList.add(l), a.el._pzClassName = l, a.el._pzProcessed = !0, a.el._pzValue = a.pzValue);
          }
        })), t.push({ el: o, pzValue: r }));
      },
      updated(o, n) {
        const r = n.value, s = n.oldValue;
        if (r !== s)
          if (o._pzClassName && o.classList.remove(o._pzClassName), r) {
            const c = h(r);
            c && (o.classList.add(c), o._pzClassName = c), o._pzProcessed = !0, o._pzValue = r;
          } else
            delete o._pzProcessed, delete o._pzValue;
      },
      unmounted(o) {
        delete o._pzProcessed, delete o._pzValue, delete o._pzClassName;
      }
    }), e.provide("Pz", g), e.config.globalProperties.Pz = g;
  }
};
if (typeof window < "u") {
  const e = () => {
    m(), E();
  };
  document.readyState === "complete" || document.readyState === "interactive" ? e() : document.addEventListener("DOMContentLoaded", e), new MutationObserver(() => {
    m();
  }).observe(document.body, { childList: !0, subtree: !0 }), window.Pz = g;
}
export {
  g as default
};
//# sourceMappingURL=pz-ui.es.js.map
