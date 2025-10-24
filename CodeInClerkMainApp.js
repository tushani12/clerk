function DPcomprehensiveTypingAnalysisServicePlus(srcElement){
//the result function updated by tushani 
 try {
    console.clear();
    console.log("%c=== TYPING TEST ANALYSIS (LIVE MODE – SERVICEPLUS) ===", "color:#2196F3;font-size:18px;font-weight:bold;");

    const originalEl = document.getElementById("175879"); // System paragraph
    const typedEl = document.getElementById("175880");    // User typing box

    if (!originalEl || !typedEl) {
      console.error("❌ Required fields (#175879, #175880) not found. Exiting.");
      return true;
    }

    // Helper: whitespace & word extraction
    const WS = [9, 10, 13, 32, 160];
    const isWS = (ch) => WS.includes(ch.charCodeAt(0));
    const wordsOnly = (text = "") => {
      const arr = [];
      let buff = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (isWS(ch)) {
          if (buff) arr.push({ raw: buff, low: buff.toLowerCase() });
          buff = "";
        } else buff += ch;
      }
      if (buff) arr.push({ raw: buff, low: buff.toLowerCase() });
      return arr;
    };

    // Count extra spaces
    function countExtraSpaces(text) {
      const runs = [];
      text.replace(/ {2,}/g, (m, idx) => runs.push({ index: idx, length: m.length }));
      let totalExtraSpaces = 0;
      runs.forEach(run => {
        totalExtraSpaces += run.length - 1;
      });
      if (text.startsWith(" ")) totalExtraSpaces++;
      if (text.endsWith(" ")) totalExtraSpaces++;
      return totalExtraSpaces;
    }

    // Enhanced DP alignment with merged/split detection
    function alignWords(sysW, usrW) {
      const n = sysW.length, m = usrW.length;
      const dp = Array.from({ length: n + 1 }, () => 
        Array.from({ length: m + 1 }, () => ({ cost: 0, prev: null, op: null }))
      );
      
      for (let i = 1; i <= n; i++) dp[i][0] = { cost: i, prev: [i - 1, 0], op: "delete" };
      for (let j = 1; j <= m; j++) dp[0][j] = { cost: j, prev: [0, j - 1], op: "insert" };

      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
          const sysWord = sysW[i - 1].raw;
          const usrWord = usrW[j - 1].raw;
          const opts = [];

          // Exact match
          if (sysWord === usrWord) {
            opts.push({ cost: dp[i - 1][j - 1].cost, prev: [i - 1, j - 1], op: "match" });
          } else {
            // Replacement
            opts.push({ cost: dp[i - 1][j - 1].cost + 1, prev: [i - 1, j - 1], op: "replace" });
            
            // Merged detection (user combined two sys words into one typed)
            if (i > 1 && usrWord.toLowerCase().includes(sysW[i - 1].low) && 
                usrWord.toLowerCase().includes(sysW[i - 2].low)) {
              opts.push({ cost: dp[i - 2][j - 1].cost + 1, prev: [i - 2, j - 1], op: "merged" });
            }
            
            // Split detection (user split one sys word into two typed words)
            if (j > 1 && (usrW[j - 2].low + usrW[j - 1].low) === sysW[i - 1].low) {
              opts.push({ cost: dp[i - 1][j - 2].cost + 1, prev: [i - 1, j - 2], op: "split" });
            }
          }

          // Delete (missing)
          opts.push({ cost: dp[i - 1][j].cost + 1, prev: [i - 1, j], op: "delete" });
          // Insert (extra)
          opts.push({ cost: dp[i][j - 1].cost + 1, prev: [i, j - 1], op: "insert" });

          dp[i][j] = opts.reduce((a, b) => (a.cost <= b.cost ? a : b));
        }
      }

      // Backtrack alignment
      let i = n, j = m;
      const alignment = [];
      while (i > 0 || j > 0) {
        const { op, prev } = dp[i][j];
        if (op === "match") {
          alignment.push({ word: usrW[j - 1].raw, status: "correct" });
          i--; j--;
        } else if (op === "replace") {
          alignment.push({ word: usrW[j - 1].raw, status: "wrong", expected: sysW[i - 1].raw });
          i--; j--;
        } else if (op === "delete") {
          alignment.push({ word: "(none)", status: "missing", expected: sysW[i - 1].raw });
          i--;
        } else if (op === "insert") {
          alignment.push({ word: usrW[j - 1].raw, status: "extra" });
          j--;
        } else if (op === "merged") {
          alignment.push({ 
            word: usrW[j - 1].raw, 
            status: "merged", 
            expected: sysW[i - 2].raw + " " + sysW[i - 1].raw,
            mergedWords: [sysW[i - 2].raw, sysW[i - 1].raw]
          });
          i -= 2; j--;
        } else if (op === "split") {
          alignment.push({ 
            word: usrW[j - 2].raw + " " + usrW[j - 1].raw, 
            status: "split", 
            expected: sysW[i - 1].raw 
          });
          i--; j -= 2;
        }
      }
      return alignment.reverse();
    }

    // Attach live listener only once
    if (!typedEl._analysisAttached) {
      typedEl._analysisAttached = true;

      typedEl.addEventListener("input", function () {
        const originalText = originalEl.innerText || originalEl.value || "";
        const typedText = typedEl.value || "";
        const durationMinutes = 10;

        const sysW = wordsOnly(originalText);
        const usrW = wordsOnly(typedText);
        const aligned = alignWords(sysW, usrW);

        // Count different types of errors
        const counts = { correct: 0, wrong: 0, missing: 0, extra: 0, merged: 0, split: 0 };
        aligned.forEach(w => { if (counts[w.status] !== undefined) counts[w.status]++; });

        // Calculate extra spaces
        const extraSpaces = countExtraSpaces(typedText);

        // Calculate characters
        const typedCharacters = typedText.length;
        
        // Calculate extra characters from wrong words
        let extraWrongChars = 0;
        aligned.forEach(w => {
          if (w.status === "wrong") {
            const expected = w.expected || "";
            const typed = w.word || "";
            if (typed.length > expected.length) {
              extraWrongChars += (typed.length - expected.length);
            }
          }
        });

        const grossCharacters = typedCharacters - (extraSpaces + extraWrongChars);
        
        // Calculate errors
        const fullMistakes = counts.extra + counts.missing + counts.wrong;
        const halfMistakes = counts.merged + counts.split + extraSpaces;
        const errorCharacters = (5 * fullMistakes) + (2.5 * halfMistakes);
        
        // Calculate net values
        let netCharacters = Math.max(0, grossCharacters - errorCharacters);
        const grossSpeed = Math.floor(grossCharacters / (5 * durationMinutes));
        const netSpeed = Math.floor(netCharacters / (5 * durationMinutes));
        const accuracy = grossCharacters > 0 ? (netCharacters / grossCharacters) * 100 : 0;

        // Update hidden fields
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.value = val;
        };

        setVal("175899", durationMinutes);
        setVal("175900", grossCharacters);
        setVal("175901", Math.round(errorCharacters));
        setVal("175902", netCharacters);
        setVal("175903", accuracy.toFixed(2) + " %");
        setVal("175904", grossSpeed);
        setVal("175905", fullMistakes + halfMistakes);
        setVal("175906", netSpeed);

        // === CONSOLE DETAILED ANALYSIS ===
        console.clear();
        console.log("%c=== SERVICEPLUS TYPING ANALYSIS ===", "color:#2196F3;font-size:18px;font-weight:bold;");

        // CHARACTER-LEVEL ANALYSIS
        console.log("%c📊 CHARACTER-LEVEL ANALYSIS", "color:#4CAF50;font-weight:bold;");
        console.log("Typed Characters :", typedCharacters);
        console.log("Gross Characters :", grossCharacters);
        console.log("Gross Speed (WPM) :", grossSpeed);
        console.log("Net Characters :", netCharacters);
        console.log("Net Speed (WPM) :", netSpeed);
        console.log("Backspaces pressed : 0"); // Track if needed
        console.log("");

        // WORD-LEVEL ANALYSIS
        console.log("%c🔤 WORD-LEVEL ANALYSIS", "color:#FF9800;font-weight:bold;");
        console.log("System words         :", sysW.length);
        console.log("Typed words          :", usrW.length);
        console.log("Correct words        :", counts.correct);
        console.log("Merged words         :", counts.merged);
        console.log("Split words          :", counts.split);
        console.log("Wrong words          :", counts.wrong);
        console.log("Missing words        :", counts.missing);
        console.log("Extra words          :", counts.extra);
        console.log("");

        // ERROR ANALYSIS
        console.log("%c❌ ERROR ANALYSIS", "color:#F44336;font-weight:bold;");
        console.log("Full Mistakes        :", fullMistakes);
        console.log("  ├─ Extra Words     :", counts.extra);
        console.log("  ├─ Missing Words   :", counts.missing);
        console.log("  └─ Wrong Words     :", counts.wrong);
        console.log("Half Mistakes        :", halfMistakes);
        console.log("  ├─ Merged Words    :", counts.merged);
        console.log("  ├─ Split Words     :", counts.split);
        console.log("  └─ Extra Spaces    :", extraSpaces);
        console.log("Total Error Characters:", errorCharacters.toFixed(1));
        console.log("");

        // RESULTS & ACCURACY
        console.log("%c🎯 RESULTS & ACCURACY", "color:#2196F3;font-weight:bold;");
        console.log("Accuracy Percentage   :", accuracy.toFixed(2) + "%");
        console.log("Final Result          :", accuracy >= 60 ? "✅ PASS" : "❌ FAIL");
        console.log("");

        // DETAILED WORD-BY-WORD ANALYSIS
        console.log("%c🔍 DETAILED WORD COMPARISON", "color:#795548;font-weight:bold;");
        let formatted = "", css = [];
        aligned.forEach(w => {
          let text;
          if (w.status === "correct") {
            text = w.word;
            formatted += "%c" + text + " ";
            css.push("color:#4CAF50;font-weight:bold;");
          } else if (w.status === "wrong") {
            text = `${w.word} [${w.expected}]`;
            formatted += "%c" + text + " ";
            css.push("color:white;background:#F44336;padding:2px 4px;border-radius:3px;");
          } else if (w.status === "missing") {
            text = w.expected;
            formatted += "%c" + text + " ";
            css.push("color:#B71C1C;background:#FFF9C4;padding:2px 4px;border-radius:3px;");
          } else if (w.status === "extra") {
            text = w.word;
            formatted += "%c" + text + " ";
            css.push("color:#880E4F;background:#F8BBD9;padding:2px 4px;border-radius:3px;");
          } else if (w.status === "merged") {
            text = `${w.word} [merged: ${w.expected}]`;
            formatted += "%c" + text + " ";
            css.push("color:#1A237E;background:#C5CAE9;padding:2px 4px;border-radius:3px;");
          } else if (w.status === "split") {
            text = `${w.word} [split: ${w.expected}]`;
            formatted += "%c" + text + " ";
            css.push("color:#0D47A1;background:#B3E5FC;padding:2px 4px;border-radius:3px;");
          }
        });
        console.log(formatted.trim(), ...css);
        console.log("");

        // LEGEND
        console.log("%c📋 LEGEND", "color:#FF5722;font-weight:bold;");
        console.log("🟢 Correct  | 🔴 Wrong  | 🟡 Missing  | 🩷 Extra  | 🔵 Merged  | 🔷 Split");
        console.log("----------------------------------------------------------------------");
      });

      console.log("✅ Typing listener attached successfully to #175880");
    }

    return true;
  } catch (err) {
    console.error("❌ Error in DPcomprehensiveTypingAnalysisServicePlus:", err);
    return true;
  }
return true;
};
