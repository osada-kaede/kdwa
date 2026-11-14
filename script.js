// ==========================================
// 1. フォント定数レジストリ (FONT_REGISTRY)
// ==========================================
const FONT_REGISTRY = {
  "Dela Gothic One": {
    label: "極太ゴシック",
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/dela-gothic-one@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/delagothicone/DelaGothicOne-Regular.ttf"
  },
  "Reggae One": {
    label: "トゲトゲポップ",
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/reggae-one@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/reggaeone/ReggaeOne-Regular.ttf"
  },
  "RocknRoll One": {
    label: "ロックンロール",
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/rocknroll-one@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/rocknrollone/RocknRollOne-Regular.ttf"
  },
  "Noto Sans JP": {
    label: "標準ゴシック",
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf"
  },
  "Noto Serif JP": {
    label: "重厚明朝",
    cssUrl: "https://cdn.jsdelivr.net/npm/@fontsource/noto-serif-jp@5.0.1/index.min.css",
    binaryUrl: "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf"
  }
};

// ==========================================
// 2. プリセット定義（テキスト維持仕様）
// ==========================================
const PRESETS = {
  excel97: {
    rainbowMode: "vivid", angle: 90, repeat: 1, hardStop: false,
    rainbowStroke: false, rainbowExtrude: false,
    font: "Dela Gothic One", size: 64, stroke: 3, strokeColor: "#000080",
    extrude: 6, warpMode: "arch", warpAmount: 35, perspective: 0,
    rainbowAnim: "none", motionAnim: "none", speed: 2.0,
    bgMode: "transparent", borderStyle: "none"
  },
  gaming: {
    rainbowMode: "cyber", angle: 45, repeat: 2, hardStop: false,
    rainbowStroke: true, rainbowExtrude: true,
    font: "RocknRoll One", size: 68, stroke: 4, strokeColor: "#ffffff",
    extrude: 8, warpMode: "none", warpAmount: 0, perspective: 0,
    rainbowAnim: "hue", motionAnim: "shake", speed: 0.4,
    bgMode: "solid", bgColor: "#000000", borderStyle: "rainbow"
  },
  kiriban: {
    rainbowMode: "vivid", angle: 0, repeat: 1, hardStop: true,
    rainbowStroke: false, rainbowExtrude: false,
    font: "Reggae One", size: 56, stroke: 6, strokeColor: "#ffffff",
    extrude: 4, warpMode: "wave", warpAmount: 25, perspective: 0,
    rainbowAnim: "flow", motionAnim: "bounce", speed: 1.5,
    bgMode: "space", borderStyle: "ridge"
  },
  pachinko: {
    rainbowMode: "metallic", angle: 135, repeat: 3, hardStop: true,
    rainbowStroke: true, rainbowExtrude: true,
    font: "Dela Gothic One", size: 72, stroke: 6, strokeColor: "#ff0000",
    extrude: 18, warpMode: "none", warpAmount: 0, perspective: -20,
    rainbowAnim: "hue", motionAnim: "none", speed: 0.8,
    bgMode: "sunburst", borderStyle: "rainbow"
  },
  void3d: {
    rainbowMode: "pastel", angle: 90, repeat: 1, hardStop: false,
    rainbowStroke: false, rainbowExtrude: true,
    font: "Noto Serif JP", size: 60, stroke: 2, strokeColor: "#333333",
    extrude: 12, warpMode: "none", warpAmount: 0, perspective: 0,
    rainbowAnim: "none", motionAnim: "rotateY", speed: 3.0,
    bgMode: "solid", bgColor: "#1e3a8a", borderStyle: "none"
  }
};

// ==========================================
// 3. アプリ状態管理 & Undo履歴
// ==========================================
let state = {
  text: "祝！キリ番10000HIT達成！！",
  canvasSize: "auto",
  bgColor: "#ffffff",
  bgImageDataUri: null, // URL共有除外対象
  ...PRESETS.excel97
};

const undoStack = [];
const MAX_UNDO = 10;
let isPlaying = true;
let startTime = performance.now();

function pushUndo() {
  undoStack.push(JSON.stringify(state));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  updateUndoUI();
}

function updateUndoUI() {
  const btn = document.getElementById("btn-undo");
  const count = document.getElementById("undo-count");
  btn.disabled = undoStack.length === 0;
  count.textContent = undoStack.length;
}

// ==========================================
// 4. グラデーション生成ロジック
// ==========================================
function buildGradientCSS(s, offsetPercent = 0) {
  const palettes = {
    vivid: ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"],
    pastel: ["#ff9aa2", "#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#c7ceea"],
    cyber: ["#ff0055", "#00ffcc", "#ffff00", "#9d00ff", "#00ccff"],
    metallic: ["#ffd700", "#ffffff", "#ff4500", "#00ffff", "#ffd700", "#c0c0c0"],
    solid: ["#ff0055", "#ff0055"]
  };
  const colors = palettes[s.rainbowMode] || palettes.vivid;
  const stops = [];
  const totalSteps = colors.length * s.repeat;

  for (let i = 0; i <= totalSteps; i++) {
    const color = colors[i % colors.length];
    const pct = ((i / totalSteps) * 100 + offsetPercent) % 100;
    if (s.hardStop && i > 0) {
      const prevColor = colors[(i - 1) % colors.length];
      stops.push(`${prevColor} ${(i / totalSteps) * 100}%`);
    }
    stops.push(`${color} ${(i / totalSteps) * 100}%`);
  }
  return `linear-gradient(${s.angle}deg, ${stops.join(", ")})`;
}

// ==========================================
// 5. 時刻 t 同期型の決定論的描画エンジン
// ==========================================
function renderAtTime(tMs) {
  const mount = document.getElementById("wordart-mount");
  const uid = "preview";
  const periodMs = Math.max(300, state.speed * 1000);
  const progress = (tMs % periodMs) / periodMs; // 0.0 ~ 1.0

  // アニメーション計算（時刻 t に完全依存）
  let hueDeg = 0;
  if (state.rainbowAnim === "hue") {
    hueDeg = Math.round(progress * 360);
  }

  let transformStr = "";
  if (state.warpMode === "none" && state.perspective !== 0) {
    transformStr += `perspective(400px) rotateX(${state.perspective}deg) `;
  }
  if (state.motionAnim === "rotateY") {
    transformStr += `rotateY(${progress * 360}deg) `;
  } else if (state.motionAnim === "bounce") {
    const y = Math.sin(progress * Math.PI * 2) * -15;
    transformStr += `translateY(${y.toFixed(1)}px) `;
  } else if (state.motionAnim === "shake") {
    const x = Math.sin(progress * Math.PI * 8) * 5;
    const r = Math.cos(progress * Math.PI * 6) * 3;
    transformStr += `translateX(${x.toFixed(1)}px) rotate(${r.toFixed(1)}deg) `;
  }

  // 背景スタイル構築
  let bgStyle = "background: transparent;";
  if (state.bgMode === "solid") {
    bgStyle = `background: ${state.bgColor};`;
  } else if (state.bgMode === "sunburst") {
    bgStyle = `background: repeating-conic-gradient(from ${progress * 360}deg, #ff0000 0deg 15deg, #ffff00 15deg 30deg, #00ff00 30deg 45deg, #00ffff 45deg 60deg, #ff00ff 60deg 75deg);`;
  } else if (state.bgMode === "space") {
    bgStyle = `background: radial-gradient(#fff 1px, transparent 1px), radial-gradient(#ff0 1px, #000022 1px); background-size: 40px 40px; background-position: 0 0, 20px 20px;`;
  } else if (state.bgMode === "image" && state.bgImageDataUri) {
    bgStyle = `background: url('${state.bgImageDataUri}') center/cover no-repeat; filter: saturate(200%);`;
  }

  // 枠線スタイル
  let borderStyle = "";
  if (state.borderStyle === "ridge") {
    borderStyle = "border: 8px ridge #ffd700;";
  } else if (state.borderStyle === "rainbow") {
    borderStyle = `border: 8px solid hsl(${hueDeg}, 100%, 50%);`;
  }

  // キャンバスサイズ
  let sizeStyle = "padding: 24px 36px; display: inline-flex; align-items: center; justify-content: center;";
  if (state.canvasSize !== "auto") {
    const [w, h] = state.canvasSize.split("x");
    sizeStyle = `width: ${w}px; height: ${h}px; display: flex; align-items: center; justify-content: center; overflow: hidden;`;
  }

  const grad = buildGradientCSS(state);
  const bgPos = state.rainbowAnim === "flow" ? `${progress * 200}% 50%` : "50% 50%";

  // 描画モード分岐（直線HTML/CSS vs アーチSVG）
  let innerContent = "";
  if (state.warpMode === "none") {
    // 3D押し出し影の生成（最大25層キャップ）
    const layers = Math.min(25, state.extrude);
    const shadows = [];
    for (let i = 1; i <= layers; i++) {
      const c = state.rainbowExtrude ? `hsl(${(i * 25 + hueDeg) % 360}, 100%, 45%)` : "#222222";
      shadows.push(`${i}px ${i}px 0px ${c}`);
    }
    const textShadowCSS = shadows.length ? `text-shadow: ${shadows.join(", ")};` : "";

    // DOMキャプチャバグ防止のため、影レイヤーと塗りレイヤーを分離
    const lines = escapeHtml(state.text).replace(/\n/g, "<br>");
    innerContent = `
      <div style="position: relative; display: inline-block; transform: ${transformStr}; filter: hue-rotate(${hueDeg}deg);">
        <!-- 背面：影＆輪郭レイヤー -->
        <div aria-hidden="true" style="
          font-family: '${state.font}', sans-serif;
          font-size: ${state.size}px;
          font-weight: 900;
          line-height: 1.2;
          text-align: center;
          white-space: pre-wrap;
          color: transparent;
          -webkit-text-stroke: ${state.stroke * 2}px ${state.strokeColor};
          paint-order: stroke fill;
          ${textShadowCSS}
        ">${lines}</div>
        <!-- 前面：虹グラデーション塗りレイヤー -->
        <div style="
          position: absolute;
          inset: 0;
          font-family: '${state.font}', sans-serif;
          font-size: ${state.size}px;
          font-weight: 900;
          line-height: 1.2;
          text-align: center;
          white-space: pre-wrap;
          background-image: ${grad};
          background-size: 200% 200%;
          background-position: ${bgPos};
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        ">${lines}</div>
      </div>
    `;
  } else {
    // SVGモード（複数行対応の <textPath> アーチ・ウェーブ）
    innerContent = buildSvgMarkup(state, transformStr, hueDeg);
  }

  mount.innerHTML = `
    <div id="wordart-canvas-box" style="${sizeStyle} ${bgStyle} ${borderStyle} box-sizing: border-box;">
      ${innerContent}
    </div>
  `;
}

function buildSvgMarkup(s, transformStr, hueDeg) {
  const lines = s.text.split("\n");
  const lineHeight = s.size * 1.3;
  const width = Math.max(400, ...lines.map(l => l.length * s.size * 1.1));
  const height = lines.length * lineHeight + Math.abs(s.warpAmount) * 2 + s.size;
  const curve = s.warpAmount * 1.8;

  let pathsAndTexts = "";
  lines.forEach((line, idx) => {
    const yBase = s.size + Math.abs(curve) * 0.6 + idx * lineHeight;
    const pathId = `kuso-path-${idx}`;
    const d = s.warpMode === "arch"
      ? `M 20,${yBase} Q ${width / 2},${yBase - curve * 2} ${width - 20},${yBase}`
      : `M 20,${yBase} Q ${width * 0.25},${yBase - curve} ${width * 0.5},${yBase} T ${width - 20},${yBase}`;

    pathsAndTexts += `
      <path id="${pathId}" d="${d}" fill="none" />
      <text font-family="'${s.font}', sans-serif" font-size="${s.size}" font-weight="900"
            fill="url(#kuso-rainbow-grad)" stroke="${s.strokeColor}" stroke-width="${s.stroke}"
            paint-order="stroke fill" text-anchor="middle">
        <textPath href="#${pathId}" startOffset="50%">${escapeHtml(line)}</textPath>
      </text>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
         style="overflow: visible; transform: ${transformStr}; filter: hue-rotate(${hueDeg}deg);">
      <defs>
        <linearGradient id="kuso-rainbow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff0000" />
          <stop offset="20%" stop-color="#ffff00" />
          <stop offset="40%" stop-color="#00ff00" />
          <stop offset="60%" stop-color="#00ffff" />
          <stop offset="80%" stop-color="#0000ff" />
          <stop offset="100%" stop-color="#ff00ff" />
        </linearGradient>
      </defs>
      ${pathsAndTexts}
    </svg>
  `;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

// ==========================================
// 6. コピペ用 HTML/CSS コード生成（all: initial 対策済み）
// ==========================================
function generateExportCode() {
  const suffix = Math.random().toString(36).substring(2, 6);
  const className = `kuso-wordart-${suffix}`;
  const fontInfo = FONT_REGISTRY[state.font];
  const grad = buildGradientCSS(state);
  const lines = escapeHtml(state.text).replace(/\n/g, "<br>");

  const code = `<!-- クソダサ・レインボーワードアート -->
<link rel="stylesheet" href="${fontInfo.cssUrl}">
<style>
  .${className}-wrap {
    all: initial;
    display: inline-block;
    box-sizing: border-box;
    font-family: '${state.font}', sans-serif;
    padding: 20px;
    ${state.bgMode === "image" ? "background-image: url('/* ここに画像のURLを指定してください */');" : ""}
  }
  .${className}-text {
    font-family: '${state.font}', sans-serif;
    font-size: ${state.size}px;
    font-weight: 900;
    background-image: ${grad};
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-stroke: ${state.stroke}px ${state.strokeColor};
    paint-order: stroke fill;
  }
</style>
<div class="${className}-wrap">
  <div class="${className}-text">${lines}</div>
</div>`;

  const out = document.getElementById("code-output");
  if (out) out.value = code;
  return code;
}

// ==========================================
// 7. UIバインディング & 排他制御・URL共有
// ==========================================
function syncUIFromState() {
  document.getElementById("ctrl-text").value = state.text;
  document.getElementById("char-count").textContent = state.text.length;
  document.getElementById("ctrl-canvas-size").value = state.canvasSize;
  document.getElementById("ctrl-rainbow-mode").value = state.rainbowMode;
  document.getElementById("ctrl-angle").value = state.angle;
  document.getElementById("val-angle").textContent = state.angle;
  document.getElementById("ctrl-repeat").value = state.repeat;
  document.getElementById("val-repeat").textContent = state.repeat;
  document.getElementById("ctrl-hard-stop").checked = state.hardStop;
  document.getElementById("ctrl-rainbow-stroke").checked = state.rainbowStroke;
  document.getElementById("ctrl-rainbow-extrude").checked = state.rainbowExtrude;
  document.getElementById("ctrl-font").value = state.font;
  document.getElementById("ctrl-size").value = state.size;
  document.getElementById("val-size").textContent = state.size;
  document.getElementById("ctrl-stroke").value = state.stroke;
  document.getElementById("val-stroke").textContent = state.stroke;
  document.getElementById("ctrl-stroke-color").value = state.strokeColor;
  document.getElementById("ctrl-extrude").value = state.extrude;
  document.getElementById("val-extrude").textContent = state.extrude;
  document.getElementById("ctrl-warp-mode").value = state.warpMode;
  document.getElementById("ctrl-warp-amount").value = state.warpAmount;
  document.getElementById("val-warp-amount").textContent = state.warpAmount;
  document.getElementById("ctrl-perspective").value = state.perspective;
  document.getElementById("val-perspective").textContent = state.perspective;
  document.getElementById("ctrl-rainbow-anim").value = state.rainbowAnim;
  document.getElementById("ctrl-motion-anim").value = state.motionAnim;
  document.getElementById("ctrl-speed").value = state.speed;
  document.getElementById("val-speed").textContent = state.speed.toFixed(1);
  document.getElementById("ctrl-bg-mode").value = state.bgMode;
  document.getElementById("ctrl-border-style").value = state.borderStyle;

  // 排他仕様：SVGモード時は遠近台形スライダーを無効化
  const wrapPersp = document.getElementById("wrap-perspective");
  const ctrlPersp = document.getElementById("ctrl-perspective");
  if (state.warpMode !== "none") {
    wrapPersp.classList.add("disabled-control");
    ctrlPersp.disabled = true;
  } else {
    wrapPersp.classList.remove("disabled-control");
    ctrlPersp.disabled = false;
  }

  generateExportCode();
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 3000);
}

function init() {
  // WebCodecs 非対応環境では MP4 ボタンを無効化
  if (typeof VideoEncoder === "undefined") {
    const mp4Btn = document.getElementById("btn-export-mp4");
    if (mp4Btn) {
      mp4Btn.disabled = true;
      mp4Btn.title = "お使いのブラウザはMP4出力に非対応のためGIF保存をご利用ください";
    }
  }

  // URLハッシュから設定復元
  if (location.hash.startsWith("#config=")) {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(location.hash.slice(8))));
      state = { ...state, ...decoded, bgImageDataUri: null };
    } catch (e) {
      console.warn("URL設定の復元に失敗しました", e);
    }
  }

  // イベント登録
  const bindInput = (id, key, isNumber = false, isCheckbox = false) => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => {
      pushUndo();
      state[key] = isCheckbox ? el.checked : (isNumber ? Number(el.value) : el.value);
      syncUIFromState();
      renderAtTime(performance.now() - startTime);
    });
  };

  bindInput("ctrl-text", "text");
  bindInput("ctrl-canvas-size", "canvasSize");
  bindInput("ctrl-rainbow-mode", "rainbowMode");
  bindInput("ctrl-angle", "angle", true);
  bindInput("ctrl-repeat", "repeat", true);
  bindInput("ctrl-hard-stop", "hardStop", false, true);
  bindInput("ctrl-rainbow-stroke", "rainbowStroke", false, true);
  bindInput("ctrl-rainbow-extrude", "rainbowExtrude", false, true);
  bindInput("ctrl-font", "font");
  bindInput("ctrl-size", "size", true);
  bindInput("ctrl-stroke", "stroke", true);
  bindInput("ctrl-stroke-color", "strokeColor");
  bindInput("ctrl-extrude", "extrude", true);
  bindInput("ctrl-warp-mode", "warpMode");
  bindInput("ctrl-warp-amount", "warpAmount", true);
  bindInput("ctrl-perspective", "perspective", true);
  bindInput("ctrl-rainbow-anim", "rainbowAnim");
  bindInput("ctrl-motion-anim", "motionAnim");
  bindInput("ctrl-speed", "speed", true);
  bindInput("ctrl-border-style", "borderStyle");

  // 背景モード＆画像アップロード（長辺1280pxリサイズ保護）
  document.getElementById("ctrl-bg-mode").addEventListener("change", (e) => {
    pushUndo();
    state.bgMode = e.target.value;
    if (state.bgMode === "image") {
      document.getElementById("ctrl-bg-file").click();
    }
    syncUIFromState();
  });

  document.getElementById("ctrl-bg-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("⚠️ 10MB以下の画像を選択してください");
      return;
    }
    const img = new Image();
    img.onload = () => {
      const maxDim = 1280;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      state.bgImageDataUri = canvas.toDataURL("image/jpeg", 0.85);
      renderAtTime(performance.now() - startTime);
    };
    img.src = URL.createObjectURL(file);
  });

  // プリセット切替（入力テキストは維持）
  document.getElementById("ctrl-preset").addEventListener("change", (e) => {
    pushUndo();
    const preset = PRESETS[e.target.value];
    if (preset) {
      state = { ...state, ...preset };
      syncUIFromState();
    }
  });

  // おまかせランダム生成
  document.getElementById("btn-random").addEventListener("click", () => {
    pushUndo();
    const fonts = Object.keys(FONT_REGISTRY);
    const modes = ["vivid", "pastel", "cyber", "metallic"];
    const warps = ["none", "arch", "wave"];
    const rAnims = ["none", "hue", "flow"];
    const mAnims = ["none", "rotateY", "bounce", "shake"];
    state = {
      ...state,
      rainbowMode: modes[Math.floor(Math.random() * modes.length)],
      angle: Math.floor(Math.random() * 360),
      repeat: Math.floor(Math.random() * 5) + 1,
      hardStop: Math.random() > 0.5,
      rainbowStroke: Math.random() > 0.5,
      rainbowExtrude: Math.random() > 0.5,
      font: fonts[Math.floor(Math.random() * fonts.length)],
      stroke: Math.floor(Math.random() * 10),
      extrude: Math.floor(Math.random() * 18),
      warpMode: warps[Math.floor(Math.random() * warps.length)],
      warpAmount: Math.floor(Math.random() * 120) - 60,
      rainbowAnim: rAnims[Math.floor(Math.random() * rAnims.length)],
      motionAnim: mAnims[Math.floor(Math.random() * mAnims.length)],
      speed: Number((Math.random() * 2.5 + 0.4).toFixed(1))
    };
    syncUIFromState();
  });

  // Undo & リセット
  document.getElementById("btn-undo").addEventListener("click", () => {
    if (undoStack.length === 0) return;
    state = JSON.parse(undoStack.pop());
    updateUndoUI();
    syncUIFromState();
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    pushUndo();
    const currentPreset = document.getElementById("ctrl-preset").value;
    state = { ...state, ...PRESETS[currentPreset], bgImageDataUri: null };
    syncUIFromState();
  });

  // URL共有（アップロード画像は除外）
  document.getElementById("btn-share").addEventListener("click", async () => {
    const { bgImageDataUri, ...shareable } = state;
    const encoded = btoa(encodeURIComponent(JSON.stringify(shareable)));
    const url = `${location.origin}${location.pathname}#config=${encoded}`;
    await navigator.clipboard.writeText(url);
    if (bgImageDataUri) {
      showToast("📋 URLをコピーしました（※アップロード画像は共有URLに含まれません）");
    } else {
      showToast("📋 このダサ設定のURLをコピーしました！");
    }
  });

  // コードコピー
  document.getElementById("btn-copy-code").addEventListener("click", async () => {
    const code = generateExportCode();
    await navigator.clipboard.writeText(code);
    showToast("📋 HTML/CSSコードをコピーしました！");
  });

  // 再生・一時停止
  document.getElementById("btn-play-pause").addEventListener("click", (e) => {
    isPlaying = !isPlaying;
    e.target.textContent = isPlaying ? "⏸️ 一時停止" : "▶️ 再生";
  });

  syncUIFromState();

  // メインプレビューループ（描画自体はステートレスな renderAtTime(t) に委譲）
  function tick(now) {
    if (isPlaying) {
      renderAtTime(now - startTime);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

init();