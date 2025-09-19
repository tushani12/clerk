


function autoResizeTypedField(srcElement){
    var el = document.getElementById("176486"); // typed textarea
    if (!el) return false;
  
    // adjust once immediately
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  
    // adjust on input
    el.addEventListener("input", function () {
      this.style.height = "auto";  // reset first
      this.style.height = this.scrollHeight + "px"; // fit to content
    });
  
    return true;
  
  };
  
  function DPcomprehensiveTypingAnalysis(srcElement){
  //Updated Function with Dynamic Programming
      /**
       * === COMPREHENSIVE TYPING ANALYSIS FUNCTION ===
       * Combines all functions from the 22/ folder structure:
       * - Word-Level: system-words, typed-words
       * - Char-Level: gross-char, gross-speed
       * - Common: Accuracy%, Net-Characters, Net-Speed, Result
       * - Errors: Full-mistakes, Half-mistakes, Total-Error-Characters
       * - Detailed word-by-word analysis with beautiful console output
       */
      
      // Get input from DOM elements (same as asc1.js)
      var originalEl = document.getElementById("176488"); // fixed passage
      var typedEl = document.getElementById("176486");   // candidate typed
      
      if (!originalEl || !typedEl) {
          console.error("❌ Required elements not found (#176488 and #176486)");
          return;
      }
      
      const originalText = originalEl.innerText || originalEl.value || "";
      const typedText = typedEl.value || "";
      // Mapping of [postId][languageId] → duration in minutes
      const durationMap = {
          "1": { // Junior Scale Steno
              "1": 20, // English
              "2": 27  // Punjabi
          },
          "2": { // Stenographer
              "1": 16, // English
              "2": 25  // Punjabi
          }
      };
  
      // ==================== HELPER FUNCTIONS ====================
      
      //Function to fetch the selected duration
      function getSelectedDuration() {
          const post = document.querySelector("input[name='177184']:checked");
          const lang = document.querySelector("input[name='177185']:checked");
      
          if (post && lang) {
              const postVal = post.value;
              const langVal = lang.value;
              return durationMap[postVal]?.[langVal] || 2; // default 2 min if not found
          }
          return 2; // fallback
      }
      const durationMinutes = getSelectedDuration();
  
      // Whitespace detection
      const WS = [9, 10, 13, 32, 160]; // tab, newline, carriage return, space, non-breaking space
      function isWS(ch) { 
          return WS.indexOf(ch.charCodeAt(0)) !== -1; 
      }
      //For Setting Hidden Field Values
      function setHiddenFieldValue(fieldId, value) {
          const el = document.getElementById(fieldId);
          if (el) {
              el.value = (typeof value === "object") ? JSON.stringify(value) : value;
          } else {
              console.warn("Hidden field not found:", fieldId);
          }
      }
      
      // Global variable to count backspaces
      let backspaceCount = 0;
  
      // Attach listener to the typing field
      document.addEventListener("DOMContentLoaded", () => {
          const typedElKey = document.getElementById("176486");
          if (typedElKey) {
              typedElKey.addEventListener("keydown", (event) => {
                  if (event.key === "Backspace") {
                      backspaceCount++;
                  }
              });
          }
      });
  
      // Extract words from text (excluding whitespace)
      function wordsOnly(text = '') {
          const arr = [];
          let buff = '';
          for (let i = 0; i < text.length; i++) {
              const ch = text[i];
              if (isWS(ch)) {
                  if (buff) { 
                      arr.push({ raw: buff, low: buff.toLowerCase() }); 
                      buff = ''; 
                  }
              } else {
                  buff += ch;
              }
          }
          if (buff) arr.push({ raw: buff, low: buff.toLowerCase() });
          return arr;
      }
      
      // Levenshtein Distance for typo detection
      function levenshtein(a, b) {
          const dp = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
          for (let i = 0; i <= a.length; i++) dp[i][0] = i;
          for (let j = 0; j <= b.length; j++) dp[0][j] = j;
      
          for (let i = 1; i <= a.length; i++) {
              for (let j = 1; j <= b.length; j++) {
                  const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                  dp[i][j] = Math.min(
                      dp[i - 1][j] + 1,
                      dp[i][j - 1] + 1,
                      dp[i - 1][j - 1] + cost
                  );
              }
          }
          return dp[a.length][b.length];
      }
      
      // DP-based alignment with merged/split detection
      function alignWords(sysW, usrW) {
          const n = sysW.length;
          const m = usrW.length;
  
          // dp[i][j] = { cost, prev: [pi, pj], op }
          const dp = Array.from({ length: n + 1 }, () =>
              Array.from({ length: m + 1 }, () => ({ cost: 0, prev: null, op: null }))
          );
  
          // init
          for (let i = 1; i <= n; i++) {
              dp[i][0] = { cost: i, prev: [i - 1, 0], op: "delete" };
          }
          for (let j = 1; j <= m; j++) {
              dp[0][j] = { cost: j, prev: [0, j - 1], op: "insert" };
          }
  
          // fill DP
          for (let i = 1; i <= n; i++) {
              for (let j = 1; j <= m; j++) {
                  const sysWord = sysW[i - 1].raw;
                  const usrWord = usrW[j - 1].raw;
  
                  const opts = [];
  
                  // exact match
                  if (sysWord === usrWord) {
                      opts.push({ cost: dp[i - 1][j - 1].cost, prev: [i - 1, j - 1], op: "match" });
                  } else {
                      // replacement
                      opts.push({ cost: dp[i - 1][j - 1].cost + 1, prev: [i - 1, j - 1], op: "replace" });
  
                      // merged detection (user combined two sys words into one typed)
                      if (i > 1 && usrWord.toLowerCase().includes(sysW[i - 1].low) && usrWord.toLowerCase().includes(sysW[i - 2].low)) {
                          opts.push({ cost: dp[i - 2][j - 1].cost + 1, prev: [i - 2, j - 1], op: "merged" });
                      }
  
                      // split detection (user split one sys word into two typed words)
                      if (j > 1 && (usrW[j - 2].low + usrW[j - 1].low) === sysW[i - 1].low) {
                          opts.push({ cost: dp[i - 1][j - 2].cost + 1, prev: [i - 1, j - 2], op: "split" });
                      }
                  }
  
                  // delete (missing)
                  opts.push({ cost: dp[i - 1][j].cost + 1, prev: [i - 1, j], op: "delete" });
  
                  // insert (extra)
                  opts.push({ cost: dp[i][j - 1].cost + 1, prev: [i, j - 1], op: "insert" });
  
                  // pick min
                  dp[i][j] = opts.reduce((a, b) => (a.cost <= b.cost ? a : b));
              }
          }
  
          // backtrack
          let i = n, j = m;
          const alignment = [];
          while (i > 0 || j > 0) {
              const cell = dp[i][j];
              const { op, prev } = cell;
  
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
  
      
      // ==================== CHAR-LEVEL FUNCTIONS ====================
      
      // Gross Characters calculation
      function countGrossChars(text) {
          return text.length;
      }
      
      // Gross Speed calculation
      function calculateGrossSpeed(grossCharacters, durationMinutes) {
          if (!grossCharacters || !durationMinutes || durationMinutes <= 0) return 0;
          return Math.floor(grossCharacters / (5 * durationMinutes));
      }
      
      // ==================== ERROR CALCULATION FUNCTIONS ====================
      
      // Extra Words calculation
      function calculateExtraWords(originalText, typedText) {
          if (!originalText || !typedText) return 0;
          
          const sysW = wordsOnly(originalText);
          const usrW = wordsOnly(typedText);
          
          // Align words and identify extra words
          const aligned = alignWords(sysW, usrW);
          
          let extraWordsCount = 0;
          for (const w of aligned) {
              if (w.status === 'extra') {
                  extraWordsCount++;
              }
          }
          
          return extraWordsCount;
      }
      
      // Missing Words calculation
      function calculateMissingWords(originalText, typedText) {
          if (!originalText || !typedText) return 0;
          
          const sysW = wordsOnly(originalText);
          const usrW = wordsOnly(typedText);
          
          // Align words to identify missing ones
          const aligned = alignWords(sysW, usrW);
          
          // Count missing words
          const missingWords = aligned.filter(w => w.status === 'missing');
          return missingWords.length;
      }
      
      // Wrong Words calculation (wrong + typo)
      function calculateTotalWrongWords(originalText, typedText) {
          if (!originalText || !typedText) return { wrongWords: 0, totalWrongWords: 0 };
          
          const sysW = wordsOnly(originalText);
          const usrW = wordsOnly(typedText);
          
          // Align words and classify them
          const aligned = alignWords(sysW, usrW);
          
          let extraWrongChars = 0;
  
          // Count different types of words
          const counts = {
              correct: 0,
              wrong: 0,
              missing: 0,
              extra: 0,
              merged: 0
          };
      
          for (const w of aligned) {
              if (counts[w.status] !== undefined) counts[w.status]++;
          
              if (w.status === "wrong") {
                  const expected = w.expected || "";
                  const typed = w.word || "";
                  if (typed.length > expected.length) {
                      extraWrongChars += (typed.length - expected.length);
                  }
              }
          }        
      
          // Calculate total wrong words (wrong + typo)
          const wrongWords = counts.wrong;
          const totalWrongWords = wrongWords;
      
          return {
              wrongWords: wrongWords,
              totalWrongWords: totalWrongWords,
              details: counts,
              extraWrongChars: extraWrongChars
          };
      }
      
      // Merged Words calculation
      function detectMergedWords(originalText, typedText) {
          if (!originalText || !typedText) return { mergedWords: 0, mergedWordDetails: [] };
          
          const sysW = wordsOnly(originalText);
          const usrW = wordsOnly(typedText);
          
          // Align words and classify them, focusing on merged words
          const aligned = alignWords(sysW, usrW);
          
          // Count different types of words
          const counts = {
              correct: 0,
              wrong: 0,
              missing: 0,
              extra: 0,
              merged: 0
          };
      
          // Collect merged word details
          const mergedWordDetails = [];
      
          for (const w of aligned) {
              if (counts[w.status] !== undefined) counts[w.status]++;
              
              // Collect details for merged words
              if (w.status === 'merged') {
                  mergedWordDetails.push({
                      typedWord: w.word,
                      expectedWords: w.expected,
                      individualWords: w.mergedWords || []
                  });
              }
          }
      
          return {
              mergedWords: counts.merged,
              mergedWordDetails: mergedWordDetails,
              details: counts
          };
      }
  
      // Split Words calculation
      function detectSplitWords(originalText, typedText) {
          if (!originalText || !typedText) return { splitWords: 0, splitWordDetails: [] };
  
          const sysW = wordsOnly(originalText);
          const usrW = wordsOnly(typedText);
          const aligned = alignWords(sysW, usrW);
  
          let splitWords = 0;
          const splitWordDetails = [];
          for (const w of aligned) {
              if (w.status === 'split') {
                  splitWords++;
                  splitWordDetails.push({ typedWords: w.word, expectedWord: w.expected });
              }
          }
          return { splitWords, splitWordDetails };
      }
      
      // Extra Spaces calculation
      function countExtraSpaces(text) {
          const runs = [];
          text.replace(/ {2,}/g, (m, idx) => runs.push({ index: idx, length: m.length }));
          let totalExtraSpaces = 0;
          
          runs.forEach(run => {
              totalExtraSpaces += run.length - 1;
          });
          
          // Also check for leading/trailing spaces
          if (text.startsWith(" ")) {
              totalExtraSpaces++;
          }
          
          if (text.endsWith(" ")) {
              totalExtraSpaces++;
          }
          
          return totalExtraSpaces;
      }
      function hideInputField() {
          const inputEl = document.getElementById("176973");
          if (inputEl) {
              inputEl.style.position = "absolute";
              inputEl.style.opacity = "0";   // invisible
              inputEl.style.pointerEvents = "none"; // unclickable
              inputEl.style.display = "none";
          }
      }
      
      function setFieldValue(fieldId, value) {
          const el = document.getElementById(fieldId);
          if (el) {
              el.value = (typeof value === "object") ? JSON.stringify(value) : value;
          } else {
              console.warn("Field not found:", fieldId);
          }
      }
      
      // ==================== MAIN CALCULATION FUNCTION ====================
      
      function performCompleteAnalysis() {
          // Get system and user words
          const sysW = wordsOnly(originalText);
          const usrW = wordsOnly(typedText);
          
          // Calculate gross characters and speed
          // === NEW NAMING ===
          const typedCharacters = countGrossChars(typedText); // raw count
          const extraSpaces = countExtraSpaces(typedText);
          const wrongWordsData = calculateTotalWrongWords(originalText, typedText);
  
          // Adjusted gross characters (previously called "Net Gross Chars")
          const grossCharacters = typedCharacters - (extraSpaces + wrongWordsData.extraWrongChars);
  
          // Speeds
          const grossSpeed = calculateGrossSpeed(grossCharacters, durationMinutes);
  
          // Calculate all error types
          const extraWords = calculateExtraWords(originalText, typedText);
          const missingWords = calculateMissingWords(originalText, typedText);
          const mergedWordsData = detectMergedWords(originalText, typedText);
          const splitWordsData = detectSplitWords(originalText, typedText);
          
          // Calculate full mistakes (sum of extra + missing + wrong words)
          const fullMistakes = extraWords + missingWords + wrongWordsData.totalWrongWords;
          
          // Calculate half mistakes (sum of merged + split + extra spaces)
          const halfMistakes = mergedWordsData.mergedWords + splitWordsData.splitWords + extraSpaces;
          
          // Calculate total error characters
          const errorCharacters = (5 * fullMistakes) + (2.5 * halfMistakes);
          
          // Calculate net characters and speed
          let netCharacters = grossCharacters - errorCharacters;
          if (netCharacters < 0) netCharacters = 0;
  
          const netSpeed = Math.floor(netCharacters / (5 * durationMinutes));
          
          // Calculate accuracy percentage
          const accuracyPercentage = grossCharacters > 0 ? (netCharacters / grossCharacters) * 100 : 0;
          
          // Determine result (pass/fail)
          const result = (grossSpeed >= 15) && (accuracyPercentage >= 92) ? 'PASS' : 'FAIL';
          
          // ==================== BEAUTIFUL CONSOLE OUTPUT ====================
          
          console.clear();
          console.log("%c=== COMPREHENSIVE TYPING ANALYSIS RESULTS ===", "color: #2196F3; font-size: 18px; font-weight: bold;");
          // console.log("%cCombining all functions from 22/ folder structure", "color: #666; font-style: italic;");
          console.log("");
          
          // Input Information
          console.log("%c📝 INPUT INFORMATION", "color: #4CAF50; font-weight: bold; font-size: 14px;");
          console.log("Original Text:", originalText);
          console.log("Typed Text  :", typedText);
          console.log("Duration    :", durationMinutes, "minutes");
          console.log("");
          
          // Character-Level Analysis
          console.log("%c📊 CHARACTER-LEVEL ANALYSIS", "color: #9C27B0; font-weight: bold; font-size: 14px;");
          console.log("Typed Characters :", typedCharacters);
          console.log("Gross Characters :", grossCharacters);
          console.log("Gross Speed (WPM) :", grossSpeed);
          console.log("Net Characters :", netCharacters);
          console.log("Net Speed (WPM) :", netSpeed);
          console.log("Backspaces pressed :", backspaceCount);
          console.log("");
          
          // Word-Level Analysis
          console.log("%c🔤 WORD-LEVEL ANALYSIS", "color: #FF9800; font-weight: bold; font-size: 14px;");
          console.log("System words         :", sysW.length);
          console.log("Typed words          :", usrW.length);
          console.log("Correct words        :", wrongWordsData.details.correct);
          // Typos are counted under Wrong words now (spelling/case mistakes)
          console.log("Merged words         :", mergedWordsData.mergedWords);
          console.log("Split words          :", splitWordsData.splitWords);
          console.log("Wrong words          :", wrongWordsData.details.wrong);
          console.log("Missing words        :", missingWords);
          console.log("Extra words          :", extraWords);
          console.log("");
          
          // Error Analysis
          console.log("%c❌ ERROR ANALYSIS", "color: #F44336; font-weight: bold; font-size: 14px;");
          console.log("Full Mistakes        :", fullMistakes);
          console.log("  ├─ Extra Words     :", extraWords);
          console.log("  ├─ Missing Words   :", missingWords);
          console.log("  └─ Wrong Words     :", wrongWordsData.totalWrongWords);
          console.log("Half Mistakes        :", halfMistakes);
          console.log("  ├─ Merged Words    :", mergedWordsData.mergedWords);
          console.log("  ├─ Split Words     :", splitWordsData.splitWords);
          console.log("  └─ Extra Spaces    :", extraSpaces);
          console.log("Total Error Characters:", errorCharacters.toFixed(1));
          console.log("");
          
          // Results and Accuracy
          console.log("%c🎯 RESULTS & ACCURACY", "color: #00BCD4; font-weight: bold; font-size: 14px;");
          console.log("Accuracy Percentage   :", accuracyPercentage.toFixed(2) + "%");
          console.log("Final Result          :", result === 'PASS' ? '✅ PASS' : '❌ FAIL');
          console.log("");
          
          // Detailed Word Analysis
          console.log("%c🔍 DETAILED WORD ANALYSIS", "color: #795548; font-weight: bold; font-size: 14px;");
          
          // Create comprehensive word alignment for display
          const comprehensiveAligned = alignWords(sysW, usrW);
          
          // Display colored word-by-word analysis
          let formattedOutput = '', cssStyles = [];
          for (const w of comprehensiveAligned) {
              const wordText = w.word === '(none)' ? w.expected : w.word;
              const displayText = wordText + ' ';
              
              if (w.status === 'correct') {
                  formattedOutput += '%c' + displayText;
                  cssStyles.push('color: #4CAF50; font-weight: bold;');
              } else if (w.status === 'wrong') {
                  formattedOutput += '%c' + displayText;
                  cssStyles.push('color: white; background: #F44336; padding: 2px 4px; border-radius: 3px;');
              } else if (w.status === 'missing') {
                  formattedOutput += '%c' + displayText;
                  cssStyles.push('color: #B71C1C; background: #FFF9C4; padding: 2px 4px; border-radius: 3px;');
              } else if (w.status === 'extra') {
                  formattedOutput += '%c' + displayText;
                  cssStyles.push('color: #880E4F; background: #F8BBD9; padding: 2px 4px; border-radius: 3px;');
              } else if (w.status === 'merged') {
                  formattedOutput += '%c' + displayText;
                  cssStyles.push('color: #1A237E; background: #C5CAE9; padding: 2px 4px; border-radius: 3px;');
              } else if (w.status === 'split') {
                  formattedOutput += '%c' + displayText;
                  cssStyles.push('color: #0D47A1; background: #B3E5FC; padding: 2px 4px; border-radius: 3px;');
              }
          }
          
          let htmlOutput = "";
          for (const w of comprehensiveAligned) {
              const wordText = w.word === '(none)' ? w.expected : w.word;
              let style = "";
          
              if (w.status === 'correct') {
                  style = "color:#4CAF50; font-weight:bold;";
              } else if (w.status === 'wrong') {
                  style = "color:white; background:#F44336; padding:2px 4px; border-radius:3px;";
              } else if (w.status === 'missing') {
                  style = "color:#B71C1C; background:#FFF9C4; padding:2px 4px; border-radius:3px;";
              } else if (w.status === 'extra') {
                  style = "color:#880E4F; background:#F8BBD9; padding:2px 4px; border-radius:3px;";
              } else if (w.status === 'merged') {
                  style = "color:#1A237E; background:#C5CAE9; padding:2px 4px; border-radius:3px;";
              } else if (w.status === 'split') {
                  style = "color:#0D47A1; background:#B3E5FC; padding:2px 4px; border-radius:3px;";
              }
          
              htmlOutput += `<span style="${style}">${wordText}</span> `;
          }
          
          // 🔑 find the label by its `for` attribute
          const labelEl = document.querySelector("label[for='176973']");
          if (labelEl) {
              labelEl.innerHTML = htmlOutput.trim();
              labelEl.style.display = "block";       // make it a block element
              labelEl.style.width = "100%";          // full width
              labelEl.style.fontSize = "14px";       // increase font size
              labelEl.style.lineHeight = "1.6";      // improve readability
          }
          
          const hiddenInput = document.getElementById("176986");
          if (hiddenInput) {
              hiddenInput.value = htmlOutput.trim(); 
          }
          
          console.log("Word-by-word analysis:");
          console.log(formattedOutput.trim(), ...cssStyles);
          console.log("");
          
          // Legend
          console.log("%c📋 LEGEND", "color: #FF5722; font-weight: bold; font-size: 14px;");
          console.log("🟢 Green: Correct words");
          console.log("🔴 Red background: Wrong words");
          console.log("🟡 Yellow background: Missing words");
          console.log("🩷 Pink background: Extra words");
          // Typos are not shown separately; included in Wrong words
          console.log("🔵 Blue background: Merged words");
          console.log("🔷 Light blue background: Split words");
          console.log("");
          
          // console.log("%c✨ Analysis Complete! All functions from 22/ folder have been combined and executed.", "color: #4CAF50; font-weight: bold; font-size: 16px;");
          
          // Print results into Result Section box (textarea #176605)
          // Print results into Result Section fields
          function displayResultsInFields(results) {
              // Duration
              const durEl = document.getElementById("176605");
              if (durEl) durEl.value = results.input.durationMinutes + " minutes";
  
              // Accuracy
              const accEl = document.getElementById("176606");
              if (accEl) accEl.value = results.results.accuracyPercentage.toFixed(2) + " %";
  
              // Gross Chars
              const grossCharsEl = document.getElementById("176607");
              if (grossCharsEl) grossCharsEl.value = results.charLevel.grossCharacters;
  
              // Gross Speed
              const grossSpeedEl = document.getElementById("176608");
              if (grossSpeedEl) grossSpeedEl.value = results.charLevel.grossSpeed + " WPM";
  
              // Total Errors (full + half mistakes)
              const errHitsEl = document.getElementById("176612");
              if (errHitsEl) errHitsEl.value = results.errors.fullMistakes + results.errors.halfMistakes;
  
              // Errors (chars)
              const errEl = document.getElementById("176609");
              if (errEl) errEl.value = results.errors.errorCharacters.toFixed(1);
  
              // Net Chars
              const netCharsEl = document.getElementById("176610");
              if (netCharsEl) netCharsEl.value = results.charLevel.netCharacters;
  
              // Net Speed
              const netSpeedEl = document.getElementById("176611");
              if (netSpeedEl) netSpeedEl.value = results.charLevel.netSpeed + " WPM";
  
              // Final Result (optional extra field, e.g. id="176612")
              // const finalEl = document.getElementById("176612");
              // if (finalEl) finalEl.value = results.results.result === "PASS" ? "✅ PASS" : "❌ FAIL";
          }
  
          const finalResults = {
              input: { originalText, typedText, durationMinutes },
          
              wordLevel: {
                  systemWords: sysW.length,
                  typedWords: usrW.length,
                  correctWords: wrongWordsData.details.correct,
                  mergedWords: mergedWordsData.mergedWords,
                  splitWords: splitWordsData.splitWords,
                  wrongWords: wrongWordsData.details.wrong,
                  missingWords: missingWords,
                  extraWords: extraWords
              },
          
              charLevel: {
                  typedCharacters, // raw
                  grossCharacters, // adjusted
                  grossSpeed,
                  netCharacters,
                  netSpeed
              },
                          
              errors: { fullMistakes, halfMistakes, errorCharacters, extraSpaces },
          
              results: {
                  accuracyPercentage,
                  result,
                  passCriteria: {
                      grossSpeedRequired: 30,
                      accuracyRequired: 92
                  }
              },
              backspaces: backspaceCount,
              detailedAlignment: comprehensiveAligned
          };
          
  
          displayResultsInFields(finalResults);
  
          // === Store results in hidden fields ===
  
          // WORD-LEVEL (systemWords, typedWords, correct, wrong, etc.)
          setHiddenFieldValue("176962", finalResults.wordLevel);
          setHiddenFieldValue("176909", finalResults.wordLevel);
  
          // CHARACTER-LEVEL (gross chars, gross speed, net chars, net speed)
          setHiddenFieldValue("176963", finalResults.charLevel);
          setHiddenFieldValue("176910", finalResults.charLevel);
  
          // ERROR ANALYSIS (full mistakes, half mistakes, error chars, spaces)
          setHiddenFieldValue("176964", finalResults.errors);
          setHiddenFieldValue("176911", finalResults.errors);
  
          // RESULT & ACCURACY (accuracy %, PASS/FAIL + criteria)
          setHiddenFieldValue("176965", finalResults.results);
          setHiddenFieldValue("176912", finalResults.results);
  
          // DETAILED WORD ANALYSIS (word-by-word alignment)
          // setHiddenFieldValue("176966", finalResults.detailedAlignment);
          // setHiddenFieldValue("176913", finalResults.detailedAlignment);
          
           //**TO-DO: REPLACE FIELD NAMES WITH ACTUAL FIELD IDS**
  
          // === Store values in hidden fields ===
          // Characters
          setFieldValue("177166", typedCharacters);
          setFieldValue("176987", grossCharacters);
          setFieldValue("176988", grossSpeed);
          setFieldValue("177202", grossSpeed);
          setFieldValue("176989", netCharacters);
          setFieldValue("176990", netSpeed);
  
          // Words
          setFieldValue("176991", sysW.length);
          setFieldValue("176992", usrW.length);
          setFieldValue("176993", wrongWordsData.details.correct);
  
          // Errors
          setFieldValue("177000", extraWords);
          setFieldValue("177001", missingWords);
          setFieldValue("177002", wrongWordsData.details.wrong);
          setFieldValue("177192", fullMistakes);
  
          setFieldValue("177004", mergedWordsData.mergedWords);
          setFieldValue("177005", splitWordsData.splitWords);
          setFieldValue("177006", extraSpaces);
          setFieldValue("177193", halfMistakes);
          setFieldValue("177195", errorCharacters);
  
          setFieldValue("177009", htmlOutput.trim());
  
          // Final
          setFieldValue("177196", accuracyPercentage.toFixed(2) + "%");
          setFieldValue("177188", result);
  
          // Return comprehensive results object
          return {
              input: { originalText, typedText, durationMinutes },
              wordLevel: {
                  systemWords: sysW.length,
                  typedWords: usrW.length,
                  correctWords: wrongWordsData.details.correct,
                  mergedWords: mergedWordsData.mergedWords,
                  wrongWords: wrongWordsData.details.wrong,
                  missingWords: missingWords,
                  extraWords: extraWords
              },
              charLevel: {
                  typedCharacters, // raw
                  grossCharacters, // adjusted
                  grossSpeed,
                  netCharacters,
                  netSpeed
              },
              errors: {
                  fullMistakes,
                  halfMistakes,
                  errorCharacters,
                  extraSpaces
              },
              results: {
                  accuracyPercentage,
                  result,
                  passCriteria: {
                      grossSpeedRequired: 30,
                      accuracyRequired: 92
                  }
              },
              detailedAlignment: comprehensiveAligned
          };
      }
      
      // Execute the analysis
      return performCompleteAnalysis();
  
  };
  
  function setParagraph(srcElement){
      // ==================== PARAGRAPH MAP ====================
      const paragraphMap = {
          "1": { // Junior Scale Steno
              "1": "Life is a journey filled with opportunities, challenges, and countless moments that shape who we are. Every day offers a chance to learn something new, whether through personal experiences, interactions with others, or observing the world around us. Growth does not always come from success; often, it comes from mistakes and the lessons they leave behind. The ability to adapt, stay curious, and remain resilient in the face of uncertainty is what defines progress. People who embrace change tend to discover new perspectives and broaden their understanding of life. At the same time, balance is important, because working constantly without rest can lead to exhaustion, while too much comfort can prevent progress. A healthy balance between effort and relaxation allows individuals to sustain motivation and creativity. Relationships also play an essential role, as human beings thrive in connection with others. Friends, family, colleagues, and communities provide support, encouragement, and meaning. Communication, empathy, and trust strengthen these bonds, creating a foundation for cooperation and growth. In today’s fast-paced world, technology has brought people closer while also raising new challenges such as distraction and dependency. Using it wisely can help achieve goals, while overuse may lead to stress. Personal well-being, therefore, must include mindfulness, self-care, and an awareness of limits. Alongside personal growth, contributing to society is equally significant. Small acts of kindness, responsibility toward the environment, and respect for diversity enrich communities and ensure a better future. Life may not always go according to plan, but it is the unpredictability that makes it meaningful.", // English
              "2": "ਜੀਵਨ ਇੱਕ ਯਾਤਰਾ ਹੈ ਜਿਸ ਵਿੱਚ ਮੌਕੇ, ਚੁਣੌਤੀਆਂ ਅਤੇ ਅਣਗਿਣਤ ਪਲ ਹੁੰਦੇ ਹਨ ਜੋ ਸਾਨੂੰ ਗੜਦੇ ਹਨ। ਹਰ ਦਿਨ ਕੁਝ ਨਵਾਂ ਸਿੱਖਣ ਦਾ ਮੌਕਾ ਦਿੰਦਾ ਹੈ, ਕਦੇ ਆਪਣੇ ਅਨੁਭਵਾਂ ਰਾਹੀਂ, ਕਦੇ ਹੋਰਾਂ ਨਾਲ ਗੱਲਬਾਤ ਰਾਹੀਂ, ਜਾਂ ਫਿਰ ਦੁਨੀਆ ਨੂੰ ਵੇਖਦਿਆਂ। ਵਿਕਾਸ ਸਿਰਫ਼ ਸਫਲਤਾ ਤੋਂ ਨਹੀਂ ਮਿਲਦਾ, ਅਕਸਰ ਗਲਤੀਆਂ ਅਤੇ ਉਹਨਾਂ ਤੋਂ ਮਿਲਣ ਵਾਲੇ ਸਬਕ ਹੀ ਸਾਨੂੰ ਅੱਗੇ ਵਧਾਉਂਦੇ ਹਨ। ਜੋ ਲੋਕ ਬਦਲਾਵ ਨੂੰ ਸਵੀਕਾਰਦੇ ਹਨ, ਉਹ ਨਵੇਂ ਨਜ਼ਰੀਏ ਖੋਲ੍ਹਦੇ ਹਨ ਅਤੇ ਜੀਵਨ ਦੀ ਵਿਆਪਕ ਸਮਝ ਹਾਸਲ ਕਰਦੇ ਹਨ। ਨਾਲ ਹੀ, ਸੰਤੁਲਨ ਵੀ ਲਾਜ਼ਮੀ ਹੈ। ਸਿਰਫ਼ ਕੰਮ ਕਰਨ ਨਾਲ ਥਕਾਵਟ ਆਉਂਦੀ ਹੈ, ਜਦਕਿ ਬੇਹੱਦ ਆਰਾਮ ਤਰੱਕੀ ਰੋਕ ਦਿੰਦਾ ਹੈ। ਮਿਹਨਤ ਅਤੇ ਆਰਾਮ ਵਿੱਚ ਸੰਤੁਲਨ ਰੱਖਣ ਨਾਲ ਪ੍ਰੇਰਣਾ ਅਤੇ ਰਚਨਾਤਮਕਤਾ ਕਾਇਮ ਰਹਿੰਦੀ ਹੈ। ਰਿਸ਼ਤੇ ਵੀ ਬਹੁਤ ਮਹੱਤਵਪੂਰਣ ਹਨ ਕਿਉਂਕਿ ਮਨੁੱਖੀ ਜੀਵਨ ਸੰਬੰਧਾਂ ਵਿੱਚ ਹੀ ਖਿੜਦਾ ਹੈ। ਦੋਸਤ, ਪਰਿਵਾਰ, ਸਾਥੀ ਅਤੇ ਸਮਾਜ ਸਾਨੂੰ ਸਹਾਰਾ, ਹੌਸਲਾ ਅਤੇ ਅਰਥ ਦਿੰਦੇ ਹਨ। ਭਰੋਸਾ, ਹਮਦਰਦੀ ਅਤੇ ਗੱਲਬਾਤ ਇਹ ਰਿਸ਼ਤੇ ਮਜ਼ਬੂਤ ਬਣਾਉਂਦੇ ਹਨ। ਅੱਜ ਦੇ ਤੇਜ਼ ਰਫ਼ਤਾਰ ਵਾਲੇ ਸਮੇਂ ਵਿੱਚ ਤਕਨਾਲੋਜੀ ਨੇ ਲੋਕਾਂ ਨੂੰ ਨੇੜੇ ਲਿਆਂਦਾ ਹੈ ਪਰ ਨਾਲ ਹੀ ਧਿਆਨਭੰਗ ਅਤੇ ਨਿਰਭਰਤਾ ਵਰਗੀਆਂ ਸਮੱਸਿਆਵਾਂ ਵੀ ਪੈਦਾ ਕੀਤੀਆਂ ਹਨ। ਇਸਦਾ ਸਹੀ ਇਸਤੇਮਾਲ ਲਾਭਕਾਰੀ ਹੈ, ਪਰ ਹੱਦ ਤੋਂ ਵੱਧ ਵਰਤੋਂ ਤਣਾਅ ਪੈਦਾ ਕਰ ਸਕਦੀ ਹੈ। ਇਸ ਲਈ ਆਪਣੇ ਮਨ, ਸਰੀਰ ਅਤੇ ਜ਼ਿੰਦਗੀ ਵਿੱਚ ਸਾਵਧਾਨੀ ਅਤੇ ਖ਼ਿਆਲ ਰੱਖਣਾ ਜ਼ਰੂਰੀ ਹੈ। ਵਿਅਕਤੀਗਤ ਵਿਕਾਸ ਦੇ ਨਾਲ ਸਮਾਜ ਪ੍ਰਤੀ ਜ਼ਿੰਮੇਵਾਰੀ ਵੀ ਮਹੱਤਵਪੂਰਣ ਹੈ। ਛੋਟੇ ਛੋਟੇ ਭਲਾਈ ਦੇ ਕੰਮ, ਪਰਿਆਵਰਣ ਦੀ ਸੰਭਾਲ ਅਤੇ ਵੱਖਰਿਆਈ ਪ੍ਰਤੀ ਆਦਰ ਸਮਾਜ ਨੂੰ ਸੁੰਦਰ ਬਣਾਉਂਦੇ ਹਨ। ਜੀਵਨ ਹਮੇਸ਼ਾਂ ਯੋਜਨਾ ਅਨੁਸਾਰ ਨਹੀਂ ਚਲਦਾ, ਪਰ ਇਹੀ ਅਣਅਨੁਮਾਨੀਪਣ ਇਸਨੂੰ ਅਰਥਪੂਰਣ ਬਣਾਉਂਦਾ ਹੈ। ਛੋਟੀਆਂ ਜਿੱਤਾਂ ਦੀ ਕਦਰ ਕਰਨੀ, ਮੁਸ਼ਕਲਾਂ ਤੋਂ ਸਿੱਖਣਾ ਅਤੇ ਆਸ ਨਾਲ ਅੱਗੇ ਵਧਣਾ ਹੀ ਸੱਚੀ ਖੁਸ਼ੀ ਹੈ। ਅੰਤ ਵਿੱਚ ਸੰਤੁਸ਼ਟੀ ਪੂਰਨਤਾ ਵਿੱਚ ਨਹੀਂ, ਸਗੋਂ ਤਰੱਕੀ, ਕ੍ਰਿਤਗਤਾ ਅਤੇ ਹਿੰਮਤ ਵਿੱਚ ਮਿਲਦੀ ਹੈ। ਜੀਵਨ ਇੱਕ ਯਾਤਰਾ ਹੈ ਜਿਸ ਵਿੱਚ ਮੌਕੇ, ਚੁਣੌਤੀਆਂ ਅਤੇ ਅਣਗਿਣਤ ਪਲ ਹੁੰਦੇ ਹਨ ਜੋ ਸਾਨੂੰ ਗੜਦੇ ਹਨ। ਹਰ ਦਿਨ ਕੁਝ ਨਵਾਂ ਸਿੱਖਣ ਦਾ ਮੌਕਾ ਦਿੰਦਾ ਹੈ, ਕਦੇ ਆਪਣੇ ਅਨੁਭਵਾਂ ਰਾਹੀਂ, ਕਦੇ ਹੋਰਾਂ ਨਾਲ ਗੱਲਬਾਤ ਰਾਹੀਂ, ਜਾਂ ਫਿਰ ਦੁਨੀਆ ਨੂੰ ਵੇਖਦਿਆਂ। ਵਿਕਾਸ ਸਿਰਫ਼ ਸਫਲਤਾ ਤੋਂ ਨਹੀਂ ਮਿਲਦਾ, ਅਕਸਰ ਗਲਤੀਆਂ ਅਤੇ ਉਹਨਾਂ ਤੋਂ ਮਿਲਣ ਵਾਲੇ ਸਬਕ ਹੀ ਸਾਨੂੰ ਅੱਗੇ ਵਧਾਉਂਦੇ ਹਨ। ਜੋ ਲੋਕ ਬਦਲਾਵ ਨੂੰ ਸਵੀਕਾਰਦੇ ਹਨ, ਉਹ ਨਵੇਂ ਨਜ਼ਰੀਏ ਖੋਲ੍ਹਦੇ ਹਨ ਅਤੇ ਜੀਵਨ ਦੀ ਵਿਆਪਕ ਸਮਝ ਹਾਸਲ ਕਰਦੇ ਹਨ। ਨਾਲ ਹੀ, ਸੰਤੁਲਨ ਵੀ ਲਾਜ਼ਮੀ ਹੈ। ਸਿਰਫ਼ ਕੰਮ ਕਰਨ ਨਾਲ ਥਕਾਵਟ ਆਉਂਦੀ ਹੈ, ਜਦਕਿ ਬੇਹੱਦ ਆਰਾਮ ਤਰੱਕੀ ਰੋਕ ਦਿੰਦਾ ਹੈ। " // Punjabi
          },
          "2": { // Stenographer
              "1": "Life is a journey filled with opportunities, challenges, and countless moments that shape who we are. Every day offers a chance to learn something new, whether through personal experiences, interactions with others, or observing the world around us. Growth does not always come from success; often, it comes from mistakes and the lessons they leave behind. The ability to adapt, stay curious, and remain resilient in the face of uncertainty is what defines progress. People who embrace change tend to discover new perspectives and broaden their understanding of life. At the same time, balance is important, because working constantly without rest can lead to exhaustion, while too much comfort can prevent progress. A healthy balance between effort and relaxation allows individuals to sustain motivation and creativity. Relationships also play an essential role, as human beings thrive in connection with others. Friends, family, colleagues, and communities provide support, encouragement, and meaning. Communication, empathy, and trust strengthen these bonds, creating a foundation for cooperation and growth. In today’s fast-paced world, technology has brought people closer while also raising new challenges such as distraction and dependency. Using it wisely can help achieve goals, while overuse may lead to stress. Personal well-being, therefore, must include mindfulness, self-care, and an awareness of limits.", // English
              "2": "ਜੀਵਨ ਇੱਕ ਯਾਤਰਾ ਹੈ ਜਿਸ ਵਿੱਚ ਮੌਕੇ, ਚੁਣੌਤੀਆਂ ਅਤੇ ਅਣਗਿਣਤ ਪਲ ਹੁੰਦੇ ਹਨ ਜੋ ਸਾਨੂੰ ਗੜਦੇ ਹਨ। ਹਰ ਦਿਨ ਕੁਝ ਨਵਾਂ ਸਿੱਖਣ ਦਾ ਮੌਕਾ ਦਿੰਦਾ ਹੈ, ਕਦੇ ਆਪਣੇ ਅਨੁਭਵਾਂ ਰਾਹੀਂ, ਕਦੇ ਹੋਰਾਂ ਨਾਲ ਗੱਲਬਾਤ ਰਾਹੀਂ, ਜਾਂ ਫਿਰ ਦੁਨੀਆ ਨੂੰ ਵੇਖਦਿਆਂ। ਵਿਕਾਸ ਸਿਰਫ਼ ਸਫਲਤਾ ਤੋਂ ਨਹੀਂ ਮਿਲਦਾ, ਅਕਸਰ ਗਲਤੀਆਂ ਅਤੇ ਉਹਨਾਂ ਤੋਂ ਮਿਲਣ ਵਾਲੇ ਸਬਕ ਹੀ ਸਾਨੂੰ ਅੱਗੇ ਵਧਾਉਂਦੇ ਹਨ। ਜੋ ਲੋਕ ਬਦਲਾਵ ਨੂੰ ਸਵੀਕਾਰਦੇ ਹਨ, ਉਹ ਨਵੇਂ ਨਜ਼ਰੀਏ ਖੋਲ੍ਹਦੇ ਹਨ ਅਤੇ ਜੀਵਨ ਦੀ ਵਿਆਪਕ ਸਮਝ ਹਾਸਲ ਕਰਦੇ ਹਨ। ਨਾਲ ਹੀ, ਸੰਤੁਲਨ ਵੀ ਲਾਜ਼ਮੀ ਹੈ। ਸਿਰਫ਼ ਕੰਮ ਕਰਨ ਨਾਲ ਥਕਾਵਟ ਆਉਂਦੀ ਹੈ, ਜਦਕਿ ਬੇਹੱਦ ਆਰਾਮ ਤਰੱਕੀ ਰੋਕ ਦਿੰਦਾ ਹੈ। ਮਿਹਨਤ ਅਤੇ ਆਰਾਮ ਵਿੱਚ ਸੰਤੁਲਨ ਰੱਖਣ ਨਾਲ ਪ੍ਰੇਰਣਾ ਅਤੇ ਰਚਨਾਤਮਕਤਾ ਕਾਇਮ ਰਹਿੰਦੀ ਹੈ। ਰਿਸ਼ਤੇ ਵੀ ਬਹੁਤ ਮਹੱਤਵਪੂਰਣ ਹਨ ਕਿਉਂਕਿ ਮਨੁੱਖੀ ਜੀਵਨ ਸੰਬੰਧਾਂ ਵਿੱਚ ਹੀ ਖਿੜਦਾ ਹੈ। ਦੋਸਤ, ਪਰਿਵਾਰ, ਸਾਥੀ ਅਤੇ ਸਮਾਜ ਸਾਨੂੰ ਸਹਾਰਾ, ਹੌਸਲਾ ਅਤੇ ਅਰਥ ਦਿੰਦੇ ਹਨ। ਭਰੋਸਾ, ਹਮਦਰਦੀ ਅਤੇ ਗੱਲਬਾਤ ਇਹ ਰਿਸ਼ਤੇ ਮਜ਼ਬੂਤ ਬਣਾਉਂਦੇ ਹਨ। ਅੱਜ ਦੇ ਤੇਜ਼ ਰਫ਼ਤਾਰ ਵਾਲੇ ਸਮੇਂ ਵਿੱਚ ਤਕਨਾਲੋਜੀ ਨੇ ਲੋਕਾਂ ਨੂੰ ਨੇੜੇ ਲਿਆਂਦਾ ਹੈ ਪਰ ਨਾਲ ਹੀ ਧਿਆਨਭੰਗ ਅਤੇ ਨਿਰਭਰਤਾ ਵਰਗੀਆਂ ਸਮੱਸਿਆਵਾਂ ਵੀ ਪੈਦਾ ਕੀਤੀਆਂ ਹਨ। ਇਸਦਾ ਸਹੀ ਇਸਤੇਮਾਲ ਲਾਭਕਾਰੀ ਹੈ, ਪਰ ਹੱਦ ਤੋਂ ਵੱਧ ਵਰਤੋਂ ਤਣਾਅ ਪੈਦਾ ਕਰ ਸਕਦੀ ਹੈ। ਇਸ ਲਈ ਆਪਣੇ ਮਨ, ਸਰੀਰ ਅਤੇ ਜ਼ਿੰਦਗੀ ਵਿੱਚ ਸਾਵਧਾਨੀ ਅਤੇ ਖ਼ਿਆਲ ਰੱਖਣਾ ਜ਼ਰੂਰੀ ਹੈ। ਵਿਅਕਤੀਗਤ ਵਿਕਾਸ ਦੇ ਨਾਲ ਸਮਾਜ ਪ੍ਰਤੀ ਜ਼ਿੰਮੇਵਾਰੀ ਵੀ ਮਹੱਤਵਪੂਰਣ ਹੈ। ਛੋਟੇ ਛੋਟੇ ਭਲਾਈ ਦੇ ਕੰਮ, ਪਰਿਆਵਰਣ ਦੀ ਸੰਭਾਲ ਅਤੇ ਵੱਖਰਿਆਈ ਪ੍ਰਤੀ ਆਦਰ ਸਮਾਜ ਨੂੰ ਸੁੰਦਰ ਬਣਾਉਂਦੇ ਹਨ। ਜੀਵਨ ਹਮੇਸ਼ਾਂ ਯੋਜਨਾ ਅਨੁਸਾਰ ਨਹੀਂ ਚਲਦਾ, ਪਰ ਇਹੀ ਅਣਅਨੁਮਾਨੀਪਣ ਇਸਨੂੰ ਅਰਥਪੂਰਣ ਬਣਾਉਂਦਾ ਹੈ। ਛੋਟੀਆਂ ਜਿੱਤਾਂ ਦੀ ਕਦਰ ਕਰਨੀ, ਮੁਸ਼ਕਲਾਂ ਤੋਂ ਸਿੱਖਣਾ ਅਤੇ ਆਸ ਨਾਲ ਅੱਗੇ ਵਧਣਾ ਹੀ ਸੱਚੀ ਖੁਸ਼ੀ ਹੈ। ਅੰਤ ਵਿੱਚ ਸੰਤੁਸ਼ਟੀ ਪੂਰਨਤਾ ਵਿੱਚ ਨਹੀਂ, ਸਗੋਂ ਤਰੱਕੀ, ਕ੍ਰਿਤਗਤਾ ਅਤੇ ਹਿੰਮਤ ਵਿੱਚ ਮਿਲਦੀ ਹੈ। ਜੀਵਨ ਇੱਕ ਯਾਤਰਾ ਹੈ ਜਿਸ ਵਿੱਚ ਮੌਕੇ, ਚੁਣੌਤੀਆਂ ਅਤੇ ਅਣਗਿਣਤ ਪਲ ਹੁੰਦੇ ਹਨ ਜੋ ਸਾਨੂੰ ਗੜਦੇ ਹਨ। ਹਰ ਦਿਨ ਕੁਝ ਨਵਾਂ ਸਿੱਖਣ ਦਾ ਮੌਕਾ ਦਿੰਦਾ ਹੈ, ਕਦੇ ਆਪਣੇ ਅਨੁਭਵਾਂ ਰਾਹੀਂ, ਕਦੇ ਹੋਰਾਂ ਨਾਲ ਗੱਲਬਾਤ ਰਾਹੀਂ, ਜਾਂ ਫਿਰ ਦੁਨੀਆ ਨੂੰ ਵੇਖਦਿਆਂ। ਵਿਕਾਸ ਸਿਰਫ਼ ਸਫਲਤਾ ਤੋਂ ਨਹੀਂ ਮਿਲਦਾ, ਅਕਸਰ ਗਲਤੀਆਂ ਅਤੇ ਉਹਨਾਂ ਤੋਂ ਮਿਲਣ ਵਾਲੇ ਸਬਕ ਹੀ ਸਾਨੂੰ ਅੱਗੇ ਵਧਾਉਂਦੇ ਹਨ। ਜੋ ਲੋਕ ਬਦਲਾਵ ਨੂੰ ਸਵੀਕਾਰਦੇ ਹਨ, ਉਹ ਨਵੇਂ ਨਜ਼ਰੀਏ ਖੋਲ੍ਹਦੇ ਹਨ ਅਤੇ ਜੀਵਨ ਦੀ ਵਿਆਪਕ ਸਮਝ ਹਾਸਲ ਕਰਦੇ ਹਨ। ਨਾਲ ਹੀ, ਸੰਤੁਲਨ ਵੀ ਲਾਜ਼ਮੀ ਹੈ। ਸਿਰਫ਼ ਕੰਮ ਕਰਨ ਨਾਲ ਥਕਾਵਟ ਆਉਂਦੀ ਹੈ, ਜਦਕਿ ਬੇਹੱਦ ਆਰਾਮ ਤਰੱਕੀ ਰੋਕ ਦਿੰਦਾ ਹੈ। " // Punjabi
          }
      };
      
      // ==================== HELPER FUNCTION ====================
      function getSelectedParagraph() {
          const post = document.querySelector("input[name='177184']:checked");
          const lang = document.querySelector("input[name='177185']:checked");
      
          if (post && lang) {
              const postVal = post.value;
              const langVal = lang.value;
              return paragraphMap[postVal]?.[langVal] || "Paragraph not available";
          }
          return "Please select Post and Language first.";
      }
      
      // ==================== MAIN FUNCTION ====================
          var el = document.getElementById("176488"); // English textarea
          if (!el) {
              console.warn("Field 176488 not found");
              return false;
          }
      
          // Get correct paragraph
          var paragraph = getSelectedParagraph();
      
          // Insert paragraph
          el.value = paragraph;
      
          // Make it readonly
          // el.readOnly = true;
      
          // Reset height, then adjust based on scrollHeight
          el.style.height = "auto";             
          el.style.height = el.scrollHeight + "px"; 
      
          // Optional width tweak
          el.style.width = "95%";
      
          // Prevent user resize
          el.style.resize = "none";
      
          return true;
      
      
  };
  
  function radioButtonAlignment(srcElement){
  $(document).ready(function () {
      function alignRadiosLikeInput() {
          var isMobile = $(window).width() <= 768;
  
          var $label = $("label[for='177267']").first();
          var $cont = $label.siblings(".cont");
  
          // Remove the label
          $label.hide();
  
          // Make the radio container align like input
          $cont.css({
              "display": "flex",
              "flex-wrap": "wrap",
              "align-items": "center",
              "width": isMobile ? "100%" : "35%",
              "margin-left": isMobile ? "0" : "auto" // align to right like inputs
          });
  
          // Style individual radio labels
          $cont.find("label").css({
              "margin-right": "15px",
              "margin-bottom": isMobile ? "10px" : "0",
              "display": "flex",
              "align-items": "center"
          });
      }
  
      // Initial alignment
      alignRadiosLikeInput();
  
      // Adjust on window resize
      $(window).on("resize", function () {
          alignRadiosLikeInput();
      });
  });
  return true;
  };
  
  function setBackgroundImage(srcElement){
  $(document).ready(function () {
      // Your background image URL
      var imgSrc = "Filemanager/connectors/jsp/filemanager.jsp?mode=preview&path=/sp_san1/ROOT/Filemanager/userfiles/Punjab/NewcmReliefSectionBackgroungImage.png";
  
      // Target the parent section that contains the h4 and form
      var $section = $("#177267").closest(".table_cont")
  
      // Apply background image after the h4
      $section.css({
          "background-image": "url('" + imgSrc + "')",
          "background-size": "cover",
          "background-position": "center",
          "background-repeat": "no-repeat",
          "position": "relative",
          "color": "#fff"
      });
  
      // Optional: Add an overlay for better text readability
      if (!$section.find(".bg-overlay").length) {
          $section.prepend('<div class="bg-overlay"></div>');
          $(".bg-overlay").css({
              "position": "absolute",
              "top": "0",
              "left": "0",
              "width": "100%",
              "height": "100%",
              "background": "rgba(0,0,0,0.4)", // dark overlay
              "z-index": "1",
              "border-radius": $section.css("border-radius")
          });
  
          // Bring content above overlay
          $section.children().not(".bg-overlay").css("position", "relative").css("z-index", "2");
      }
  });
  return true;
  };
  
  function backspaceTracker(inputId, finishBtnId, srcElement){
  // Independent Backspace Counter
      let backspaceCount = 0;
  
      // Find the input element
      const inputEl = document.getElementById(inputId);
      if (!inputEl) {
          console.error("❌ Input field not found:", inputId);
          return;
      }
  
      // Count backspaces while typing
      inputEl.addEventListener("keydown", (event) => {
          if (event.key === "Backspace") {
              backspaceCount++;
              console.log("Backspaces so far:", backspaceCount);
          }
      });
  
      // Hook into Finish button
      const finishBtn = document.getElementById(finishBtnId);
      if (finishBtn) {
          finishBtn.addEventListener("click", () => {
              console.log("✅ Final Backspace Count:", backspaceCount);
          });
      } else {
          console.warn("⚠️ Finish button not found:", finishBtnId);
      }
  
      return () => backspaceCount; // helper if you ever need to fetch count manually
  
  };
  
  
  $(document).ready(function(){
  
  $("*[name^='176486']").on('focus', function() {
  if(!autoResizeTypedField(this))return false;
  });
  $("*[name^='176487']").on('click', function() {
  if(!DPcomprehensiveTypingAnalysis(this))return false;
  });
  $("*[name^='177201']").on('click', function() {
  if(!setParagraph(this))return false;
  });
  
  if(!radioButtonAlignment(this))return false;
  if(!setBackgroundImage(this))return false;
  if(!backspaceTracker('176486', '176487', this))return false;
  
  
  if(!setWebServiceOptions(this))return false;
  });
  
  var customOnSubmitFunctions= function() {
  
  if(!DPcomprehensiveTypingAnalysis(this))return false;
   
  return true;};
  function setValue(destination, val, srcElement){
   if( val !=null && combinedJson!=null && combinedJson!=""){
   var attribute=combinedJson.attribute;
  for (var i = 0; i < attribute.length; i++)
      {
      if(attribute[i].id==destination){
        attribute[i].values.value=val;
        break;
        } }
   $("#"+destination).val(val);
   if($("[name=combinedJsonData]").length==0){
      var input = document.createElement("input");
      input.setAttribute("type","hidden");
      input.setAttribute("name", "combinedJsonData");
      document.getElementById("ApplicationFormLayout").appendChild(input);
      input.setAttribute("value",JSON.stringify(combinedJson));
     } else{$("[name=combinedJsonData]").val("");
   $("[name=combinedJsonData]").val(JSON.stringify(combinedJson));}}
  
  };
  
  function getValue(source, srcElement){
   
  var val="";	
  var sourceId= source; 
   val=$("#"+sourceId).val();
   if(val==null )
  { var attribute=combinedJson.attribute;	
  for (var i = 0; i < attribute.length; i++)
  { if(attribute[i].id==source)
  {
  val=attribute[i].values.value;
  break;
   } }}
  return val;
  
  };
  
  function setWebServiceOptions(srcElement){
      if(webServiceOptionList!=null && webServiceOptionList!="" )
  {	 
     for(i=0;i<webServiceOptionList.length;i++){
  
      var attrId=webServiceOptionList[i].attribute_id;
      var attrLabel=webServiceOptionList[i].option_value;
      var attrVal=webServiceOptionList[i].option_id;
      if($("[name="+attrId+"]").prop("required")==true && statusApp=="P")
          { 
              $("#"+attrId).trigger("change");	
               var certLink =  "<label >"+attrLabel+"</label>";
              $("[name='"+attrId+"']").before(certLink);	
              if(attrId.indexOf('_')==-1){
                  $("#"+attrId).remove();
               }else{
               $("#"+attrId).val(attrVal);
               }
          }else{
              $("[name='"+attrId+"']").val(webServiceOptionList[i].option_id);
              $("[name='"+attrId+"']").trigger("change");
          }
  
      }
  }
  return true;
  };
  