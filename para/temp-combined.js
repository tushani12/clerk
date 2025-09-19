function runTypingTest(srcElement){
    /**
     * === CLERK Typing Test Calculator (ServicePlus Integration) ===
     * Calculates: Gross Characters, Gross Speed, Error Characters
     * Works for English + Punjabi (Raavi Unicode, Inscript)
     */
    
        var originalEl = document.getElementById("176488"); // fixed passage
        var typedEl = document.getElementById("176486");   // candidate typed
        
        if (!originalEl || !typedEl) {
            console.error("❌ Required elements not found (#176488 and #176486)");
            return;
        }
    
        const durationMinutes = 2;
        const originalText = originalEl.innerText || originalEl.value || "";
        const typedText = typedEl.value || "";
    
        // ------------------ GROSS CHARACTERS & EXTRA SPACES ------------------
        function calculateGrossCharactersAndExtraSpaces(originalText, typedText) {
            if (!originalText || !typedText) return { grossChars: 0, extraSpaces: 0 };
            
            const WS = /\s/; // Whitespace regex
            const sysVal = originalText;
            const usrVal = typedText;
            
            let GC = 0;
            let extraSpaces = 0;

            // Calculate gross characters using the existing logic
            let i = 0, j = 0;
            while (i < sysVal.length && j < usrVal.length) {
                const oCh = sysVal[i];
                const tCh = usrVal[j];

                if (WS.test(oCh) && WS.test(tCh)) {
                    GC++;
                    if (oCh !== tCh) extraSpaces++;
                    i++; j++;
                } else if (WS.test(oCh)) {
                    i++;
                } else if (WS.test(tCh)) {
                    j++;
                    extraSpaces++;
                } else {
                    GC++;
                    i++; j++;
                }
            }

            // count remaining typed chars (ignore trailing spaces)
            while (j < usrVal.length) {
                if (!WS.test(usrVal[j])) GC++;
                j++;
            }

            // Use the improved extra space calculation logic from extra-space.js
            function extraSpaceRuns(txt) {
                const runs = [];
                txt.replace(/ {2,}/g, (m, idx) => runs.push({ index: idx, length: m.length }));
                return runs;
            }

            // Calculate extra spaces using the improved logic
            const runs = extraSpaceRuns(typedText);
            let totalExtraSpaces = 0;
            
            runs.forEach(run => {
                totalExtraSpaces += run.length - 1;
            });
            
            // Also check for leading/trailing spaces
            if (typedText.startsWith(" ")) {
                totalExtraSpaces++;
            }
            
            if (typedText.endsWith(" ")) {
                totalExtraSpaces++;
            }

            return { grossChars: GC, extraSpaces: totalExtraSpaces };
        }
    
        function calculateGrossSpeed(grossCharacters, durationMinutes) {
            if (!grossCharacters || !durationMinutes || durationMinutes <= 0) return 0;
            return Math.floor(grossCharacters / (5 * durationMinutes));
        }
    
        // ------------------ ERROR CHARACTERS ------------------
        function tokenizeWithSpaces(text) {
            if (typeof text !== 'string') return [];
            // Capture spaces, words (English letters/digits + Gurmukhi), and any other single non-space char as punctuation
            const regex = /(\s+|[A-Za-z0-9\u0A00-\u0A7F]+|[^\sA-Za-z0-9\u0A00-\u0A7F])/g;
            const rawTokens = text.match(regex) || [];
            return rawTokens.map(tok => {
                if (/^\s+$/.test(tok)) return { type: 'space', value: tok };
                if (/^[A-Za-z0-9\u0A00-\u0A7F]+$/.test(tok)) return { type: 'word', value: tok };
                return { type: 'punct', value: tok };
            });
        }
    
        function computeFullMistakesByAlignment(originalTokens, typedTokens) {
            // Dynamic programming alignment (edit distance matrix)
            const m = originalTokens.length;
            const n = typedTokens.length;
            const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
            const bt = Array.from({ length: m + 1 }, () => Array(n + 1).fill(""));

            for (let i = 0; i <= m; i++) {
                dp[i][0] = i;
                bt[i][0] = "D"; // deletion
            }
            for (let j = 0; j <= n; j++) {
                dp[0][j] = j;
                bt[0][j] = "I"; // insertion
            }
            bt[0][0] = "";

            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    if (originalTokens[i - 1] === typedTokens[j - 1]) {
                        dp[i][j] = dp[i - 1][j - 1];
                        bt[i][j] = "M"; // match
                    } else {
                        const del = dp[i - 1][j] + 1;
                        const ins = dp[i][j - 1] + 1;
                        const sub = dp[i - 1][j - 1] + 1;
                        const minVal = Math.min(del, ins, sub);

                        dp[i][j] = minVal;
                        bt[i][j] = (minVal === sub) ? "S" : (minVal === del ? "D" : "I");
                    }
                }
            }

            // Backtrack to classify errors
            let i = m, j = n;
            let substitutions = 0, insertions = 0, deletions = 0;

            while (i > 0 || j > 0) {
                const action = bt[i][j];

                if (action === "M") {
                    i--; j--;
                } else if (action === "S") {
                    substitutions++;
                    i--; j--;
                } else if (action === "D") {
                    deletions++;
                    i--;
                } else if (action === "I") {
                    insertions++;
                    j--;
                }
            }

            return { substitutions, insertions, deletions, totalFullMistakes: substitutions + insertions + deletions };
        }
    
        function calculateErrorCharacters(originalText, typedText) {
            if (!originalText || typeof originalText !== 'string') return { fullMistakes: 0, halfMistakes: 0, errorCharacters: 0 };
            if (!typedText || typeof typedText !== 'string') {
                const originalNonSpace = tokenizeWithSpaces(originalText).filter(t => t.type !== 'space').map(t => t.value);
                const deletions = originalNonSpace.length;
                return { fullMistakes: deletions, halfMistakes: 0, errorCharacters: deletions * 5 };
            }
            const originalTokens = tokenizeWithSpaces(originalText).filter(t => t.type !== 'space').map(t => t.value);
            const typedTokens = tokenizeWithSpaces(typedText).filter(t => t.type !== 'space').map(t => t.value);
            const { substitutions, insertions, deletions, totalFullMistakes } = computeFullMistakesByAlignment(originalTokens, typedTokens);
            // Count spacing half-mistakes only; do not treat them as full insertions
            let doubleSpaces = (typedText.match(/ {2,}/g) || []).length; // runs of 2+ spaces
            let missingAfterPunct = (typedText.match(/([A-Za-z0-9\u0A00-\u0A7F])[,:;!\?]([A-Za-z0-9\u0A00-\u0A7F])/g) || []).length; // missing space after punctuation
            let beforePunctSpace = (typedText.match(/([A-Za-z0-9\u0A00-\u0A7F])\s+[,:;!\?]/g) || []).length; // extra space before punctuation
            const halfMistakes = extraSpaces + missingAfterPunct;
            const fullMistakes = totalFullMistakes;
            const errorCharacters = fullMistakes * 5 + halfMistakes * 2.5;
            return { fullMistakes, halfMistakes, errorCharacters, details: { substitutions, insertions, deletions, spacing: { doubleSpaces, missingAfterPunct, beforePunctSpace } } };
        }
    
        // ------------------ FINAL CALCULATION ------------------
        const gcResult = calculateGrossCharactersAndExtraSpaces(originalText, typedText);
        const grossCharacters = gcResult.grossChars;
        const extraSpaces = gcResult.extraSpaces;
        const grossSpeed = calculateGrossSpeed(grossCharacters, durationMinutes);
        const ecRes = calculateErrorCharacters(originalText, typedText);
        const netCharacters = Math.max(0, grossCharacters - (ecRes.errorCharacters || 0));
        const netSpeed = Math.max(0, Math.floor(netCharacters / (5 * durationMinutes)));
        const accuracy = grossCharacters > 0 ? Math.max(0, Math.min(100, (netCharacters / grossCharacters) * 100)) : 0;
        const WW = (ecRes.details && ecRes.details.substitutions) || 0;
        const SW = (ecRes.details && ecRes.details.deletions) || 0;
        const EW = (ecRes.details && ecRes.details.insertions) || 0;
        const SP = ecRes.halfMistakes || 0;
        const result = (grossSpeed >= 30 && accuracy >= 92) ? 'PASS' : 'FAIL';
    
        console.log("=== Typing Test Results ===");
        console.log("Original:", originalText);
        console.log("Typed   :", typedText);
        console.log("Duration:", durationMinutes, "minutes");
        console.log("testDurationMinutes:", durationMinutes);
        console.log("Gross Characters:", grossCharacters);
        console.log("Extra Spaces:", extraSpaces);
        console.log("Gross Speed (WPM):", grossSpeed);
        console.log("Error Characters:", ecRes.errorCharacters, " (Full mistakes:", ecRes.fullMistakes, ", Half mistakes:", ecRes.halfMistakes, ")");
        console.log("Details:", ecRes.details || {});
        console.log("Net Characters (GC - EC):", netCharacters);
        console.log("Net Speed (WPM):", netSpeed);
        console.log("Accuracy (%):", accuracy.toFixed(2));
        console.log("Full Mistakes:", ecRes.fullMistakes);
        console.log("Half Mistakes:", ecRes.halfMistakes);
        console.log("Wrong Words (WW):", WW);
        console.log("Skipped Words (SW):", SW);
        console.log("Extra Words (EW):", EW);
        console.log("Space Errors (SP):", SP);
        console.log("Result:", result);
    
    };