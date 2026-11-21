import * as opentype from "https://esm.sh/opentype.js@1.3.4";
import { domToCanvas } from "https://esm.sh/modern-screenshot@4.4.39";
import { Muxer, ArrayBufferTarget } from "https://esm.sh/mp4-muxer@5.1.3";

// ==========================================
// 1. フォント定数レジストリ & 平成定型文リスト
// ==========================================
const FONT_REGISTRY = {
  "Dela Gothic One": {
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/dela-gothic-one@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/delagothicone/DelaGothicOne-Regular.ttf"
  },
  "Reggae One": {
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/reggae-one@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/reggaeone/ReggaeOne-Regular.ttf"
  },
  "RocknRoll One": {
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/rocknroll-one@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/rocknrollone/RocknRollOne-Regular.ttf"
  },
  "Noto Sans JP": {
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"
  },
  "Noto Serif JP": {
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-jp@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf"
  }
};

const HEISEI_MEMES = [
  "祝！キリ番10000HIT達成！！",
  "★☆ようこそ管理人の部屋へ☆★",
  "※無断転載・直リンク厳禁※",
  "あなたは12345人目の迷える子羊です",
  "工事中（完成予定：未定）",
  "相互リンク募集中！バナーは持ち帰りで♪",
  "荒らしはスルー！大人の対応を！！",
  "大激熱！！レインボー確定演出！！",
  "Internet Explorer 6.0 推奨",
  "カキコしないと呪われます（嘘）"
];

const fontBufferCache = new Map();

// ==========================================
// 2. トータルプリセット定義
// ==========================================
const PRESETS = {
  excel97: {
    rainbowMode: "vivid", solidColor: "#ff0055", angle: 90, repeat: 1, hardStop: false,
    rainbowStroke: false, rainbowExtrude: false,
    font: "Dela Gothic One", size: 64, lineHeight: 1.2, offsetX: 0, offsetY: 0, vertical: false,
    stroke: 3, strokeColor: "#000080", tripleStroke: false,
    extrude: 6, extrudeColor: "#1e1b4b", shadowDist: 6, shadowBlur: 4, shadowColor: "#000000",
    warpMode: "arch", warpAmount: 35, skew: 0, scaleX: 1.0, perspective: 0,
    rainbowAnim: "none", rainbowSpeed: 2.0,
    motionAnim: "none", subMotion: "none", motionSpeed: 2.0, easing: "linear",
    bgMode: "transparent", bgScale: 100, bgSpeed: 3.0, bgColor1: "#000080", bgColor2: "#008080",
    borderStyle: "none", stampMode: "none"
  },
  gaming: {
    rainbowMode: "cyber", solidColor: "#ff0055", angle: 45, repeat: 2, hardStop: false,
    rainbowStroke: true, rainbowExtrude: true,
    font: "RocknRoll One", size: 68, lineHeight: 1.2, offsetX: 0, offsetY: 0, vertical: false,
    stroke: 4, strokeColor: "#ffffff", tripleStroke: true,
    extrude: 10, extrudeColor: "#000000", shadowDist: 0, shadowBlur: 12, shadowColor: "#00ffcc",
    warpMode: "none", warpAmount: 0, skew: -8, scaleX: 1.0, perspective: 0,
    rainbowAnim: "hue", rainbowSpeed: 0.4,
    motionAnim: "pulse", subMotion: "shake", motionSpeed: 0.8, easing: "linear",
    bgMode: "solid", bgScale: 100, bgSpeed: 3.0, bgColor1: "#000000", bgColor2: "#111111",
    borderStyle: "rainbow", stampMode: "new"
  },
  kiriban: {
    rainbowMode: "vivid", solidColor: "#ff0055", angle: 0, repeat: 1, hardStop: true,
    rainbowStroke: false, rainbowExtrude: false,
    font: "Reggae One", size: 54, lineHeight: 1.2, offsetX: 0, offsetY: 0, vertical: false,
    stroke: 6, strokeColor: "#ffffff", tripleStroke: true,
    extrude: 5, extrudeColor: "#000080", shadowDist: 4, shadowBlur: 2, shadowColor: "#000000",
    warpMode: "wave", warpAmount: 25, skew: 0, scaleX: 1.0, perspective: 0,
    rainbowAnim: "charWave", rainbowSpeed: 1.2,
    motionAnim: "none", subMotion: "bounce", motionSpeed: 1.5, easing: "bounce",
    bgMode: "space", bgScale: 100, bgSpeed: 4.0, bgColor1: "#000022", bgColor2: "#000044",
    borderStyle: "ridge", stampMode: "kiriban"
  },
  pachinko: {
    rainbowMode: "metallic", solidColor: "#ffd700", angle: 135, repeat: 3, hardStop: true,
    rainbowStroke: true, rainbowExtrude: true,
    font: "Dela Gothic One", size: 72, lineHeight: 1.1, offsetX: 0, offsetY: 0, vertical: false,
    stroke: 6, strokeColor: "#ff0000", tripleStroke: true,
    extrude: 20, extrudeColor: "#880000", shadowDist: 10, shadowBlur: 6, shadowColor: "#000000",
    warpMode: "none", warpAmount: 0, skew: -10, scaleX: 1.1, perspective: -20,
    rainbowAnim: "hue", rainbowSpeed: 0.6,
    motionAnim: "pulse", subMotion: "none", motionSpeed: 1.2, easing: "easeInOut",
    bgMode: "sunburst", bgScale: 150, bgSpeed: 2.5, bgColor1: "#ff0000", bgColor2: "#ffff00",
    borderStyle: "rainbow", stampMode: "fire"
  },
  void3d: {
    rainbowMode: "pastel", solidColor: "#a5f3fc", angle: 90, repeat: 1, hardStop: false,
    rainbowStroke: false, rainbowExtrude: true,
    font: "Noto Serif JP", size: 60, lineHeight: 1.3, offsetX: 0, offsetY: 0, vertical: false,
    stroke: 2, strokeColor: "#1e3a8a", tripleStroke: false,
    extrude: 14, extrudeColor: "#1e3a8a", shadowDist: 12, shadowBlur: 8, shadowColor: "#000000",
    warpMode: "none", warpAmount: 0, skew: 0, scaleX: 1.0, perspective: 0,
    rainbowAnim: "flow", rainbowSpeed: 1.8,
    motionAnim: "rotateY", subMotion: "none", motionSpeed: 4.0, easing: "linear",
    bgMode: "grad2", bgScale: 100, bgSpeed: 3.0, bgColor1: "#1e3a8a", bgColor2: "#3b82f6",
    borderStyle: "groove", stampMode: "none"
  }
};

// ==========================================
// 3. 状態管理 & ロック状態 & Undo履歴 & ビューポート
// ==========================================
let state = {
  text: "祝！キリ番10000HIT達成！！",
  canvasSize: "auto",
  customW: 600,
  customH: 300,
  jpegQuality: 0.85,
  gifDuration: "auto",
  gifDither: true,
  bgImageDataUri: null,
  imgSaturate: true,
  imgMosaic: false,
  imgRainbow: false,
  ...PRESETS.excel97
};

const locks = {
  text: false,
  font: false,
  color: false,
  shape: false,
  motion: false,
  bg: false
};

const viewport = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0
};

const undoStack = [];
const MAX_UNDO = 15;
let isPlaying = true;
let startTime = performance.now();
let isExportCancelled = false;

function pushUndo() {
  const snap = JSON.stringify(state);
  if (undoStack.length > 0 && undoStack[undoStack.length - 1] === snap) return;
  undoStack.push(snap);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  updateUndoUI();
}

function updateUndoUI() {
  const btn = document.getElementById("btn-undo");
  if (btn) btn.disabled = undoStack.length === 0;
  const cnt = document.getElementById("undo-count");
  if (cnt) cnt.textContent = undoStack.length;
}

function updateViewportTransform() {
  const el = document.getElementById("viewport-transform");
  if (el) {
    el.style.transform = `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`;
  }
  const pctText = `${Math.round(viewport.zoom * 100)}%`;
  const badge = document.getElementById("zoom-badge");
  const hud = document.getElementById("hud-zoom-text");
  if (badge) badge.textContent = pctText;
  if (hud) hud.textContent = pctText;
}

// ==========================================
// 4. グラデーション・質感テクスチャ & イージング計算
// ==========================================
function applyEasing(t, type) {
  if (type === "easeInOut") return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  if (type === "bounce") {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
  return t;
}

function getPalette(s) {
  const palettes = {
    vivid: ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"],
    pastel: ["#ff9aa2", "#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#c7ceea"],
    cyber: ["#ff0055", "#00ffcc", "#ffff00", "#9d00ff", "#00ccff"],
    metallic: ["#ffd700", "#ffffff", "#ff4500", "#00ffff", "#ffd700", "#c0c0c0"],
    solid: [s.solidColor, s.solidColor],
    tex_water: ["#0284c7", "#7dd3fc", "#ffffff", "#0369a1", "#bae6fd"],
    tex_marble: ["#064e3b", "#10b981", "#ecfdf5", "#047857", "#6ee7b7"],
    tex_denim: ["#1e3a8a", "#3b82f6", "#1d4ed8", "#93c5fd", "#1e40af"],
    tex_fire: ["#7f1d1d", "#ef4444", "#f97316", "#facc15", "#ffffff"],
    tex_chrome: ["#18181b", "#e4e4e7", "#ffffff", "#52525b", "#38bdf8", "#f4f4f5"]
  };
  return palettes[s.rainbowMode] || palettes.vivid;
}

function getGradientStops(s) {
  const colors = getPalette(s);
  const stops = [];
  const totalSteps = colors.length * s.repeat;
  for (let i = 0; i <= totalSteps; i++) {
    const color = colors[i % colors.length];
    const pct = Number(((i / totalSteps) * 100).toFixed(2));
    if (s.hardStop && i > 0) {
      stops.push({ color: colors[(i - 1) % colors.length], pct });
    }
    stops.push({ color, pct });
  }
  return stops;
}

function buildGradientCSS(s) {
  if (s.rainbowMode === "tex_water") {
    return `radial-gradient(circle at 25% 25%, #ffffff 4%, #7dd3fc 18%, #0284c7 45%, #0369a1 70%, #bae6fd 95%)`;
  }
  if (s.rainbowMode === "tex_marble") {
    return `repeating-linear-gradient(115deg, #064e3b 0px, #10b981 12px, #ecfdf5 16px, #047857 28px, #6ee7b7 40px)`;
  }
  if (s.rainbowMode === "tex_denim") {
    return `repeating-linear-gradient(45deg, #1e3a8a 0 2px, #2563eb 2px 4px), repeating-linear-gradient(-45deg, #172554 0 2px, #3b82f6 2px 4px)`;
  }
  if (s.rainbowMode === "tex_fire") {
    return `linear-gradient(0deg, #7f1d1d 0%, #dc2626 30%, #f97316 60%, #facc15 85%, #ffffff 100%)`;
  }
  if (s.rainbowMode === "tex_chrome") {
    return `linear-gradient(180deg, #09090b 0%, #e4e4e7 22%, #ffffff 35%, #27272a 50%, #38bdf8 65%, #f4f4f5 88%, #18181b 100%)`;
  }
  const stops = getGradientStops(s).map(st => `${st.color} ${st.pct}%`);
  return `linear-gradient(${s.angle}deg, ${stops.join(", ")})`;
}

// ==========================================
// 5. 時刻 t 同期型の決定論的描画エンジン
// ==========================================
function renderAtTime(tMs, options = {}) {
  const mount = options.targetMount || document.getElementById("wordart-mount");

  const colorPeriodMs = Math.max(300, state.rainbowSpeed * 1000);
  const colorProgress = (tMs % colorPeriodMs) / colorPeriodMs;

  const motionPeriodMs = Math.max(300, state.motionSpeed * 1000);
  const rawMotionProgress = (tMs % motionPeriodMs) / motionPeriodMs;
  const p = applyEasing(rawMotionProgress, state.easing);

  const bgPeriodMs = Math.max(300, state.bgSpeed * 1000);
  const bgProgress = (tMs % bgPeriodMs) / bgPeriodMs;

  const hueDeg = state.rainbowAnim === "hue" ? Math.round(colorProgress * 360) : 0;

  let transforms = [`translate(${state.offsetX}px, ${state.offsetY}px)`];
  if (state.skew !== 0) transforms.push(`skewX(${state.skew}deg)`);
  if (state.scaleX !== 1.0) transforms.push(`scaleX(${state.scaleX})`);
  if (state.warpMode === "none" && state.perspective !== 0) {
    transforms.push(`perspective(400px) rotateX(${state.perspective}deg)`);
  }

  if (state.motionAnim === "rotate2d") transforms.push(`rotate(${p * 360}deg)`);
  else if (state.motionAnim === "rotateY") transforms.push(`perspective(600px) rotateY(${p * 360}deg)`);
  else if (state.motionAnim === "rotateX") transforms.push(`perspective(600px) rotateX(${p * 360}deg)`);
  else if (state.motionAnim === "drill") transforms.push(`perspective(600px) rotateY(${p * 720}deg) rotateZ(${p * 360}deg)`);
  else if (state.motionAnim === "pulse") {
    const sc = 1 + Math.sin(p * Math.PI * 2) * 0.2;
    transforms.push(`scale(${sc.toFixed(3)})`);
  }

  if (state.subMotion === "bounce") {
    const y = -Math.abs(Math.sin(rawMotionProgress * Math.PI * 2)) * 22;
    transforms.push(`translateY(${y.toFixed(1)}px)`);
  } else if (state.subMotion === "shake") {
    const x = Math.sin(rawMotionProgress * Math.PI * 10) * 6;
    const r = Math.cos(rawMotionProgress * Math.PI * 8) * 3;
    transforms.push(`translateX(${x.toFixed(1)}px) rotate(${r.toFixed(1)}deg)`);
  } else if (state.subMotion === "marquee") {
    const mx = (0.5 - rawMotionProgress) * 260;
    transforms.push(`translateX(${mx.toFixed(1)}px)`);
  }

  const transformStr = transforms.join(" ");

  // 背景スタイル
  const scaleFactor = state.bgScale / 100;
  let bgStyle = "background: transparent;";
  let bgLayerHtml = "";

  if (state.bgMode === "solid") {
    bgStyle = `background: ${state.bgColor1};`;
  } else if (state.bgMode === "grad2") {
    bgStyle = `background: linear-gradient(135deg, ${state.bgColor1}, ${state.bgColor2});`;
  } else if (state.bgMode === "sunburst") {
    const rayDeg = Math.max(4, Math.round(15 * scaleFactor));
    bgLayerHtml += `<div style="position:absolute;inset:-50%;background:repeating-conic-gradient(from ${bgProgress * 360}deg, #ff0000 0deg ${rayDeg}deg, #ffff00 ${rayDeg}deg ${rayDeg*2}deg, #00ff00 ${rayDeg*2}deg ${rayDeg*3}deg, #00ffff ${rayDeg*3}deg ${rayDeg*4}deg, #ff00ff ${rayDeg*4}deg ${rayDeg*5}deg);"></div>`;
  } else if (state.bgMode === "rainbowStripe") {
    const stripeW = Math.max(8, Math.round(20 * scaleFactor));
    const totalW = stripeW * 5;
    const pos = Math.round(bgProgress * totalW);
    bgStyle = `background: repeating-linear-gradient(45deg, #ff0000 0 ${stripeW}px, #ffff00 ${stripeW}px ${stripeW*2}px, #00ff00 ${stripeW*2}px ${stripeW*3}px, #00ffff ${stripeW*3}px ${stripeW*4}px, #ff00ff ${stripeW*4}px ${totalW}px); background-position: ${pos}px 0;`;
  } else if (state.bgMode === "space") {
    const tile = Math.max(12, Math.round(40 * scaleFactor));
    const half = Math.round(tile / 2);
    const move = Math.round(bgProgress * tile);
    bgStyle = `background-color: #000022; background-image: radial-gradient(#ffffff 1.5px, transparent 1.5px), radial-gradient(#ffff00 1px, transparent 1px); background-size: ${tile}px ${tile}px; background-position: ${move}px ${move}px, ${half + move}px ${half + move}px;`;
  } else if (state.bgMode === "brick") {
    const tile = Math.max(20, Math.round(58 * scaleFactor));
    bgStyle = `background-color: #991b1b; background-image: linear-gradient(335deg, #7f1d1d ${Math.round(tile*0.4)}px, transparent ${Math.round(tile*0.4)}px), linear-gradient(155deg, #7f1d1d ${Math.round(tile*0.4)}px, transparent ${Math.round(tile*0.4)}px); background-size: ${tile}px ${tile}px;`;
  } else if (state.bgMode === "sky") {
    const tile = Math.max(40, Math.round(140 * scaleFactor));
    const move = Math.round(bgProgress * tile);
    bgStyle = `background-color: #38bdf8; background-image: radial-gradient(circle at 30% 35%, #ffffff 18%, transparent 19%), radial-gradient(circle at 46% 38%, #ffffff 14%, transparent 15%); background-size: ${tile}px ${tile}px; background-position: ${move}px 0;`;
  } else if (state.bgMode === "dots") {
    const tile = Math.max(12, Math.round(40 * scaleFactor));
    const half = Math.round(tile / 2);
    const move = Math.round(bgProgress * tile);
    bgStyle = `background-color: #fef08a; background-image: radial-gradient(#ef4444 22%, transparent 23%), radial-gradient(#3b82f6 22%, transparent 23%); background-size: ${tile}px ${tile}px; background-position: ${move}px 0, ${half + move}px ${half}px;`;
  } else if (state.bgMode === "image" && state.bgImageDataUri) {
    const filters = [];
    if (state.imgSaturate) filters.push("saturate(260%) contrast(120%)");
    if (state.imgMosaic) filters.push("blur(2px)");
    const imgSize = state.bgScale === 100 ? "cover" : `${state.bgScale}% auto`;
    bgLayerHtml += `<div style="position:absolute;inset:0;background:url('${state.bgImageDataUri}') center/${imgSize} no-repeat;filter:${filters.join(" ")};${state.imgMosaic ? "image-rendering:pixelated;" : ""}"></div>`;
    if (state.imgRainbow) {
      bgLayerHtml += `<div style="position:absolute;inset:0;background:linear-gradient(45deg,rgba(255,0,0,0.45),rgba(255,255,0,0.45),rgba(0,255,0,0.45),rgba(0,255,255,0.45),rgba(255,0,255,0.45));mix-blend-mode:overlay;"></div>`;
    }
  }

  // 平成スタンプ装飾
  let stampHtml = "";
  const blink = Math.floor(bgProgress * 4) % 2 === 0;
  if (state.stampMode === "new") {
    stampHtml = `<div style="position:absolute;top:6px;left:8px;z-index:5;background:${blink ? "#ff0000" : "#ffff00"};color:${blink ? "#ffff00" : "#ff0000"};font-weight:900;font-size:14px;padding:2px 8px;border:2px outset #fff;transform:rotate(-8deg);font-family:sans-serif;">NEW!!</div>`;
  } else if (state.stampMode === "construction") {
    stampHtml = `<div style="position:absolute;bottom:6px;right:8px;z-index:5;background:repeating-linear-gradient(45deg,#facc15 0 8px,#000 8px 16px);color:#fff;text-shadow:1px 1px 0 #000,-1px -1px 0 #000;font-weight:900;font-size:13px;padding:3px 10px;border:2px ridge #facc15;">🚧 工事中 🚧</div>`;
  } else if (state.stampMode === "kiriban") {
    const rot = Math.round(bgProgress * 360);
    stampHtml = `
      <div style="position:absolute;top:6px;left:10px;z-index:5;font-size:20px;transform:rotate(${rot}deg);">🌟</div>
      <div style="position:absolute;top:6px;right:10px;z-index:5;font-size:20px;transform:rotate(${-rot}deg);">🌟</div>
      <div style="position:absolute;bottom:6px;left:10px;z-index:5;font-size:13px;font-weight:900;color:#ffff00;text-shadow:1px 1px 2px #000;">★祝キリ番★</div>
    `;
  } else if (state.stampMode === "fire") {
    const scaleFire = 1 + Math.sin(bgProgress * Math.PI * 4) * 0.15;
    stampHtml = `<div style="position:absolute;bottom:2px;left:0;right:0;text-align:center;z-index:5;font-size:22px;letter-spacing:6px;transform:scaleY(${scaleFire.toFixed(2)});pointer-events:none;">🔥🔥🔥🔥🔥</div>`;
  }

  const disableDropShadow = options.noBlurShadow === true;

  let borderStyle = "";
  if (state.borderStyle === "ridge") borderStyle = "border: 10px ridge #ffd700;";
  else if (state.borderStyle === "groove") borderStyle = "border: 10px groove #00ffff;";
  else if (state.borderStyle === "rainbow") borderStyle = `border: 10px solid hsl(${Math.round(bgProgress * 360)}, 100%, 50%);`;

  let sizeStyle = "padding: 28px 40px; display: inline-flex; align-items: center; justify-content: center; overflow: hidden;";
  if (state.canvasSize !== "auto") {
    const [w, h] = state.canvasSize === "custom"
      ? [Math.max(32, state.customW), Math.max(32, state.customH)]
      : state.canvasSize.split("x").map(Number);
    sizeStyle = `width: ${w}px; height: ${h}px; display: flex; align-items: center; justify-content: center; overflow: hidden;`;
  }

  const grad = buildGradientCSS(state);
  const isTex = state.rainbowMode.startsWith("tex_");
  const bgSize = isTex ? "40px 40px" : "200% 200%";
  const bgPos = state.rainbowAnim === "flow" ? `${colorProgress * 200}% 50%` : "50% 50%";

  let innerContent = "";
  if (state.warpMode === "none") {
    innerContent = buildHtmlWordArt(state, transformStr, hueDeg, grad, bgSize, bgPos, colorProgress, disableDropShadow);
  } else {
    innerContent = buildSvgWordArt(state, transformStr, hueDeg, colorProgress, options.embeddedFontCss || "", disableDropShadow);
  }

  mount.innerHTML = `
    <div id="wordart-canvas-box" style="position:relative; ${sizeStyle} ${bgStyle} ${borderStyle} box-sizing:border-box;">
      ${bgLayerHtml}
      ${stampHtml}
      <div style="position:relative; z-index:2;">${innerContent}</div>
    </div>
  `;
}

function buildHtmlWordArt(s, transformStr, hueDeg, grad, bgSize, bgPos, colorProgress, disableDropShadow) {
  const layers = Math.min(25, s.extrude);
  const shadows = [];
  for (let i = 1; i <= layers; i++) {
    const c = s.rainbowExtrude ? `hsl(${(i * 24 + hueDeg) % 360}, 100%, 45%)` : s.extrudeColor;
    shadows.push(`${i}px ${i}px 0px ${c}`);
  }
  if (!disableDropShadow && (s.shadowDist > 0 || s.shadowBlur > 0)) {
    const baseOffset = layers + s.shadowDist;
    shadows.push(`${baseOffset}px ${baseOffset}px ${s.shadowBlur}px ${s.shadowColor}`);
  }
  const textShadowCSS = shadows.length ? `text-shadow: ${shadows.join(", ")};` : "";
  const writingModeCSS = s.vertical ? "writing-mode: vertical-rl; text-orientation: upright;" : "";

  const renderTextHtml = (isFront) => {
    if (s.rainbowAnim !== "charWave" || !isFront) {
      return escapeHtml(s.text).replace(/\n/g, "<br>");
    }
    let idx = 0;
    return s.text.split("").map(ch => {
      if (ch === "\n") return "<br>";
      const charHue = Math.round(((idx * 35) + colorProgress * 360) % 360);
      idx++;
      return `<span style="color: hsl(${charHue}, 100%, 55%);">${escapeHtml(ch)}</span>`;
    }).join("");
  };

  const strokeWidth = s.stroke * 2;
  const outerTriple = s.tripleStroke && s.stroke > 0
    ? `-webkit-text-stroke: ${strokeWidth + 8}px #ffffff; paint-order: stroke fill;`
    : "";

  const frontFillStyle = s.rainbowAnim === "charWave"
    ? ""
    : `background-image: ${grad}; background-size: ${bgSize}; background-position: ${bgPos}; -webkit-background-clip: text; background-clip: text; color: transparent;`;

  return `
    <div style="position: relative; display: inline-block; transform: ${transformStr}; filter: hue-rotate(${hueDeg}deg); ${writingModeCSS}">
      ${outerTriple ? `<div aria-hidden="true" style="position:absolute;inset:0;font-family:'${s.font}',sans-serif;font-size:${s.size}px;font-weight:900;line-height:${s.lineHeight};text-align:center;white-space:pre-wrap;color:transparent;${outerTriple}">${renderTextHtml(false)}</div>` : ""}
      <div aria-hidden="true" style="
        font-family: '${s.font}', sans-serif;
        font-size: ${s.size}px;
        font-weight: 900;
        line-height: ${s.lineHeight};
        text-align: center;
        white-space: pre-wrap;
        color: transparent;
        -webkit-text-stroke: ${strokeWidth}px ${s.rainbowStroke ? "#ff00ff" : s.strokeColor};
        paint-order: stroke fill;
        ${textShadowCSS}
      ">${renderTextHtml(false)}</div>
      <div style="
        position: absolute;
        inset: 0;
        font-family: '${s.font}', sans-serif;
        font-size: ${s.size}px;
        font-weight: 900;
        line-height: ${s.lineHeight};
        text-align: center;
        white-space: pre-wrap;
        ${frontFillStyle}
      ">${renderTextHtml(true)}</div>
    </div>
  `;
}

function buildSvgWordArt(s, transformStr, hueDeg, colorProgress, embeddedFontCss, disableDropShadow) {
  const lines = s.text.split("\n");
  const lineHeight = s.size * s.lineHeight;
  const maxChars = Math.max(1, ...lines.map(l => l.length));
  const width = Math.max(360, maxChars * s.size * 1.15 + 80);
  const height = lines.length * lineHeight + Math.abs(s.warpAmount) * 2.2 + s.size + 40;
  const curve = s.warpAmount * 1.8;

  // repeat と hardStop に完全対応した SVG stop 生成
  const stopsHtml = getGradientStops(s).map(st =>
    `<stop offset="${st.pct}%" stop-color="${st.color}" />`
  ).join("");

  const layers = Math.min(25, s.extrude);
  let pathsHtml = "";
  let tripleUsesHtml = "";
  let extrudeUsesHtml = "";
  let mainTextsHtml = "";
  let globalCharIdx = 0;

  lines.forEach((line, idx) => {
    const yBase = s.size + Math.abs(curve) * 0.65 + idx * lineHeight;
    const pathId = `kuso-path-${idx}`;
    const textGroupId = `kuso-text-${idx}`;
    const d = s.warpMode === "arch"
      ? `M 30,${yBase} Q ${width / 2},${yBase - curve * 2} ${width - 30},${yBase}`
      : `M 30,${yBase} Q ${width * 0.25},${yBase - curve} ${width * 0.5},${yBase} T ${width - 30},${yBase}`;

    pathsHtml += `<path id="${pathId}" d="${d}" fill="none" />`;

    // 三重線（tripleStroke）の背面白枠
    if (s.tripleStroke && s.stroke > 0) {
      tripleUsesHtml += `<use href="#${textGroupId}" fill="none" stroke="#ffffff" stroke-width="${s.stroke * 2 + 8}" paint-order="stroke fill" />`;
    }

    for (let l = layers; l >= 1; l--) {
      const c = s.rainbowExtrude ? `hsl(${(l * 24 + hueDeg) % 360}, 100%, 45%)` : s.extrudeColor;
      extrudeUsesHtml += `<use href="#${textGroupId}" x="${l}" y="${l}" fill="${c}" stroke="${c}" stroke-width="${s.stroke}" />`;
    }

    const strokeAttr = s.rainbowStroke ? "url(#kuso-stroke-grad)" : s.strokeColor;
    const fillAttr = s.rainbowAnim === "charWave" ? "#ff0055" : "url(#kuso-rainbow-grad)";

    // 1文字ずつウェーブ虹対応
    const lineBodyHtml = s.rainbowAnim === "charWave"
      ? line.split("").map(ch => {
          const charHue = Math.round(((globalCharIdx * 35) + colorProgress * 360) % 360);
          globalCharIdx++;
          return `<tspan fill="hsl(${charHue}, 100%, 55%)">${escapeHtml(ch)}</tspan>`;
        }).join("")
      : escapeHtml(line);

    mainTextsHtml += `
      <g id="${textGroupId}">
        <text font-family="'${s.font}', sans-serif" font-size="${s.size}" font-weight="900"
              fill="${fillAttr}" stroke="${strokeAttr}" stroke-width="${s.stroke}"
              paint-order="stroke fill" text-anchor="middle">
          <textPath href="#${pathId}" startOffset="50%">${lineBodyHtml}</textPath>
        </text>
      </g>
    `;
  });

  const dropShadowFilter = (!disableDropShadow && (s.shadowDist > 0 || s.shadowBlur > 0))
    ? `drop-shadow(${s.shadowDist}px ${s.shadowDist}px ${s.shadowBlur}px ${s.shadowColor})`
    : "";

  const shiftX = s.rainbowAnim === "flow" ? `${colorProgress * 100}%` : "0%";
  const endX = s.rainbowAnim === "flow" ? `${100 + colorProgress * 100}%` : "100%";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
         style="overflow: visible; transform: ${transformStr}; filter: hue-rotate(${hueDeg}deg) ${dropShadowFilter};">
      <defs>
        ${embeddedFontCss ? `<style>${embeddedFontCss}</style>` : ""}
        <linearGradient id="kuso-rainbow-grad" x1="${shiftX}" y1="0%" x2="${endX}" y2="0%" spreadMethod="repeat">
          ${stopsHtml}
        </linearGradient>
        <linearGradient id="kuso-stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${stopsHtml}
        </linearGradient>
        ${pathsHtml}
      </defs>
      ${extrudeUsesHtml}
      ${tripleUsesHtml}
      ${mainTextsHtml}
    </svg>
  `;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

// ==========================================
// 6. コピペ用 HTML/CSS/JS コード生成（立体影・多重線・モーション完全対応）
// ==========================================
function generateExportCode() {
  const suffix = Math.random().toString(36).substring(2, 6);
  const cls = `kuso-wordart-${suffix}`;
  const fontInfo = FONT_REGISTRY[state.font];
  const grad = buildGradientCSS(state);
  const lines = escapeHtml(state.text).replace(/\n/g, "<br>");

  const shadows = [];
  const layers = Math.min(25, state.extrude);
  for (let i = 1; i <= layers; i++) {
    const c = state.rainbowExtrude ? `hsl(${(i * 24) % 360}, 100%, 45%)` : state.extrudeColor;
    shadows.push(`${i}px ${i}px 0px ${c}`);
  }
  if (state.shadowDist > 0 || state.shadowBlur > 0) {
    shadows.push(`${layers + state.shadowDist}px ${layers + state.shadowDist}px ${state.shadowBlur}px ${state.shadowColor}`);
  }
  const shadowCss = shadows.length ? `text-shadow: ${shadows.join(", ")};` : "";

  let animCss = "";
  let keyframeCss = "";
  if (state.rainbowAnim === "hue") {
    keyframeCss += `@keyframes kuso-hue-${suffix} { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }\n`;
    animCss += `animation: kuso-hue-${suffix} ${state.rainbowSpeed}s linear infinite;`;
  } else if (state.rainbowAnim === "flow") {
    keyframeCss += `@keyframes kuso-flow-${suffix} { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }\n`;
    animCss += `background-size: 200% 200%; animation: kuso-flow-${suffix} ${state.rainbowSpeed}s linear infinite;`;
  }

  let wrapAnimCss = "";
  if (state.motionAnim === "rotate2d") {
    keyframeCss += `@keyframes kuso-rot-${suffix} { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\n`;
    wrapAnimCss = `animation: kuso-rot-${suffix} ${state.motionSpeed}s linear infinite;`;
  } else if (state.motionAnim === "rotateY") {
    keyframeCss += `@keyframes kuso-roty-${suffix} { 0% { transform: perspective(600px) rotateY(0deg); } 100% { transform: perspective(600px) rotateY(360deg); } }\n`;
    wrapAnimCss = `animation: kuso-roty-${suffix} ${state.motionSpeed}s linear infinite;`;
  } else if (state.motionAnim === "pulse") {
    keyframeCss += `@keyframes kuso-pulse-${suffix} { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }\n`;
    wrapAnimCss = `animation: kuso-pulse-${suffix} ${state.motionSpeed}s ease-in-out infinite;`;
  }

  const needJs = state.rainbowAnim === "charWave";
  if (needJs) {
    keyframeCss += `@keyframes kuso-hue-${suffix} { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }\n`;
  }
  const jsSnippet = needJs ? `\n<script>
  document.querySelectorAll('.${cls}-char').forEach((el, i) => {
    el.style.display = 'inline-block';
    el.style.animation = 'kuso-hue-${suffix} ${state.rainbowSpeed}s linear infinite';
    el.style.animationDelay = (-i * 0.1) + 's';
  });
<\/script>` : "";

  const textBody = needJs
    ? state.text.split("").map(c => c === "\n" ? "<br>" : `<span class="${cls}-char">${escapeHtml(c)}</span>`).join("")
    : lines;

  const code = `<!-- クソダサ・レインボーワードアート -->
<link rel="stylesheet" href="${fontInfo.cssUrl}">
<style>
  ${keyframeCss}
  .${cls}-wrap {
    all: initial;
    display: inline-block;
    box-sizing: border-box;
    font-family: '${state.font}', sans-serif;
    padding: 28px 40px;
    ${state.bgMode === "solid" ? `background: ${state.bgColor1};` : ""}
    ${state.bgMode === "grad2" ? `background: linear-gradient(135deg, ${state.bgColor1}, ${state.bgColor2});` : ""}
    ${state.bgMode === "image" ? "background-image: url('/* ここに画像のURLを指定してください */');" : ""}
    ${state.borderStyle === "ridge" ? "border: 10px ridge #ffd700;" : ""}
    ${state.borderStyle === "groove" ? "border: 10px groove #00ffff;" : ""}
  }
  .${cls}-stage {
    position: relative;
    display: inline-block;
    transform: translate(${state.offsetX}px, ${state.offsetY}px) skewX(${state.skew}deg) scaleX(${state.scaleX});
    ${state.vertical ? "writing-mode: vertical-rl; text-orientation: upright;" : ""}
    ${wrapAnimCss}
  }
  .${cls}-back {
    font-family: '${state.font}', sans-serif;
    font-size: ${state.size}px;
    font-weight: 900;
    line-height: ${state.lineHeight};
    text-align: center;
    white-space: pre-wrap;
    color: transparent;
    -webkit-text-stroke: ${state.stroke * 2}px ${state.strokeColor};
    paint-order: stroke fill;
    ${shadowCss}
  }
  .${cls}-front {
    position: absolute;
    inset: 0;
    font-family: '${state.font}', sans-serif;
    font-size: ${state.size}px;
    font-weight: 900;
    line-height: ${state.lineHeight};
    text-align: center;
    white-space: pre-wrap;
    ${needJs ? "color: #ff0055;" : `background-image: ${grad}; -webkit-background-clip: text; background-clip: text; color: transparent;`}
    ${animCss}
  }
</style>
<div class="${cls}-wrap">
  <div class="${cls}-stage">
    <div class="${cls}-back" aria-hidden="true">${lines}</div>
    <div class="${cls}-front">${textBody}</div>
  </div>
</div>${jsSnippet}`;

  const out = document.getElementById("code-output");
  if (out) out.value = code;
  document.getElementById("code-image-notice").hidden = state.bgMode !== "image";
  return code;
}

// ==========================================
// 7. opentype.js サブセットフォント埋め込み生成
// ==========================================
async function getEmbeddedFontCss(fontName, text) {
  const reg = FONT_REGISTRY[fontName];
  if (!reg) return "";
  try {
    let buffer = fontBufferCache.get(fontName);
    if (!buffer) {
      const res = await fetch(reg.binaryUrl);
      buffer = await res.arrayBuffer();
      fontBufferCache.set(fontName, buffer);
    }
    const font = opentype.parse(buffer);
    const uniqueChars = Array.from(new Set(text.replace(/\s/g, "")));
    const glyphs = [font.glyphs.get(0)];
    uniqueChars.forEach(ch => {
      const g = font.charToGlyph(ch);
      if (g && g.index !== 0) glyphs.push(g);
    });
    const subsetFont = new opentype.Font({
      familyName: fontName,
      styleName: "Regular",
      unitsPerEm: font.unitsPerEm,
      ascender: font.ascender,
      descender: font.descender,
      glyphs
    });
    const arrayBuf = subsetFont.toArrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    return `@font-face { font-family: '${fontName}'; src: url('data:font/opentype;base64,${base64}') format('opentype'); font-weight: 900; }`;
  } catch (e) {
    console.warn("サブセットフォント生成をスキップしました:", e);
    return "";
  }
}

// ==========================================
// 8. 静止画・GIF（ディザリング対応）・MP4書き出しエンジン
// ==========================================
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }

function getLoopDurationMs() {
  if (state.gifDuration !== "auto") return Number(state.gifDuration) * 1000;
  const periods = [];
  if (state.rainbowAnim !== "none") periods.push(Math.round(Math.max(300, state.rainbowSpeed * 1000)));
  if (state.motionAnim !== "none" || state.subMotion !== "none") periods.push(Math.round(Math.max(300, state.motionSpeed * 1000)));
  if (["sunburst", "rainbowStripe", "space", "sky", "dots"].includes(state.bgMode) || state.borderStyle === "rainbow" || state.stampMode !== "none") {
    periods.push(Math.round(Math.max(300, state.bgSpeed * 1000)));
  }
  if (periods.length === 0) return 1000;
  const combined = periods.reduce((acc, cur) => lcm(acc, cur), periods[0]);
  return Math.min(5000, combined);
}

async function captureFrameCanvas(tMs, embeddedFontCss, noBlurShadow = false, maxDim = 1280) {
  const staging = document.createElement("div");
  staging.style.cssText = "position:fixed; left:-9999px; top:0; pointer-events:none;";
  document.body.appendChild(staging);
  renderAtTime(tMs, { targetMount: staging, embeddedFontCss, noBlurShadow });

  const targetEl = staging.querySelector("#wordart-canvas-box");
  const rect = targetEl.getBoundingClientRect();
  const scale = Math.min(1, maxDim / Math.max(rect.width || 1, rect.height || 1));

  const canvas = await domToCanvas(targetEl, {
    scale,
    backgroundColor: null
  });
  staging.remove();
  return canvas;
}

function showProgress(title) {
  isExportCancelled = false;
  document.getElementById("progress-title").textContent = title;
  document.getElementById("rainbow-progress-bar").style.width = "0%";
  document.getElementById("progress-percent").textContent = "0%";
  document.getElementById("progress-overlay").hidden = false;
}

function updateProgress(pct) {
  const clamped = Math.min(100, Math.round(pct));
  document.getElementById("rainbow-progress-bar").style.width = `${clamped}%`;
  document.getElementById("progress-percent").textContent = `${clamped}%`;
}

function hideProgress() {
  document.getElementById("progress-overlay").hidden = true;
}

function triggerDownloadOrModal(blob, filename, label) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  const canShare = navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: blob.type })] });
  openModal(label, `
    <p style="font-size:0.85rem; margin-top:0;">自動ダウンロードが始まらない場合や、SNSアプリ内ブラウザの場合は下の画像を<strong>長押しして保存</strong>してください。</p>
    <div style="text-align:center; background:#111; padding:10px; border-radius:8px; margin-bottom:10px;">
      <img src="${blobUrl}" style="max-width:100%; max-height:48vh; border:1px solid #444;" />
    </div>
    ${canShare ? `<button id="modal-share-btn" class="btn btn-rainbow" style="width:100%;">📤 OSの共有メニューでSNSに送る</button>` : ""}
  `);

  if (canShare) {
    document.getElementById("modal-share-btn").onclick = async () => {
      try {
        await navigator.share({
          files: [new File([blob], filename, { type: blob.type })],
          title: "クソダサ・レインボーワードアート"
        });
      } catch (e) { /* キャンセル無視 */ }
    };
  }
}

async function exportStaticImage(format) {
  showProgress(`🖼️ ${format.toUpperCase()}画像を生成中...`);
  try {
    await document.fonts.ready;
    updateProgress(25);
    const fontCss = state.warpMode !== "none" ? await getEmbeddedFontCss(state.font, state.text) : "";
    updateProgress(55);
    const canvas = await captureFrameCanvas(performance.now() - startTime, fontCss, false, 1600);
    updateProgress(85);

    if (format === "jpeg") {
      const out = document.createElement("canvas");
      out.width = canvas.width;
      out.height = canvas.height;
      const ctx = out.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(canvas, 0, 0);
      out.toBlob(blob => {
        hideProgress();
        triggerDownloadOrModal(blob, `kusodasa-${Date.now()}.jpg`, "JPEG画像の保存");
      }, "image/jpeg", state.jpegQuality);
    } else {
      canvas.toBlob(blob => {
        hideProgress();
        triggerDownloadOrModal(blob, `kusodasa-${Date.now()}.png`, "PNG画像の保存");
      }, "image/png");
    }
  } catch (e) {
    hideProgress();
    showToast("❌ 画像の生成に失敗しました");
    console.error(e);
  }
}

function createGifWorker() {
  const workerCode = `
    import { GIFEncoder, quantize, applyPalette } from "https://esm.sh/gifenc@1.0.3";

    // 簡易Bayerディザリング（高速かつ自然なグラデ再現）
    const bayer = [
      [ 0,  8,  2, 10],
      [12,  4, 14,  6],
      [ 3, 11,  1,  9],
      [15,  7, 13,  5]
    ];

    function applyDither(data, width, height) {
      const out = new Uint8ClampedArray(data);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          if (out[i + 3] < 128) continue;
          const threshold = (bayer[y & 3][x & 3] - 7.5) * 1.6;
          out[i]     = Math.min(255, Math.max(0, out[i] + threshold));
          out[i + 1] = Math.min(255, Math.max(0, out[i + 1] + threshold));
          out[i + 2] = Math.min(255, Math.max(0, out[i + 2] + threshold));
        }
      }
      return out;
    }

    self.onmessage = (e) => {
      const { frames, width, height, delay, transparent, dither } = e.data;
      const gif = GIFEncoder();
      frames.forEach((rgba, idx) => {
        const raw = new Uint8ClampedArray(rgba);
        const data = dither ? applyDither(raw, width, height) : raw;
        const palette = quantize(data, 256, { format: transparent ? "rgba4444" : "rgb565" });
        const index = applyPalette(data, palette, { format: transparent ? "rgba4444" : "rgb565" });
        let transparentIndex = -1;
        if (transparent) {
          transparentIndex = palette.findIndex(p => p[3] < 128);
        }
        gif.writeFrame(index, width, height, {
          palette,
          delay,
          transparent: transparent && transparentIndex !== -1,
          transparentIndex: transparentIndex !== -1 ? transparentIndex : 0
        });
        self.postMessage({ type: "progress", pct: ((idx + 1) / frames.length) * 100 });
      });
      gif.finish();
      const bytes = gif.bytes();
      self.postMessage({ type: "done", buffer: bytes.buffer }, [bytes.buffer]);
    };
  `;
  const blob = new Blob([workerCode], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob), { type: "module" });
}

async function exportGifAnimation() {
  let transparentMode = false;
  let fallbackBgColor = null;

  if (state.bgMode === "transparent") {
    const choice = confirm(
      "背景が「透過」になっています。\n" +
      "・OK：透過GIFモード（ぼかし影を自動オフにし1bit透過で出力）\n" +
      "・キャンセル：白背景に自動フォールバックして滑らかな影を維持"
    );
    if (choice) transparentMode = true;
    else fallbackBgColor = "#ffffff";
  }

  showProgress("🎞️ コマ送りフレームを撮影中...");
  await document.fonts.ready;
  const fps = 15;
  const delayMs = Math.round(1000 / fps);
  const totalMs = getLoopDurationMs();
  const totalFrames = Math.max(1, Math.round(totalMs / delayMs));

  try {
    const fontCss = state.warpMode !== "none" ? await getEmbeddedFontCss(state.font, state.text) : "";
    const frameBuffers = [];
    let width = 0, height = 0;

    for (let i = 0; i < totalFrames; i++) {
      if (isExportCancelled) { hideProgress(); return; }
      const rawCanvas = await captureFrameCanvas(i * delayMs, fontCss, transparentMode, 640);
      width = rawCanvas.width;
      height = rawCanvas.height;

      const workCanvas = document.createElement("canvas");
      workCanvas.width = width;
      workCanvas.height = height;
      const ctx = workCanvas.getContext("2d");
      if (fallbackBgColor) {
        ctx.fillStyle = fallbackBgColor;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(rawCanvas, 0, 0);
      const imgData = ctx.getImageData(0, 0, width, height);
      frameBuffers.push(imgData.data.buffer);
      updateProgress(((i + 1) / totalFrames) * 50);
    }

    document.getElementById("progress-title").textContent = "🌈 インラインWorkerでGIF圧縮中...";
    const worker = createGifWorker();
    worker.postMessage({
      frames: frameBuffers,
      width,
      height,
      delay: delayMs,
      transparent: transparentMode,
      dither: state.gifDither
    }, frameBuffers);

    worker.onmessage = (e) => {
      if (isExportCancelled) { worker.terminate(); hideProgress(); return; }
      if (e.data.type === "progress") {
        updateProgress(50 + e.data.pct * 0.5);
      } else if (e.data.type === "done") {
        worker.terminate();
        hideProgress();
        const blob = new Blob([e.data.buffer], { type: "image/gif" });
        triggerDownloadOrModal(blob, `kusodasa-${Date.now()}.gif`, "GIFアニメの保存");
      }
    };
  } catch (err) {
    hideProgress();
    showToast("❌ GIF生成中にエラーが発生しました");
    console.error(err);
  }
}

async function exportMp4Video() {
  if (typeof VideoEncoder === "undefined") {
    showToast("⚠️ お使いのブラウザはMP4出力に非対応です。GIF保存をご利用ください。");
    return;
  }
  showProgress("🎬 24bitフルカラーMP4動画をエンコード中...");
  await document.fonts.ready;
  const fps = 20;
  const delayMs = 1000 / fps;
  const totalMs = getLoopDurationMs();
  const totalFrames = Math.max(1, Math.round(totalMs / delayMs));

  try {
    const fontCss = state.warpMode !== "none" ? await getEmbeddedFontCss(state.font, state.text) : "";
    const firstCanvas = await captureFrameCanvas(0, fontCss, false, 640);
    const width = firstCanvas.width % 2 === 0 ? firstCanvas.width : firstCanvas.width - 1;
    const height = firstCanvas.height % 2 === 0 ? firstCanvas.height : firstCanvas.height - 1;

    const muxer = new Muxer({
      target: new ArrayBufferTarget(),
      video: { codec: "avc", width, height },
      fastStart: "in-memory"
    });

    const encoder = new VideoEncoder({
      output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
      error: e => console.error(e)
    });

    encoder.configure({
      codec: "avc1.42001f",
      width,
      height,
      bitrate: 2_000_000,
      framerate: fps
    });

    for (let i = 0; i < totalFrames; i++) {
      if (isExportCancelled) { hideProgress(); return; }
      const raw = i === 0 ? firstCanvas : await captureFrameCanvas(i * delayMs, fontCss, false, 640);
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const ctx = c.getContext("2d");
      ctx.fillStyle = state.bgMode === "transparent" ? "#000000" : "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(raw, 0, 0, width, height);

      const frame = new VideoFrame(c, { timestamp: Math.round(i * delayMs * 1000) });
      encoder.encode(frame, { keyFrame: i % 20 === 0 });
      frame.close();
      updateProgress(((i + 1) / totalFrames) * 90);
    }

    await encoder.flush();
    muxer.finalize();
    hideProgress();

    const blob = new Blob([muxer.target.buffer], { type: "video/mp4" });
    triggerDownloadOrModal(blob, `kusodasa-${Date.now()}.mp4`, "MP4動画の保存");
  } catch (err) {
    hideProgress();
    showToast("❌ MP4エンコードに失敗しました。GIF保存をお試しください。");
    console.error(err);
  }
}

// ==========================================
// 9. マイプリセット (localStorage) & Auto-Fit & UI同期
// ==========================================
const MY_PRESET_KEY = "kusodasa_my_presets_v1";

function loadMyPresetsMap() {
  try {
    return JSON.parse(localStorage.getItem(MY_PRESET_KEY) || "{}");
  } catch { return {}; }
}

function refreshMyPresetsDropdown() {
  const sel = document.getElementById("ctrl-my-presets");
  if (!sel) return;
  const map = loadMyPresetsMap();
  sel.innerHTML = `<option value="">-- マイプリセットを選択 (${Object.keys(map).length}件) --</option>`;
  Object.keys(map).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
}

function autoFitFontSize() {
  pushUndo();
  if (state.canvasSize === "auto") {
    state.size = 64;
    state.offsetX = 0;
    state.offsetY = 0;
  } else {
    const [cw, ch] = state.canvasSize === "custom"
      ? [Math.max(32, state.customW), Math.max(32, state.customH)]
      : state.canvasSize.split("x").map(Number);
    const lines = state.text.split("\n");
    const maxLen = Math.max(1, ...lines.map(l => l.length));
    const fitW = Math.floor((cw * 0.85) / maxLen);
    const fitH = Math.floor((ch * 0.75) / (lines.length * state.lineHeight));
    state.size = Math.max(16, Math.min(240, Math.min(fitW, fitH)));
    state.offsetX = 0;
    state.offsetY = 0;
  }
  syncUIFromState();
  showToast(`🔍 フォントサイズを ${state.size}px に自動フィットしました`);
}

function openModal(title, htmlContent) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = htmlContent;
  document.getElementById("app-modal").hidden = false;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3200);
}

function syncUIFromState() {
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setVal("ctrl-text", state.text);
  setTxt("char-count", state.text.length);
  setChk("ctrl-vertical", state.vertical);
  setVal("ctrl-canvas-size", state.canvasSize);
  document.getElementById("wrap-custom-size").hidden = state.canvasSize !== "custom";
  setVal("ctrl-custom-w", state.customW);
  setVal("ctrl-custom-h", state.customH);

  setVal("ctrl-line-height", state.lineHeight); setTxt("val-line-height", state.lineHeight);
  setVal("ctrl-size", state.size); setTxt("val-size", state.size);
  setVal("ctrl-offset-x", state.offsetX); setTxt("val-offset-x", state.offsetX);
  setVal("ctrl-offset-y", state.offsetY); setTxt("val-offset-y", state.offsetY);

  setVal("ctrl-rainbow-mode", state.rainbowMode);
  setVal("ctrl-solid-color", state.solidColor);
  document.getElementById("wrap-solid-color").hidden = state.rainbowMode !== "solid";
  setVal("ctrl-angle", state.angle); setTxt("val-angle", state.angle);
  setVal("ctrl-repeat", state.repeat); setTxt("val-repeat", state.repeat);
  setChk("ctrl-hard-stop", state.hardStop);
  setChk("ctrl-rainbow-stroke", state.rainbowStroke);
  setChk("ctrl-rainbow-extrude", state.rainbowExtrude);

  setVal("ctrl-font", state.font);
  setVal("ctrl-stroke", state.stroke); setTxt("val-stroke", state.stroke);
  setVal("ctrl-stroke-color", state.strokeColor);
  setChk("ctrl-triple-stroke", state.tripleStroke);
  setVal("ctrl-extrude", state.extrude); setTxt("val-extrude", state.extrude);
  setVal("ctrl-extrude-color", state.extrudeColor);
  setVal("ctrl-shadow-dist", state.shadowDist); setTxt("val-shadow-dist", state.shadowDist);
  setVal("ctrl-shadow-blur", state.shadowBlur); setTxt("val-shadow-blur", state.shadowBlur);
  setVal("ctrl-shadow-color", state.shadowColor);

  setVal("ctrl-warp-mode", state.warpMode);
  setVal("ctrl-warp-amount", state.warpAmount); setTxt("val-warp-amount", state.warpAmount);
  setVal("ctrl-skew", state.skew); setTxt("val-skew", state.skew);
  setVal("ctrl-scale-x", state.scaleX); setTxt("val-scale-x", state.scaleX);
  setVal("ctrl-perspective", state.perspective); setTxt("val-perspective", state.perspective);

  const wrapPersp = document.getElementById("wrap-perspective");
  const ctrlPersp = document.getElementById("ctrl-perspective");
  wrapPersp.classList.toggle("disabled-control", state.warpMode !== "none");
  ctrlPersp.disabled = state.warpMode !== "none";

  setVal("ctrl-rainbow-anim", state.rainbowAnim);
  setVal("ctrl-rainbow-speed", state.rainbowSpeed); setTxt("val-rainbow-speed", state.rainbowSpeed.toFixed(1));
  setVal("ctrl-motion-anim", state.motionAnim);
  setVal("ctrl-sub-motion", state.subMotion);
  setVal("ctrl-motion-speed", state.motionSpeed); setTxt("val-motion-speed", state.motionSpeed.toFixed(1));
  setVal("ctrl-easing", state.easing);

  setVal("ctrl-bg-mode", state.bgMode);
  setVal("ctrl-bg-scale", state.bgScale); setTxt("val-bg-scale", state.bgScale);
  setVal("ctrl-bg-speed", state.bgSpeed); setTxt("val-bg-speed", state.bgSpeed.toFixed(1));
  setVal("ctrl-bg-color1", state.bgColor1);
  setVal("ctrl-bg-color2", state.bgColor2);
  document.getElementById("wrap-bg-colors").hidden = !(state.bgMode === "solid" || state.bgMode === "grad2");
  document.getElementById("wrap-bg-image").hidden = state.bgMode !== "image";
  setChk("ctrl-img-saturate", state.imgSaturate);
  setChk("ctrl-img-mosaic", state.imgMosaic);
  setChk("ctrl-img-rainbow", state.imgRainbow);
  setVal("ctrl-border-style", state.borderStyle);
  setVal("ctrl-stamp-mode", state.stampMode);

  generateExportCode();
}

// ==========================================
// 10. プレビュービューポート操作
// ==========================================
function initViewportInteractions() {
  const stage = document.getElementById("preview-stage");

  const setZoom = (newZoom) => {
    viewport.zoom = Math.max(0.25, Math.min(3.0, Number(newZoom.toFixed(2))));
    updateViewportTransform();
  };

  document.getElementById("btn-zoom-in").addEventListener("click", () => setZoom(viewport.zoom + 0.15));
  document.getElementById("btn-zoom-out").addEventListener("click", () => setZoom(viewport.zoom - 0.15));
  document.getElementById("btn-view-reset").addEventListener("click", () => {
    viewport.zoom = 1.0;
    viewport.panX = 0;
    viewport.panY = 0;
    updateViewportTransform();
  });

  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(viewport.zoom + delta);
  }, { passive: false });

  const onPointerDown = (clientX, clientY) => {
    viewport.isDragging = true;
    viewport.dragStartX = clientX - viewport.panX;
    viewport.dragStartY = clientY - viewport.panY;
  };
  const onPointerMove = (clientX, clientY) => {
    if (!viewport.isDragging) return;
    viewport.panX = clientX - viewport.dragStartX;
    viewport.panY = clientY - viewport.dragStartY;
    updateViewportTransform();
  };
  const onPointerUp = () => { viewport.isDragging = false; };

  stage.addEventListener("mousedown", e => onPointerDown(e.clientX, e.clientY));
  window.addEventListener("mousemove", e => onPointerMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", onPointerUp);

  stage.addEventListener("touchstart", e => {
    if (e.touches.length === 1) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  stage.addEventListener("touchmove", e => {
    if (e.touches.length === 1 && viewport.isDragging) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  stage.addEventListener("touchend", onPointerUp);

  updateViewportTransform();
}

// ==========================================
// 11. メイン初期化
// ==========================================
function init() {
  if (typeof VideoEncoder === "undefined") {
    const mp4Btn = document.getElementById("btn-export-mp4");
    if (mp4Btn) mp4Btn.style.display = "none";
  }

  if (navigator.share) {
    const shareBtn = document.getElementById("btn-web-share");
    if (shareBtn) shareBtn.hidden = false;
  }

  if (location.hash.startsWith("#config=")) {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(location.hash.slice(8))));
      state = { ...state, ...decoded, bgImageDataUri: null };
    } catch (e) { console.warn("URL復元失敗", e); }
  }

  // スライダー操作開始時に1回だけUndo履歴を保存
  const bind = (id, key, type = "str") => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("pointerdown", () => pushUndo());
    el.addEventListener("focus", () => pushUndo());
    el.addEventListener("input", () => {
      state[key] = type === "bool" ? el.checked : (type === "num" ? Number(el.value) : el.value);
      syncUIFromState();
      renderAtTime(performance.now() - startTime);
    });
  };

  bind("ctrl-text", "text");
  bind("ctrl-vertical", "vertical", "bool");
  bind("ctrl-canvas-size", "canvasSize");
  bind("ctrl-custom-w", "customW", "num");
  bind("ctrl-custom-h", "customH", "num");
  bind("ctrl-jpeg-quality", "jpegQuality", "num");
  bind("ctrl-gif-duration", "gifDuration");
  bind("ctrl-gif-dither", "gifDither", "bool");
  bind("ctrl-line-height", "lineHeight", "num");
  bind("ctrl-size", "size", "num");
  bind("ctrl-offset-x", "offsetX", "num");
  bind("ctrl-offset-y", "offsetY", "num");
  bind("ctrl-rainbow-mode", "rainbowMode");
  bind("ctrl-solid-color", "solidColor");
  bind("ctrl-angle", "angle", "num");
  bind("ctrl-repeat", "repeat", "num");
  bind("ctrl-hard-stop", "hardStop", "bool");
  bind("ctrl-rainbow-stroke", "rainbowStroke", "bool");
  bind("ctrl-rainbow-extrude", "rainbowExtrude", "bool");
  bind("ctrl-font", "font");
  bind("ctrl-stroke", "stroke", "num");
  bind("ctrl-stroke-color", "strokeColor");
  bind("ctrl-triple-stroke", "tripleStroke", "bool");
  bind("ctrl-extrude", "extrude", "num");
  bind("ctrl-extrude-color", "extrudeColor");
  bind("ctrl-shadow-dist", "shadowDist", "num");
  bind("ctrl-shadow-blur", "shadowBlur", "num");
  bind("ctrl-shadow-color", "shadowColor");
  bind("ctrl-warp-mode", "warpMode");
  bind("ctrl-warp-amount", "warpAmount", "num");
  bind("ctrl-skew", "skew", "num");
  bind("ctrl-scale-x", "scaleX", "num");
  bind("ctrl-perspective", "perspective", "num");
  bind("ctrl-rainbow-anim", "rainbowAnim");
  bind("ctrl-rainbow-speed", "rainbowSpeed", "num");
  bind("ctrl-motion-anim", "motionAnim");
  bind("ctrl-sub-motion", "subMotion");
  bind("ctrl-motion-speed", "motionSpeed", "num");
  bind("ctrl-easing", "easing");
  bind("ctrl-bg-mode", "bgMode");
  bind("ctrl-bg-scale", "bgScale", "num");
  bind("ctrl-bg-speed", "bgSpeed", "num");
  bind("ctrl-bg-color1", "bgColor1");
  bind("ctrl-bg-color2", "bgColor2");
  bind("ctrl-img-saturate", "imgSaturate", "bool");
  bind("ctrl-img-mosaic", "imgMosaic", "bool");
  bind("ctrl-img-rainbow", "imgRainbow", "bool");
  bind("ctrl-border-style", "borderStyle");
  bind("ctrl-stamp-mode", "stampMode");

  document.getElementById("ctrl-jpeg-quality").addEventListener("input", e => {
    document.getElementById("val-jpeg-quality").textContent = Math.round(e.target.value * 100);
  });

  // ロックボタン制御
  document.querySelectorAll(".btn-lock").forEach(btn => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.lock;
      locks[k] = !locks[k];
      btn.textContent = locks[k] ? "🔒" : "🔓";
      btn.classList.toggle("locked", locks[k]);
    });
  });

  // 平成定型文ガチャ
  document.getElementById("btn-meme-gacha").addEventListener("click", () => {
    pushUndo();
    const candidates = HEISEI_MEMES.filter(m => m !== state.text);
    state.text = candidates[Math.floor(Math.random() * candidates.length)];
    syncUIFromState();
    showToast("🎰 平成定型文を引きました！");
  });

  // マイプリセット保存・読込・削除
  refreshMyPresetsDropdown();
  document.getElementById("btn-save-preset").addEventListener("click", () => {
    const name = prompt("保存するマイプリセット名を入力してください:", `マイ設定_${new Date().toLocaleTimeString().slice(0,5)}`);
    if (!name || !name.trim()) return;
    const map = loadMyPresetsMap();
    const { bgImageDataUri, ...saveable } = state;
    map[name.trim()] = saveable;
    localStorage.setItem(MY_PRESET_KEY, JSON.stringify(map));
    refreshMyPresetsDropdown();
    document.getElementById("ctrl-my-presets").value = name.trim();
    showToast(`💾 「${name.trim()}」を保存しました`);
  });

  document.getElementById("ctrl-my-presets").addEventListener("change", e => {
    const name = e.target.value;
    if (!name) return;
    const map = loadMyPresetsMap();
    if (map[name]) {
      pushUndo();
      state = { ...state, ...map[name] };
      syncUIFromState();
      showToast(`📂 「${name}」を読み込みました`);
    }
  });

  document.getElementById("btn-del-preset").addEventListener("click", () => {
    const sel = document.getElementById("ctrl-my-presets");
    const name = sel.value;
    if (!name) { showToast("⚠️ 削除するマイプリセットを選択してください"); return; }
    const map = loadMyPresetsMap();
    delete map[name];
    localStorage.setItem(MY_PRESET_KEY, JSON.stringify(map));
    refreshMyPresetsDropdown();
    showToast(`🗑️ 「${name}」を削除しました`);
  });

  // タブ切り替え
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.querySelectorAll(".control-group").forEach(grp => {
        grp.hidden = tab !== "all" && grp.dataset.group !== tab;
      });
    });
  });

  // 画像アップロード
  document.getElementById("btn-trigger-upload").addEventListener("click", () => document.getElementById("ctrl-bg-file").click());
  document.getElementById("ctrl-bg-file").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast("⚠️ 10MB以下の画像を選択してください"); return; }
    const img = new Image();
    img.onload = () => {
      pushUndo();
      const maxDim = 1280;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * r);
        height = Math.round(height * r);
      }
      const c = document.createElement("canvas");
      c.width = width; c.height = height;
      c.getContext("2d").drawImage(img, 0, 0, width, height);
      state.bgImageDataUri = c.toDataURL("image/jpeg", 0.85);
      syncUIFromState();
    };
    img.src = URL.createObjectURL(file);
  });

  document.getElementById("ctrl-preset").addEventListener("change", e => {
    pushUndo();
    state = { ...state, ...PRESETS[e.target.value] };
    syncUIFromState();
  });

  // ロック考慮型ランダム生成
  document.getElementById("btn-random").addEventListener("click", () => {
    pushUndo();
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const next = { ...state };

    if (!locks.font) {
      next.font = pick(Object.keys(FONT_REGISTRY));
      next.stroke = Math.floor(Math.random() * 10);
      next.tripleStroke = Math.random() > 0.5;
      next.extrude = Math.floor(Math.random() * 20);
    }
    if (!locks.color) {
      next.rainbowMode = pick(["vivid", "pastel", "cyber", "metallic", "tex_water", "tex_marble", "tex_fire", "tex_chrome"]);
      next.angle = Math.floor(Math.random() * 360);
      next.repeat = Math.floor(Math.random() * 5) + 1;
      next.hardStop = Math.random() > 0.5;
      next.rainbowStroke = Math.random() > 0.5;
      next.rainbowExtrude = Math.random() > 0.5;
    }
    if (!locks.shape) {
      next.warpMode = pick(["none", "arch", "wave"]);
      next.warpAmount = Math.floor(Math.random() * 120) - 60;
    }
    if (!locks.motion) {
      next.rainbowAnim = pick(["none", "hue", "flow", "charWave"]);
      next.rainbowSpeed = Number((Math.random() * 2.5 + 0.4).toFixed(1));
      next.motionAnim = pick(["none", "rotate2d", "rotateY", "pulse"]);
      next.subMotion = pick(["none", "bounce", "shake"]);
      next.motionSpeed = Number((Math.random() * 3.0 + 0.6).toFixed(1));
    }
    if (!locks.bg) {
      next.bgMode = pick(["transparent", "sunburst", "rainbowStripe", "space", "sky", "dots"]);
      next.bgScale = Math.floor(Math.random() * 150) + 50;
      next.bgSpeed = Number((Math.random() * 4.0 + 0.8).toFixed(1));
      next.borderStyle = pick(["none", "ridge", "groove", "rainbow"]);
      next.stampMode = pick(["none", "new", "construction", "kiriban", "fire"]);
    }

    state = next;
    syncUIFromState();
  });

  const performUndo = () => {
    if (!undoStack.length) return;
    state = JSON.parse(undoStack.pop());
    updateUndoUI();
    syncUIFromState();
    showToast("↩️ 1つ前の状態に戻しました");
  };

  document.getElementById("btn-undo").addEventListener("click", performUndo);

  document.getElementById("btn-reset").addEventListener("click", () => {
    pushUndo();
    const p = document.getElementById("ctrl-preset").value;
    state = { ...state, ...PRESETS[p], bgImageDataUri: null };
    syncUIFromState();
  });

  document.getElementById("btn-autofit").addEventListener("click", autoFitFontSize);

  document.getElementById("btn-share").addEventListener("click", async () => {
    const { bgImageDataUri, ...shareable } = state;
    const encoded = btoa(encodeURIComponent(JSON.stringify(shareable)));
    const url = `${location.origin}${location.pathname}#config=${encoded}`;
    await navigator.clipboard.writeText(url);
    showToast(bgImageDataUri
      ? "📋 URLをコピーしました（※アップロード画像は共有URLに含まれません）"
      : "📋 このダサ設定のURLをコピーしました！");
  });

  document.getElementById("btn-export-png").addEventListener("click", () => exportStaticImage("png"));
  document.getElementById("btn-export-jpeg").addEventListener("click", () => exportStaticImage("jpeg"));
  document.getElementById("btn-export-gif").addEventListener("click", exportGifAnimation);
  document.getElementById("btn-export-mp4").addEventListener("click", exportMp4Video);
  document.getElementById("btn-web-share")?.addEventListener("click", () => exportStaticImage("png"));
  document.getElementById("btn-copy-code").addEventListener("click", async () => {
    await navigator.clipboard.writeText(generateExportCode());
    showToast("📋 HTML/CSSコードをコピーしました！");
  });

  document.getElementById("btn-mobile-save").addEventListener("click", () => {
    openModal("💾 画像・GIF・動画の保存", `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <button id="m-png" class="btn btn-primary">🖼️ PNG保存（透過・高画質）</button>
        <button id="m-jpeg" class="btn btn-primary">📷 JPEG保存</button>
        <button id="m-gif" class="btn btn-rainbow">🎞️ GIFアニメ保存（SNS自動再生用）</button>
        ${typeof VideoEncoder !== "undefined" ? `<button id="m-mp4" class="btn btn-primary">🎬 MP4動画保存</button>` : ""}
      </div>
    `);
    document.getElementById("m-png").onclick = () => { document.getElementById("app-modal").hidden = true; exportStaticImage("png"); };
    document.getElementById("m-jpeg").onclick = () => { document.getElementById("app-modal").hidden = true; exportStaticImage("jpeg"); };
    document.getElementById("m-gif").onclick = () => { document.getElementById("app-modal").hidden = true; exportGifAnimation(); };
    if (document.getElementById("m-mp4")) {
      document.getElementById("m-mp4").onclick = () => { document.getElementById("app-modal").hidden = true; exportMp4Video(); };
    }
  });

  document.getElementById("btn-mobile-code").addEventListener("click", () => {
    const code = generateExportCode();
    openModal("📋 埋め込みHTML/CSSコード", `
      <textarea readonly rows="8" style="width:100%; margin-bottom:10px;">${escapeHtml(code)}</textarea>
      <button id="m-copy" class="btn btn-primary" style="width:100%;">ワンクリックコピー</button>
    `);
    document.getElementById("m-copy").onclick = async () => {
      await navigator.clipboard.writeText(code);
      showToast("📋 コードをコピーしました！");
    };
  });

  document.getElementById("btn-close-modal").addEventListener("click", () => document.getElementById("app-modal").hidden = true);
  document.getElementById("btn-cancel-export").addEventListener("click", () => { isExportCancelled = true; hideProgress(); });

  const togglePlayPause = () => {
    isPlaying = !isPlaying;
    document.getElementById("btn-play-pause").textContent = isPlaying ? "⏸️ 一時停止" : "▶️ 再生";
  };
  document.getElementById("btn-play-pause").addEventListener("click", togglePlayPause);

  // キーボードショートカット (Ctrl+Z / Space)
  window.addEventListener("keydown", e => {
    const tag = document.activeElement?.tagName;
    const isInput = tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT";
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !isInput) {
      e.preventDefault();
      performUndo();
    } else if (e.code === "Space" && !isInput) {
      e.preventDefault();
      togglePlayPause();
    }
  });

  initViewportInteractions();
  syncUIFromState();

  function tick(now) {
    if (isPlaying) renderAtTime(now - startTime);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

init();