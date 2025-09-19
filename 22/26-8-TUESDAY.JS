//Final Function combining all the functions
function FINALcomprehensiveTypingAnalysis() {
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
    const TYPO_DISTANCE = 1;
    const TYPO_MIN_LENGTH = 20;

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
    
    // Centralized word alignment function to eliminate code duplication
    function alignWords(sysW, usrW) {
        const aligned = [];
        let i = 0, j = 0;
        const maxSkip = 10;
    
        while (i < sysW.length && j < usrW.length) {
            const sysWord = sysW[i].low;
            const usrWord = usrW[j].low;
    
            // Only treat as correct when case-sensitive match (capitalization mistakes count as wrong)
            if (sysW[i].raw === usrW[j].raw) {
                aligned.push({ word: usrW[j].raw, status: 'correct' });
                i++; j++;
            } else {
                let matched = false;
    
                // Spelling mistake check (1-2 char error) → count as wrong
                const lev = levenshtein(sysWord, usrWord);
                if (lev > 0 && lev <= TYPO_DISTANCE && sysWord.length >= TYPO_MIN_LENGTH && usrWord.length >= TYPO_MIN_LENGTH) {
                    aligned.push({ word: usrW[j].raw, status: 'wrong', expected: sysW[i].raw });
                    i++; j++;
                    continue;
                }
    
                // Look ahead for merge, split, or realignment
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
                    // Check if two user words combine into one system word (split)
                    } else if (j + 1 < usrW.length && (usrW[j].low + usrW[j + 1].low) === sysWord) {
                        aligned.push({
                            word: usrW[j].raw + ' ' + usrW[j + 1].raw,
                            status: 'split',
                            expected: sysW[i].raw
                        });
                        i += 1;
                        j += 2;
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
        const splitWordsData = detectSplitWords(originalText, typedText);
        const extraSpaces = countExtraSpaces(typedText);
        
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
        // Typos are counted under Wrong words now (spelling/case mistakes)
        console.log("Merged words         :", mergedWordsData.mergedWords);
        console.log("Split words          :", splitWordsData.splitWords);
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
        
        console.log("Net Gross Chars =", grossCharacters - (extraSpaces + wrongWordsData.extraWrongChars));

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
            charLevel: { grossCharacters, grossSpeed, netCharacters, netSpeed },
            errors: { fullMistakes, halfMistakes, errorCharacters, extraSpaces },
            results: { accuracyPercentage, result }
        };

        displayResultsInFields(finalResults);

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
    module.exports = { FINALcomprehensiveTypingAnalysis };
}

// Auto-execute if running in browser console
if (typeof window !== 'undefined') {
    console.log("🚀 Comprehensive Typing Analysis Function Loaded!");
    console.log("💡 Run 'FINALcomprehensiveTypingAnalysis()' to execute the analysis");
    console.log("📁 This function combines all functionality from the 22/ folder structure");
    console.log("🔗 You can now map this function to your 'finish' button in ServicePlus!");
}