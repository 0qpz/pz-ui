const L = {
  debug: !1,
  log: "info"
}, I = ["log"], O = [
  "pz-ui",
  "config.js",
  "node_modules",
  "vite",
  "webpack",
  "rollup",
  "chunk"
  // 有时候打包会生成 chunk-xxxx.js
];
function M() {
  const e = new Error().stack;
  if (!e) return "未知位置";
  const t = e.split(`
`);
  for (let s = 2; s < t.length; s++) {
    const o = t[s].trim();
    if (!o) continue;
    const r = o.match(/\((.+):(\d+):(\d+)\)$/) || o.match(/at (.+):(\d+):(\d+)$/);
    if (r) {
      const c = r[1] || r[4], i = r[2] || r[5], l = c.split("/").pop().split("\\").pop().split("?")[0];
      if (O.some((a) => c.includes(a)) || c.includes("runtime-core") || c.includes("runtime-dom"))
        continue;
      return l === "anonymous" || l === "empty" || l.endsWith(".html") ? `${l}:${i} (内联脚本)` : l.endsWith(".vue") ? `${l}:${i}` : `${l}:${i}`;
    }
  }
  const n = t.find((s) => s.includes("at HTML") || s.includes("at Proxy"));
  return n ? `事件处理器 (${n.trim().substring(0, 30)}...)` : "内联脚本 (请检查绑定该事件的组件)";
}
const N = {
  Get(e) {
    return L[e];
  },
  Debug() {
    L.debug = !0;
    const e = M(), t = [
      "background: #fffbe6",
      "color: #d32f2f",
      "padding: 6px 10px",
      "border-radius: 4px",
      "font-weight: bold",
      "font-family: Consolas, monospace",
      "border: 1px solid #ffc107",
      "font-size: 13px",
      "display: inline-block"
    ].join(";"), n = `⚠️ 调试模式已开启！上线前请移除，位置：${e}`;
    console.log(`%c ${n}`, t);
  },
  SetKey(e, t) {
    if (!I.includes(e)) {
      console.warn(`禁止修改配置：${e}`);
      return;
    }
    L[e] = t, console.log(`已修改配置：${e} = ${t}`);
  }
}, V = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
}, y = {
  debug: "#909399",
  // 灰色
  info: "#409EFF",
  // 蓝色
  warn: "#E6A23C",
  // 橙色
  error: "#F56C6C"
  // 红色
}, F = {
  _shouldLog(e) {
    if (N.Get("debug") !== !0) return !1;
    const t = N.Get("log"), n = V[t] || 2;
    return (V[e] || 2) >= n;
  },
  /**
   * 简单获取调用位置 (文件名:行号)
   * 优化：清理掉 URL 中的查询参数（如 ?_ijt=...），让显示更干净
   */
  _getLocation() {
    const t = new Error().stack.split(`
`), n = t[4] || t[5];
    if (!n) return "";
    const s = n.match(/([^)]+):\d+:\d+/);
    if (s) {
      let r = s[1].split("/").pop().split("\\").pop();
      r = r.split("?")[0];
      const c = n.match(/:(\d+):\d+/), i = c ? c[1] : "";
      return `${r}:${i}`;
    }
    return "";
  },
  _print(e, t, ...n) {
    const s = (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour12: !1 }), o = this._getLocation(), r = y[e] || "#333", c = e.toUpperCase(), i = e === "error" ? console.error : e === "warn" ? console.warn : console.log;
    let l = "", u = "";
    o && (l = ` (${o})`, u = "color: #aaa; font-style: italic; font-size: 0.9em;"), i(
      `%c[${c}]%c ${s} %c${t}%c${l}`,
      `color: ${r}; font-weight: bold;`,
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
function v(e) {
  if (!e || !e.startsWith("background-"))
    return null;
  const t = e.substring(11);
  return k.test(t) ? { "background-color": "#" + t } : D.test(t) ? { "background-color": "#" + G(t) } : { "background-color": t };
}
const k = /^[0-9a-fA-F]{6}$/, D = /^[0-9a-fA-F]{3}$/;
function G(e) {
  return e.split("").map((t) => t + t).join("");
}
function H(e) {
  if (!e) return null;
  const t = Z.get(e);
  return t === void 0 ? null : { display: t };
}
const W = "block", j = "inline", X = "inline-block", U = "none !important", K = "flex", B = "inline-flex", Y = "grid", q = "inline-grid", Z = /* @__PURE__ */ new Map([
  ["block", W],
  ["inline", j],
  ["inline-block", X],
  // 关键优化：直接存储处理后的值，运行时无需判断 "是不是 none"
  ["none", U],
  ["flex", K],
  ["inline-flex", B],
  ["grid", Y],
  ["inline-grid", q]
]);
function J(e) {
  if (!e || !e.startsWith("fx-"))
    return null;
  let t = he.get(e);
  return t !== void 0 ? { "flex-direction": t } : (t = Le.get(e), t !== void 0 ? { "flex-wrap": t } : (t = Ce.get(e), t !== void 0 ? { "justify-content": t } : (t = xe(e), t !== null ? { "flex-grow": t } : (t = me.get(e), t !== void 0 ? { "align-items": t } : (t = Ne.get(e), t !== void 0 ? { "align-content": t } : null)))));
}
const Q = /^fx-grow(?:-(\d+))?$/, ee = "row", te = "row-reverse", ne = "column", se = "column-reverse", oe = "wrap", re = "wrap-reverse", ce = "nowrap", P = "flex-start", T = "flex-end", $ = "center", le = "space-between", ae = "space-around", ie = "space-evenly", ue = "stretch", fe = "baseline", de = "flex-start", _e = "flex-end", pe = "center", Ae = "space-between", Ee = "space-around", ge = "stretch", he = /* @__PURE__ */ new Map([
  ["fx-row", ee],
  ["fx-rows", te],
  ["fx-col", ne],
  ["fx-cols", se]
]), Le = /* @__PURE__ */ new Map([
  ["fx-wrap", oe],
  ["fx-wraps", re],
  ["fx-nowrap", ce]
]), Ce = /* @__PURE__ */ new Map([
  ["fx-jc-start", P],
  ["fx-jc-end", T],
  ["fx-jc-center", $],
  ["fx-jc-between", le],
  ["fx-jc-around", ae],
  ["fx-jc-evenly", ie]
]), me = /* @__PURE__ */ new Map([
  ["fx-ai-start", P],
  ["fx-ai-end", T],
  ["fx-ai-center", $],
  ["fx-ai-stretch", ue],
  ["fx-ai-baseline", fe]
]), Ne = /* @__PURE__ */ new Map([
  ["fx-ac-start", de],
  ["fx-ac-end", _e],
  ["fx-ac-center", pe],
  ["fx-ac-between", Ae],
  ["fx-ac-around", Ee],
  ["fx-ac-stretch", ge]
]);
function xe(e) {
  const t = Q.exec(e);
  return t ? t[1] !== void 0 ? t[1] : "1" : null;
}
const z = " ", S = [
  // Display 布局（最高频）
  H,
  // Flexbox 布局（最高频）
  J,
  // 背景色（高频）
  v
  // ↓ 在这里添加更多解析器 ↓
  // parseColor,      // 文本颜色
  // parseMargin,     // 外边距
  // parsePadding,    // 内边距
  // parseGrid,       // Grid 布局
  // parseBorder,     // 边框
  // parseSize,       // 宽高尺寸
  // parsePosition,   // 定位
  // ... 更多解析器
], E = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Map(), we = 1e3;
function R(e) {
  if (!e) return null;
  if (E.has(e))
    return E.get(e);
  const t = S.length;
  for (let n = 0; n < t; n++) {
    const s = S[n](e);
    if (s)
      return E.set(e, s), s;
  }
  return E.set(e, null), null;
}
function Ve(e) {
  if (!e) return {};
  if (d.has(e))
    return d.get(e);
  if (!e.includes(z)) {
    const o = R(e) || {};
    return d.set(e, o), o;
  }
  const t = e.split(z), n = {}, s = t.length;
  for (let o = 0; o < s; o++) {
    const r = t[o].trim();
    if (!r) continue;
    const c = R(r);
    c && Object.assign(n, c);
  }
  if (d.size >= we) {
    const o = d.keys().next().value;
    d.delete(o);
  }
  return d.set(e, n), n;
}
const p = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
let ze = 0;
const m = /* @__PURE__ */ new Map(), Se = /* @__PURE__ */ new Map();
let A = null, b = null;
function Re(e) {
  let t = 0;
  for (let n = 0; n < e.length; n++) {
    const s = e.charCodeAt(n);
    t = (t << 5) - t + s, t = t & t;
  }
  return Math.abs(t).toString(36);
}
function be() {
  return A || (A = document.createElement("style"), A.setAttribute("data-pz-auto", "true"), document.head.appendChild(A), b = A.sheet), b;
}
function Pe(e) {
  if (m.has(e))
    return m.get(e);
  const t = ++ze;
  return m.set(e, t), Se.set(t, e), t;
}
function x(e) {
  if (p.has(e))
    return p.get(e);
  const t = Ve(e), n = Object.keys(t);
  if (n.length === 0)
    return null;
  const s = [], o = n.length;
  for (let a = 0; a < o; a++) {
    const f = n[a], _ = t[f], h = Pe(`${f}:${_}`);
    s.push(h);
  }
  const r = s.join("-");
  if (g.has(r)) {
    const a = g.get(r);
    return p.set(e, a), a;
  }
  let c = "";
  for (let a = 0; a < o; a++) {
    const f = n[a];
    let _ = t[f];
    const h = f.replace(/([A-Z])/g, "-$1").toLowerCase();
    _.includes(" !important") && (_ = _.replace(" !important", "!important")), a > 0 && (c += ";"), c += `${h}:${_}`;
  }
  if (C.has(c)) {
    const a = C.get(c);
    return g.set(r, a), p.set(e, a), a;
  }
  const l = `pz-${Re(c)}`, u = be();
  try {
    const a = `.${l}{${c}}`, f = u.cssRules ? u.cssRules.length : 0;
    u.insertRule(a, f);
  } catch {
  }
  return C.set(c, l), g.set(r, l), p.set(e, l), l;
}
const g = /* @__PURE__ */ new Map();
function Te() {
  const e = document.querySelectorAll("[data-pz]"), t = e.length;
  if (t !== 0)
    for (let n = 0; n < t; n++) {
      const s = e[n], o = s.dataset.pz || s.getAttribute("data-pz");
      if (!(s._pzProcessed && s._pzValue === o) && o)
        try {
          const r = x(o);
          r && (s._pzClassName && s._pzClassName !== r && s.classList.remove(s._pzClassName), s.classList.add(r), s._pzClassName = r), s._pzProcessed = !0, s._pzValue = o;
        } catch {
        }
    }
}
const w = {
  Config: N,
  Log: F,
  install(e) {
    console.log("✅ 破竹 UI (Pz) 已就绪");
    let t = null;
    e.directive("pz", {
      mounted(n, s) {
        const o = s.value;
        o && (t || (t = [], Promise.resolve().then(() => {
          const r = t;
          t = null;
          for (let c = 0; c < r.length; c++) {
            const i = r[c], l = x(i.pzValue);
            l && (i.el.classList.add(l), i.el._pzClassName = l, i.el._pzProcessed = !0, i.el._pzValue = i.pzValue);
          }
        })), t.push({ el: n, pzValue: o }));
      },
      updated(n, s) {
        const o = s.value, r = s.oldValue;
        if (o !== r)
          if (n._pzClassName && n.classList.remove(n._pzClassName), o) {
            const c = x(o);
            c && (n.classList.add(c), n._pzClassName = c), n._pzProcessed = !0, n._pzValue = o;
          } else
            delete n._pzProcessed, delete n._pzValue;
      },
      unmounted(n) {
        delete n._pzProcessed, delete n._pzValue, delete n._pzClassName;
      }
    }), e.provide("Pz", w), e.config.globalProperties.Pz = w;
  }
};
if (typeof window < "u") {
  const e = () => {
    Te();
  };
  document.readyState === "complete" || document.readyState === "interactive" ? e() : document.addEventListener("DOMContentLoaded", e), window.Pz = w;
}
export {
  w as default
};
//# sourceMappingURL=pz-ui.es.js.map
