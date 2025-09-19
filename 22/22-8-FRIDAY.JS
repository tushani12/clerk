//Final Function combining all the functions
function comprehensiveTypingAnalysis() {
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
    const durationMinutes = 2;
    
    // ==================== HELPER FUNCTIONS ====================
    
    // Whitespace detection
    const WS = [9, 10, 13, 32, 160]; // tab, newline, carriage return, space, non-breaking space
    function isWS(ch) { 
        return WS.indexOf(ch.charCodeAt(0)) !== -1; 
    }
    
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
        function alignWords(sysW, usrW) {
            const aligned = [];
            let i = 0, j = 0;
            const maxSkip = 10;
        
            while (i < sysW.length && j < usrW.length) {
                const sysWord = sysW[i].low;
                const usrWord = usrW[j].low;
        
                if (sysWord === usrWord) {
                    aligned.push({ word: usrW[j].raw, status: 'correct' });
                    i++; j++;
                } else {
                    let matched = false;
        
                    // Typo check (1-2 char error)
                    const lev = levenshtein(sysWord, usrWord);
                    if (lev > 0 && lev <= 2) {
                        aligned.push({
                            word: usrW[j].raw,
                            status: 'typo',
                            expected: sysW[i].raw,
                            dist: lev
                        });
                        i++; j++;
                        continue;
                    }
        
                    // Look ahead for merge or realignment
                    for (let skip = 1; skip <= maxSkip; skip++) {
                        if (i + skip < sysW.length && sysW[i + skip].low === usrWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i + m].raw });
                            }
                            aligned.push({ word: usrW[j].raw, status: 'correct' });
                            i += skip + 1;
                            j++;
                            matched = true;
                            break;
                        }
        
                        if (j + skip < usrW.length && usrW[j + skip].low === sysWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: usrW[j + m].raw, status: 'extra' });
                            }
                            aligned.push({ word: usrW[j + skip].raw, status: 'correct' });
                            i++;
                            j += skip + 1;
                            matched = true;
                            break;
                        }
                    }
        
                    if (!matched) {
                        // Check if user word includes 2 system words (merged)
                        if (usrWord.includes(sysW[i].low) && usrWord.includes(sysW[i + 1]?.low || '')) {
                            aligned.push({
                                word: usrW[j].raw,
                                status: 'merged',
                                expected: sysW[i].raw + ' ' + (sysW[i + 1]?.low || '')
                            });
                            i += 2;
                            j++;
                        } else {
                            aligned.push({ word: usrW[j].raw, status: 'wrong', expected: sysW[i].raw });
                            i++; j++;
                        }
                    }
                }
            }
        
            // Handle remaining system words as missing
            while (i < sysW.length) {
                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i].raw });
                i++;
            }
        
            // Handle remaining user words as extra
            while (j < usrW.length) {
                aligned.push({ word: usrW[j].raw, status: 'extra' });
                j++;
            }
        
            return aligned;
        }
        
        // Align words and count extra words
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
        function alignWords(sysW, usrW) {
            const aligned = [];
            let i = 0, j = 0;
            const maxSkip = 10;
        
            while (i < sysW.length && j < usrW.length) {
                const sysWord = sysW[i].low;
                const usrWord = usrW[j].low;
        
                if (sysWord === usrWord) {
                    aligned.push({ word: usrW[j].raw, status: 'correct' });
                    i++; j++;
                } else {
                    let matched = false;
        
                    // Typo check (1-2 char error)
                    const lev = levenshtein(sysWord, usrWord);
                    if (lev > 0 && lev <= 2) {
                        aligned.push({
                            word: usrW[j].raw,
                            status: 'typo',
                            expected: sysW[i].raw,
                            dist: lev
                        });
                        i++; j++;
                        continue;
                    }
        
                    // Look ahead for merge or realignment
                    for (let skip = 1; skip <= maxSkip; skip++) {
                        if (i + skip < sysW.length && sysW[i + skip].low === usrWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i + m].raw });
                            }
                            aligned.push({ word: usrW[j].raw, status: 'correct' });
                            i += skip + 1;
                            j++;
                            matched = true;
                            break;
                        }
        
                        if (j + skip < usrW.length && usrW[j + skip].low === sysWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: usrW[j + m].raw, status: 'extra' });
                            }
                            aligned.push({ word: usrW[j + skip].raw, status: 'correct' });
                            i++;
                            j += skip + 1;
                            matched = true;
                            break;
                        }
                    }
        
                    if (!matched) {
                        // possible merged word? check if user word includes 2 sys words
                        if (usrWord.includes(sysW[i].low) && usrWord.includes(sysW[i + 1]?.low || '')) {
                            aligned.push({
                                word: usrW[j].raw,
                                status: 'merged',
                                expected: sysW[i].raw + ' ' + (sysW[i + 1]?.low || '')
                            });
                            i += 2;
                            j++;
                        } else {
                            aligned.push({ word: usrW[j].raw, status: 'wrong', expected: sysW[i].raw });
                            i++; j++;
                        }
                    }
                }
            }
        
            // Handle remaining system words as missing
            while (i < sysW.length) {
                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i].raw });
                i++;
            }
        
            // Handle remaining user words as extra
            while (j < usrW.length) {
                aligned.push({ word: usrW[j].raw, status: 'extra' });
                j++;
            }
        
            return aligned;
        }
        
        // Align words to identify missing ones
        const aligned = alignWords(sysW, usrW);
        
        // Count missing words
        const missingWords = aligned.filter(w => w.status === 'missing');
        return missingWords.length;
    }
    
    // Wrong Words calculation (wrong + typo)
    function calculateTotalWrongWords(originalText, typedText) {
        if (!originalText || !typedText) return { wrongWords: 0, typoWords: 0, totalWrongWords: 0 };
        
        const sysW = wordsOnly(originalText);
        const usrW = wordsOnly(typedText);
        
        // Align words and classify them
        function alignWords(sysW, usrW) {
            const aligned = [];
            let i = 0, j = 0;
            const maxSkip = 10;
        
            while (i < sysW.length && j < usrW.length) {
                const sysWord = sysW[i].low;
                const usrWord = usrW[j].low;
        
                if (sysWord === usrWord) {
                    aligned.push({ word: usrW[j].raw, status: 'correct' });
                    i++; j++;
                } else {
                    let matched = false;
        
                    // Typo check (1-2 char error)
                    const lev = levenshtein(sysWord, usrWord);
                    if (lev > 0 && lev <= 2) {
                        aligned.push({
                            word: usrW[j].raw,
                            status: 'typo',
                            expected: sysW[i].raw,
                            dist: lev
                        });
                        i++; j++;
                        continue;
                    }
        
                    // Look ahead for merge or realignment
                    for (let skip = 1; skip <= maxSkip; skip++) {
                        if (i + skip < sysW.length && sysW[i + skip].low === usrWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i + m].raw });
                            }
                            aligned.push({ word: usrW[j].raw, status: 'correct' });
                            i += skip + 1;
                            j++;
                            matched = true;
                            break;
                        }
        
                        if (j + skip < usrW.length && usrW[j + skip].low === sysWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: usrW[j + m].raw, status: 'extra' });
                            }
                            aligned.push({ word: usrW[j + skip].raw, status: 'correct' });
                            i++;
                            j += skip + 1;
                            matched = true;
                            break;
                        }
                    }
        
                    if (!matched) {
                        // possible merged word? check if user word includes 2 sys words
                        if (usrWord.includes(sysW[i].low) && usrWord.includes(sysW[i + 1]?.low || '')) {
                            aligned.push({
                                word: usrW[j].raw,
                                status: 'merged',
                                expected: sysW[i].raw + ' ' + (sysW[i + 1]?.low || '')
                            });
                            i += 2;
                            j++;
                        } else {
                            aligned.push({ word: usrW[j].raw, status: 'wrong', expected: sysW[i].raw });
                            i++; j++;
                        }
                    }
                }
            }
        
            while (i < sysW.length) {
                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i].raw });
                i++;
            }
        
            while (j < usrW.length) {
                aligned.push({ word: usrW[j].raw, status: 'extra' });
                j++;
            }
        
            return aligned;
        }
        
        // Align and classify words
        const aligned = alignWords(sysW, usrW);
        
        // Count different types of words
        const counts = {
            correct: 0,
            wrong: 0,
            missing: 0,
            extra: 0,
            typo: 0,
            merged: 0
        };
    
        for (const w of aligned) {
            if (counts[w.status] !== undefined) counts[w.status]++;
        }
    
        // Calculate total wrong words (wrong + typo)
        const wrongWords = counts.wrong;
        const typoWords = counts.typo;
        const totalWrongWords = wrongWords + typoWords;
    
        return {
            wrongWords: wrongWords,
            typoWords: typoWords,
            totalWrongWords: totalWrongWords,
            details: counts
        };
    }
    
    // Merged Words calculation
    function detectMergedWords(originalText, typedText) {
        if (!originalText || !typedText) return { mergedWords: 0, mergedWordDetails: [] };
        
        const sysW = wordsOnly(originalText);
        const usrW = wordsOnly(typedText);
        
        // Align words and classify them, focusing on merged words
        function alignWords(sysW, usrW) {
            const aligned = [];
            let i = 0, j = 0;
            const maxSkip = 10;
        
            while (i < sysW.length && j < usrW.length) {
                const sysWord = sysW[i].low;
                const usrWord = usrW[j].low;
        
                if (sysWord === usrWord) {
                    aligned.push({ word: usrW[j].raw, status: 'correct' });
                    i++; j++;
                } else {
                    let matched = false;
        
                    // Typo check (1-2 char error)
                    const lev = levenshtein(sysWord, usrWord);
                    if (lev > 0 && lev <= 2) {
                        aligned.push({
                            word: usrW[j].raw,
                            status: 'typo',
                            expected: sysW[i].raw,
                            dist: lev
                        });
                        i++; j++;
                        continue;
                    }
        
                    // Look ahead for merge or realignment
                    for (let skip = 1; skip <= maxSkip; skip++) {
                        if (i + skip < sysW.length && sysW[i + skip].low === usrWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i + m].raw });
                            }
                            aligned.push({ word: usrW[j].raw, status: 'correct' });
                            i += skip + 1;
                            j++;
                            matched = true;
                            break;
                        }
        
                        if (j + skip < usrW.length && usrW[j + skip].low === sysWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: usrW[j + m].raw, status: 'extra' });
                            }
                            aligned.push({ word: usrW[j + skip].raw, status: 'correct' });
                            i++;
                            j += skip + 1;
                            matched = true;
                            break;
                        }
                    }
        
                    if (!matched) {
                        // Check for merged words - user word includes 2 system words
                        if (i + 1 < sysW.length && 
                            usrWord.includes(sysW[i].low) && 
                            usrWord.includes(sysW[i + 1].low)) {
                            aligned.push({
                                word: usrW[j].raw,
                                status: 'merged',
                                expected: sysW[i].raw + ' ' + sysW[i + 1].raw,
                                mergedWords: [sysW[i].raw, sysW[i + 1].raw]
                            });
                            i += 2;
                            j++;
                        } else {
                            aligned.push({ word: usrW[j].raw, status: 'wrong', expected: sysW[i].raw });
                            i++; j++;
                        }
                    }
                }
            }
        
            while (i < sysW.length) {
                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i].raw });
                i++;
            }
        
            while (j < usrW.length) {
                aligned.push({ word: usrW[j].raw, status: 'extra' });
                j++;
            }
        
            return aligned;
        }
        
        // Align and classify words
        const aligned = alignWords(sysW, usrW);
        
        // Count different types of words
        const counts = {
            correct: 0,
            wrong: 0,
            missing: 0,
            extra: 0,
            typo: 0,
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
    
    // ==================== MAIN CALCULATION FUNCTION ====================
    
    function performCompleteAnalysis() {
        // Get system and user words
        const sysW = wordsOnly(originalText);
        const usrW = wordsOnly(typedText);
        
        // Calculate gross characters and speed
        const grossCharacters = countGrossChars(typedText);
        const grossSpeed = calculateGrossSpeed(grossCharacters, durationMinutes);
        
        // Calculate all error types
        const extraWords = calculateExtraWords(originalText, typedText);
        const missingWords = calculateMissingWords(originalText, typedText);
        const wrongWordsData = calculateTotalWrongWords(originalText, typedText);
        const mergedWordsData = detectMergedWords(originalText, typedText);
        const extraSpaces = countExtraSpaces(typedText);
        
        // Calculate full mistakes (sum of extra + missing + wrong words)
        const fullMistakes = extraWords + missingWords + wrongWordsData.totalWrongWords;
        
        // Calculate half mistakes (sum of merged + extra spaces)
        const halfMistakes = mergedWordsData.mergedWords + extraSpaces;
        
        // Calculate total error characters
        const errorCharacters = (5 * fullMistakes) + (2.5 * halfMistakes);
        
        // Calculate net characters and speed
        const netCharacters = grossCharacters - errorCharacters;
        const netSpeed = Math.floor(netCharacters / (5 * durationMinutes));
        
        // Calculate accuracy percentage
        const accuracyPercentage = grossCharacters > 0 ? (netCharacters / grossCharacters) * 100 : 0;
        
        // Determine result (pass/fail)
        const result = (grossSpeed >= 30) && (accuracyPercentage >= 92) ? 'PASS' : 'FAIL';
        
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
        
        // Word-Level Analysis
        console.log("%c🔤 WORD-LEVEL ANALYSIS", "color: #FF9800; font-weight: bold; font-size: 14px;");
        console.log("System words         :", sysW.length);
        console.log("Typed words          :", usrW.length);
        console.log("Correct words        :", wrongWordsData.details.correct);
        console.log("Typos (1-2 char err) :", wrongWordsData.details.typo);
        console.log("Merged words         :", mergedWordsData.mergedWords);
        console.log("Wrong words          :", wrongWordsData.details.wrong);
        console.log("Missing words        :", missingWords);
        console.log("Extra words          :", extraWords);
        console.log("");
        
        // Character-Level Analysis
        console.log("%c📊 CHARACTER-LEVEL ANALYSIS", "color: #9C27B0; font-weight: bold; font-size: 14px;");
        console.log("Gross Characters     :", grossCharacters);
        console.log("Gross Speed (WPM)    :", grossSpeed);
        console.log("Net Characters       :", netCharacters);
        console.log("Net Speed (WPM)      :", netSpeed);
        console.log("");
        
        // Error Analysis
        console.log("%c❌ ERROR ANALYSIS", "color: #F44336; font-weight: bold; font-size: 14px;");
        console.log("Full Mistakes        :", fullMistakes);
        console.log("  ├─ Extra Words     :", extraWords);
        console.log("  ├─ Missing Words   :", missingWords);
        console.log("  └─ Wrong Words     :", wrongWordsData.totalWrongWords);
        console.log("Half Mistakes        :", halfMistakes);
        console.log("  ├─ Merged Words    :", mergedWordsData.mergedWords);
        console.log("  └─ Extra Spaces    :", extraSpaces);
        console.log("Total Error Characters:", errorCharacters.toFixed(1));
        console.log("");
        
        // Results and Accuracy
        console.log("%c🎯 RESULTS & ACCURACY", "color: #00BCD4; font-weight: bold; font-size: 14px;");
        console.log("Accuracy Percentage   :", accuracyPercentage.toFixed(2) + "%");
        console.log("Final Result          :", result === 'PASS' ? '✅ PASS' : '❌ FAIL');
        console.log("");
        
        // // Folder Structure Reference
        // console.log("%c📁 FOLDER STRUCTURE REFERENCE", "color: #607D8B; font-weight: bold; font-size: 14px;");
        // console.log("22/");
        // console.log("├── Word-Level/");
        // console.log("│   ├── system-words.js     → System words count");
        // console.log("│   └── typed-words.js      → Typed words analysis");
        // console.log("├── Char-Level/");
        // console.log("│   ├── gross-char.js       → Gross characters calculation");
        // console.log("│   └── gross-speed.js      → Gross speed calculation");
        // console.log("├── Common/");
        // console.log("│   ├── Accuracy%.js        → Accuracy percentage");
        // console.log("│   ├── Net-Characters.js   → Net characters calculation");
        // console.log("│   ├── Net-Speed.js        → Net speed calculation");
        // console.log("│   └── Result.js           → Pass/Fail determination");
        // console.log("└── Errors/");
        // console.log("    ├── Full-mistakes/");
        // console.log("    │   ├── Count-Full-mistakes.js → Full mistakes count");
        // console.log("    │   ├── extra-words.js         → Extra words detection");
        // console.log("    │   ├── missing-words.js       → Missing words detection");
        // console.log("    │   └── wrong-words.js         → Wrong words detection");
        // console.log("    ├── Half-mistakes/");
        // console.log("    │   ├── Count-Half-mistakes.js → Half mistakes count");
        // console.log("    │   ├── extra-spaces.js        → Extra spaces detection");
        // console.log("    │   └── merged-words.js        → Merged words detection");
        // console.log("    └── Total-Error-Characters.js  → Total error calculation");
        // console.log("");
        
        // Detailed Word Analysis
        console.log("%c🔍 DETAILED WORD ANALYSIS", "color: #795548; font-weight: bold; font-size: 14px;");
        
        // Create comprehensive word alignment for display
        function createComprehensiveAlignment() {
            const aligned = [];
            let i = 0, j = 0;
            const maxSkip = 10;
        
            while (i < sysW.length && j < usrW.length) {
                const sysWord = sysW[i].low;
                const usrWord = usrW[j].low;
        
                if (sysWord === usrWord) {
                    aligned.push({ word: usrW[j].raw, status: 'correct' });
                    i++; j++;
                } else {
                    let matched = false;
        
                    // Typo check (1-2 char error)
                    const lev = levenshtein(sysWord, usrWord);
                    if (lev > 0 && lev <= 2) {
                        aligned.push({
                            word: usrW[j].raw,
                            status: 'typo',
                            expected: sysW[i].raw,
                            dist: lev
                        });
                        i++; j++;
                        continue;
                    }
        
                    // Look ahead for merge or realignment
                    for (let skip = 1; skip <= maxSkip; skip++) {
                        if (i + skip < sysW.length && sysW[i + skip].low === usrWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i + m].raw });
                            }
                            aligned.push({ word: usrW[j].raw, status: 'correct' });
                            i += skip + 1;
                            j++;
                            matched = true;
                            break;
                        }
        
                        if (j + skip < usrW.length && usrW[j + skip].low === sysWord) {
                            for (let m = 0; m < skip; m++) {
                                aligned.push({ word: usrW[j + m].raw, status: 'extra' });
                            }
                            aligned.push({ word: usrW[j + skip].raw, status: 'correct' });
                            i++;
                            j += skip + 1;
                            matched = true;
                            break;
                        }
                    }
        
                    if (!matched) {
                        // Check if user word includes 2 system words (merged)
                        if (usrWord.includes(sysW[i].low) && usrWord.includes(sysW[i + 1]?.low || '')) {
                            aligned.push({
                                word: usrW[j].raw,
                                status: 'merged',
                                expected: sysW[i].raw + ' ' + (sysW[i + 1]?.low || '')
                            });
                            i += 2;
                            j++;
                        } else {
                            aligned.push({ word: usrW[j].raw, status: 'wrong', expected: sysW[i].raw });
                            i++; j++;
                        }
                    }
                }
            }
        
            // Handle remaining system words as missing
            while (i < sysW.length) {
                aligned.push({ word: '(none)', status: 'missing', expected: sysW[i].raw });
                i++;
            }
        
            // Handle remaining user words as extra
            while (j < usrW.length) {
                aligned.push({ word: usrW[j].raw, status: 'extra' });
                j++;
            }
        
            return aligned;
        }
        
        const comprehensiveAligned = createComprehensiveAlignment();
        
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
            } else if (w.status === 'typo') {
                formattedOutput += '%c' + displayText;
                cssStyles.push('color: #E65100; background: #FFF3E0; padding: 2px 4px; border-radius: 3px;');
            } else if (w.status === 'merged') {
                formattedOutput += '%c' + displayText;
                cssStyles.push('color: #1A237E; background: #C5CAE9; padding: 2px 4px; border-radius: 3px;');
            }
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
        console.log("🟠 Orange background: Typo words (1-2 char errors)");
        console.log("🔵 Blue background: Merged words");
        console.log("");
        
        // console.log("%c✨ Analysis Complete! All functions from 22/ folder have been combined and executed.", "color: #4CAF50; font-weight: bold; font-size: 16px;");
        
        // Return comprehensive results object
        return {
            input: { originalText, typedText, durationMinutes },
            wordLevel: {
                systemWords: sysW.length,
                typedWords: usrW.length,
                correctWords: wrongWordsData.details.correct,
                typoWords: wrongWordsData.details.typo,
                mergedWords: mergedWordsData.mergedWords,
                wrongWords: wrongWordsData.details.wrong,
                missingWords: missingWords,
                extraWords: extraWords
            },
            charLevel: {
                grossCharacters,
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
}

// Export the function for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { comprehensiveTypingAnalysis };
}

// Auto-execute if running in browser console
if (typeof window !== 'undefined') {
    console.log("🚀 Comprehensive Typing Analysis Function Loaded!");
    console.log("💡 Run 'comprehensiveTypingAnalysis()' to execute the analysis");
    console.log("📁 This function combines all functionality from the 22/ folder structure");
    console.log("🔗 You can now map this function to your 'finish' button in ServicePlus!");
}