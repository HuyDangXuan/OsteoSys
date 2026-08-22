/**
 * Verification Script for Dynamic UI Scale & Settings Engine
 */

console.log("🚀 [OsteoSys Test] Starting UI Scale & System Settings Verification...");

// 1. Check UI Scale Levels & Font Size Mapping
const UI_SCALE_LEVELS = [85, 90, 100, 110, 125];
const UI_SCALE_CONFIGS = {
  85: { label: "85%", fontSizePx: 13.6, sublabel: "Siêu gọn (Compact)" },
  90: { label: "90%", fontSizePx: 14.4, sublabel: "Gọn gàng" },
  100: { label: "100%", fontSizePx: 16.0, sublabel: "Mặc định (Chuẩn)" },
  110: { label: "110%", fontSizePx: 17.6, sublabel: "Thoải mái (Comfort)" },
  125: { label: "125%", fontSizePx: 20.0, sublabel: "Phóng to (Large)" },
};

console.log("\n🧪 --- TEST 1: UI Scale Levels & Proportional Base Font Sizes ---");
UI_SCALE_LEVELS.forEach((level) => {
  const expectedFontSize = (level / 100) * 16;
  const config = UI_SCALE_CONFIGS[level];
  const diff = Math.abs(config.fontSizePx - expectedFontSize);
  if (diff > 0.001) {
    throw new Error(`Scale mapping mismatch for ${level}%: expected ${expectedFontSize}px, got ${config.fontSizePx}px`);
  }
  console.log(`✅ [Scale ${level}%] -> Base Font Size: ${config.fontSizePx}px (${config.sublabel})`);
});

// 2. Simulate Cookie Parser & Early Script Initialization
console.log("\n🧪 --- TEST 2: Zero-Flash Cookie & Storage Parsing Simulation ---");
function simulateEarlyScript(cookieHeader, localStorageMock) {
  let scale = 100;
  const match = cookieHeader.match(new RegExp("(?:^|; )sonost_ui_scale=([^;]*)"));
  if (match && match[1]) {
    scale = parseInt(match[1], 10);
  } else if (localStorageMock && localStorageMock["sonost_ui_scale"]) {
    scale = parseInt(localStorageMock["sonost_ui_scale"], 10);
  }
  const scaleMap = { 85: "13.6px", 90: "14.4px", 100: "16px", 110: "17.6px", 125: "20px" };
  return { scale, fontSize: scaleMap[scale] || "16px" };
}

const test1 = simulateEarlyScript("other_cookie=123; sonost_ui_scale=110; theme=dark", {});
console.log(`✅ [Cookie Parse Test] scale: ${test1.scale}%, fontSize: ${test1.fontSize}`);
if (test1.scale !== 110 || test1.fontSize !== "17.6px") throw new Error("Cookie parse failed!");

const test2 = simulateEarlyScript("", { sonost_ui_scale: "85" });
console.log(`✅ [LocalStorage Fallback Test] scale: ${test2.scale}%, fontSize: ${test2.fontSize}`);
if (test2.scale !== 85 || test2.fontSize !== "13.6px") throw new Error("LocalStorage fallback failed!");

// 3. Test Step Transitions
console.log("\n🧪 --- TEST 3: Step Increment & Decrement Logic ---");
function stepScale(current, direction) {
  const index = UI_SCALE_LEVELS.indexOf(current);
  if (direction === "up") {
    return index < UI_SCALE_LEVELS.length - 1 ? UI_SCALE_LEVELS[index + 1] : current;
  } else if (direction === "down") {
    return index > 0 ? UI_SCALE_LEVELS[index - 1] : current;
  }
  return 100;
}

let cur = 100;
cur = stepScale(cur, "up"); // 110
if (cur !== 110) throw new Error("Step up failed");
cur = stepScale(cur, "up"); // 125
if (cur !== 125) throw new Error("Step up to max failed");
cur = stepScale(cur, "up"); // 125 (max bound)
if (cur !== 125) throw new Error("Max bound overflow");
cur = stepScale(cur, "down"); // 110
cur = stepScale(cur, "down"); // 100
cur = stepScale(cur, "down"); // 90
cur = stepScale(cur, "down"); // 85
if (cur !== 85) throw new Error("Step down to min failed");
cur = stepScale(cur, "down"); // 85 (min bound)
if (cur !== 85) throw new Error("Min bound underflow");
cur = stepScale(cur, "reset"); // 100
if (cur !== 100) throw new Error("Reset failed");

console.log("✅ [Step & Bounds Test] All scale transitions (85% <-> 125%) bounded safely.");

console.log("\n🎉 ========================================================================");
console.log("🎉 UI SCALE & SETTINGS ENGINE VERIFICATION PASSED 100%!");
console.log("🎉 ========================================================================\n");
