function grossSpeed(srcElement){
const TESTS = [
  { textId: "175779", finishId: "175794" },
  { textId: "175835", finishId: "175794" }
];

/* ============  helpers =================== */
function normalizeSpaces(txt) {
  let out = "", gap = false;
  for (let ch of txt) {
    if (ch === " ") { if (!gap) { out += " "; gap = true; } }
    else { out += ch; gap = false; }
  }
  return out.trim();
}

function extraSpaceRuns(txt) {
  const runs = [];
  txt.replace(/ {2,}/g, (m, idx) => runs.push({ index: idx, length: m.length }));
  return runs;
}

/* ============  main initializer ======================== */
function initTest(cfg) {
  const typingFld = $("#" + cfg.textId).prop("readonly", true);
  const finishBtn = $("#" + cfg.finishId);
  let startTime = null;

  /* ---- Direct activation ---- */
  typingFld.one("mousedown focus", function () {
    startTime = new Date();
    console.log("%cTyping test started ▶", "color:#0a0;font-weight:bold");
    typingFld.prop("readonly", false).trigger("focus");
  });

  /* ---- finish button ---- */
  finishBtn.on("click", () => {
    finishBtn.val("TimeUp").trigger("change");
  });

  /* ---- scoring ---- */
  finishBtn.on("change", () => {
    if (!startTime) { console.warn("⚠ No start time recorded."); return; }

    const minutes = (Date.now() - startTime) / 1000 / 60;
    const typedRaw = typingFld.val();
    const typedFix = normalizeSpaces(typedRaw);
    const words = typedFix ? typedFix.split(" ") : [];

    let charErr = 0, wordErr = 0;
    const detail = [];

    const runs = extraSpaceRuns(typedRaw);
    runs.forEach(r => {
      charErr += r.length - 1;
      detail.push(`🔸 Extra spaces (${r.length - 1}) at char ${r.index}`);
    });

    if (typedRaw.startsWith(" ")) {
      charErr++;
      detail.push("🔸 Leading space at beginning");
    }

    if (typedRaw.endsWith(" ")) {
      charErr++;
      detail.push("🔸 Trailing space at end");
    }

    const punctRuns = typedRaw.match(/[.,!?;:]{2,}/g) || [];
    punctRuns.forEach(run => {
      charErr += run.length - 1;
      wordErr++;
      detail.push(`🔸 Repeated punctuation “${run}”`);
    });

    let spaceBeforeCnt = 0;
    for (let i = 0; i < typedRaw.length - 1; i++) {
      if (typedRaw[i] === " " && ".,!?;:".includes(typedRaw[i + 1])) {
        charErr++;
        wordErr++;
        spaceBeforeCnt++;
        detail.push(`🔸 Space before punctuation at char ${i}`);
      }
    }

    const seen = new Map();
    words.forEach((w, idx) => {
      const clean = w.toLowerCase().replace(/[.,!?;:]/g, "");
      if (!clean) return;
      if (seen.has(clean)) {
        wordErr++;
        charErr += clean.length;
        detail.push(`🔸 Repeated word “${w}” (first at #${seen.get(clean) + 1}, again at #${idx + 1})`);
      } else {
        seen.set(clean, idx);
      }
    });

    const totalChars = typedRaw.length;
    const netChars = totalChars - charErr;
    const accuracy = totalChars ? (netChars * 100) / totalChars : 0;
    const grossWpm = (totalChars / 5) / minutes;
    const netWpm = grossWpm - (charErr / minutes);

    console.log("Typed:", typedRaw);
    console.log("Error Hits Counted:", charErr);
    console.log("Errors:", wordErr);

    if (detail.length) {
      console.log("%cDetailed Errors:", "color:red;font-weight:bold");
      detail.forEach(d => console.log(d));
    } else {
      console.log("%cNo detailed errors – great job!", "color:green;font-weight:bold");
    }

    console.groupCollapsed(`%c⏹ Finished in ${minutes.toFixed(2)} min`, "color:#06c;font-weight:bold");
    console.table({
      "Total chars": totalChars,
      "Net chars": netChars,
      "Accuracy %": accuracy.toFixed(2),
      "Gross WPM": grossWpm.toFixed(2),
      "Net WPM": netWpm.toFixed(2),
      "Char errors": charErr,
      "Word errors": wordErr,
      "─ extra spaces": runs.reduce((s, r) => s + r.length - 1, 0),
      "─ lead/trail sp.": (typedRaw.startsWith(" ") ? 1 : 0) + (typedRaw.endsWith(" ") ? 1 : 0),
      "─ repeated words": wordErr - spaceBeforeCnt - punctRuns.length,
      "─ double punct.": punctRuns.length,
      "─ space‑before": spaceBeforeCnt
    });
    console.groupEnd();

    // Optionally push to hidden fields
    // pushMetrics(cfg, { totalChars, netChars, accuracy, minutes, grossWpm, charErr, wordErr, netWpm });
  });

  function pushMetrics(cfg, m) {
    /*
    $("#"+cfg.totalId).val(m.totalChars);
    $("#"+cfg.netId   ).val(m.netChars);
    …
    */
  }
}

/* ============  boot‑up all configured tests  ============ */
$(function () {
  TESTS.forEach(initTest);
});
return true;
};



// Console-ready version - paste this directly into your browser console
// (function() {
//     const TESTS = [
//       { textId: "175779", finishId: "175794" },
//       { textId: "175835", finishId: "175794" }
//     ];
  
//     /* ============  helpers =================== */
//     function normalizeSpaces(txt) {
//       let out = "", gap = false;
//       for (let ch of txt) {
//         if (ch === " ") { if (!gap) { out += " "; gap = true; } }
//         else { out += ch; gap = false; }
//       }
//       return out.trim();
//     }
  
//     function extraSpaceRuns(txt) {
//       const runs = [];
//       txt.replace(/ {2,}/g, (m, idx) => runs.push({ index: idx, length: m.length }));
//       return runs;
//     }
  
//     /* ============  main initializer ======================== */
//     function initTest(cfg) {
//       const typingFld = $("#" + cfg.textId).prop("readonly", true);
//       const finishBtn = $("#" + cfg.finishId);
//       let startTime = null;
  
//       /* ---- Direct activation ---- */
//       typingFld.one("mousedown focus", function () {
//         startTime = new Date();
//         console.log("%cTyping test started ▶", "color:#0a0;font-weight:bold");
//         typingFld.prop("readonly", false).trigger("focus");
//       });
  
//       /* ---- finish button ---- */
//       finishBtn.on("click", () => {
//         finishBtn.val("TimeUp").trigger("change");
//       });
  
//       /* ---- scoring ---- */
//       finishBtn.on("change", () => {
//         if (!startTime) { console.warn("⚠ No start time recorded."); return; }
  
//         const minutes = (Date.now() - startTime) / 1000 / 60;
//         const typedRaw = typingFld.val();
//         const typedFix = normalizeSpaces(typedRaw);
//         const words = typedFix ? typedFix.split(" ") : [];
  
//         let charErr = 0, wordErr = 0;
//         const detail = [];
  
//         const runs = extraSpaceRuns(typedRaw);
//         runs.forEach(r => {
//           charErr += r.length - 1;
//           detail.push(`🔸 Extra spaces (${r.length - 1}) at char ${r.index}`);
//         });
  
//         if (typedRaw.startsWith(" ")) {
//           charErr++;
//           detail.push("🔸 Leading space at beginning");
//         }
  
//         if (typedRaw.endsWith(" ")) {
//           charErr++;
//           detail.push("🔸 Trailing space at end");
//         }
  
//         const punctRuns = typedRaw.match(/[.,!?;:]{2,}/g) || [];
//         punctRuns.forEach(run => {
//           charErr += run.length - 1;
//           wordErr++;
//           detail.push(`🔸 Repeated punctuation "${run}"`);
//         });
  
//         let spaceBeforeCnt = 0;
//         for (let i = 0; i < typedRaw.length - 1; i++) {
//           if (typedRaw[i] === " " && ".,!?;:".includes(typedRaw[i + 1])) {
//             charErr++;
//             wordErr++;
//             spaceBeforeCnt++;
//             detail.push(`🔸 Space before punctuation at char ${i}`);
//           }
//         }
  
//         const seen = new Map();
//         words.forEach((w, idx) => {
//           const clean = w.toLowerCase().replace(/[.,!?;:]/g, "");
//           if (!clean) return;
//           if (seen.has(clean)) {
//             wordErr++;
//             charErr += clean.length;
//             detail.push(`🔸 Repeated word "${w}" (first at #${seen.get(clean) + 1}, again at #${idx + 1})`);
//           } else {
//             seen.set(clean, idx);
//           }
//         });
  
//         const totalChars = typedRaw.length;
//         const netChars = totalChars - charErr;
//         const accuracy = totalChars ? (netChars * 100) / totalChars : 0;
//         const grossWpm = (totalChars / 5) / minutes;
//         const netWpm = grossWpm - (charErr / minutes);
  
//         console.log("Typed:", typedRaw);
//         console.log("Error Hits Counted:", charErr);
//         console.log("Errors:", wordErr);
  
//         if (detail.length) {
//           console.log("%cDetailed Errors:", "color:red;font-weight:bold");
//           detail.forEach(d => console.log(d));
//         } else {
//           console.log("%cNo detailed errors – great job!", "color:green;font-weight:bold");
//         }
  
//         console.groupCollapsed(`%c⏹ Finished in ${minutes.toFixed(2)} min`, "color:#06c;font-weight:bold");
//         console.table({
//           "Total chars": totalChars,
//           "Net chars": netChars,
//           "Accuracy %": accuracy.toFixed(2),
//           "Gross WPM": grossWpm.toFixed(2),
//           "Net WPM": netWpm.toFixed(2),
//           "Char errors": charErr,
//           "Word errors": wordErr,
//           "─ extra spaces": runs.reduce((s, r) => s + r.length - 1, 0),
//           "─ lead/trail sp.": (typedRaw.startsWith(" ") ? 1 : 0) + (typedRaw.endsWith(" ") ? 1 : 0),
//           "─ repeated words": wordErr - spaceBeforeCnt - punctRuns.length,
//           "─ double punct.": punctRuns.length,
//           "─ space‑before": spaceBeforeCnt
//         });
//         console.groupEnd();
//       });
//     }
  
//     /* ============  boot‑up all configured tests  ============ */
//     $(function () {
//       TESTS.forEach(initTest);
//       console.log("✅ Typing test initialized! Click on a text area to start.");
//     });
//   })();
  