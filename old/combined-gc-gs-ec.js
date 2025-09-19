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
    
        // ------------------ GROSS CHARACTERS ------------------
        function calculateGrossCharacters(originalText, typedText) {
            if (!originalText || !typedText) return 0;
            const normalizedOriginal = originalText.trim().replace(/s+/g, ' ');
            const normalizedTyped = typedText.trim().replace(/s+/g, ' ');
            const originalWords = normalizedOriginal.split(' ');
            const typedWords = normalizedTyped.split(' ');
            let grossCharacters = 0;
            for (let i = 0; i < typedWords.length; i++) {
                const typedWord = typedWords[i];
                const originalWord = originalWords[i] || '';
                let wordCharCount = typedWord.length;
                if (originalWord && wordCharCount > originalWord.length) {
                    wordCharCount = originalWord.length;
                }
                grossCharacters += wordCharCount;
            }
            grossCharacters += (typedWords.length - 1); // spaces
            return grossCharacters;
        }
    
        function calculateGrossSpeed(grossCharacters, durationMinutes) {
            if (!grossCharacters || !durationMinutes || durationMinutes <= 0) return 0;
            return Math.floor(grossCharacters / (5 * durationMinutes));
        }
    
        // ------------------ ERROR CHARACTERS ------------------
        function tokenizeWithSpaces(text) {
            if (typeof text !== 'string') return [];
            const regex = /(s+|[A-Za-z0-9u0A00-u0A7F]+|[^sA-Za-z0-9u0A00-u0A7F])/g;
            const rawTokens = text.match(regex) || [];
            return rawTokens.map(tok => {
                if (/^s+$/.test(tok)) return { type: 'space', value: tok };
                if (/^[A-Za-z0-9u0A00-u0A7F]+$/.test(tok)) return { type: 'word', value: tok };
                return { type: 'punct', value: tok };
            });
        }
    
        function computeFullMistakesByAlignment(originalTokens, typedTokens) {
            const m = originalTokens.length, n = typedTokens.length;
            const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
            for (let i = 0; i <= m; i++) dp[i][0] = i;
            for (let j = 0; j <= n; j++) dp[0][j] = j;
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    const cost = originalTokens[i - 1] === typedTokens[j - 1] ? 0 : 1;
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1,
                        dp[i - 1][j - 1] + cost
                    );
                }
            }
            let i = m, j = n;
            let substitutions = 0, insertions = 0, deletions = 0;
            while (i > 0 || j > 0) {
                if (i > 0 && j > 0) {
                    const cost = originalTokens[i - 1] === typedTokens[j - 1] ? 0 : 1;
                    if (dp[i][j] === dp[i - 1][j - 1] + cost) {
                        if (cost === 1) substitutions++;
                        i--; j--;
                        continue;
                    }
                }
                if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
                    deletions++; i--; continue;
                }
                insertions++; j--;
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
            let doubleSpaces = (typedText.match(/ {2,}/g) || []).length;
            let missingAfterPunct = (typedText.match(/([A-Za-z0-9u0A00-u0A7F])[,:;!?]([A-Za-z0-9u0A00-u0A7F])/g) || []).length;
            let beforePunctSpace = (typedText.match(/([A-Za-z0-9u0A00-u0A7F])s+[,:;!?]/g) || []).length;
            const halfMistakes = doubleSpaces + missingAfterPunct + beforePunctSpace;
            const fullMistakes = totalFullMistakes;
            const errorCharacters = fullMistakes * 5 + halfMistakes * 2.5;
            return { fullMistakes, halfMistakes, errorCharacters, details: { substitutions, insertions, deletions, spacing: { doubleSpaces, missingAfterPunct, beforePunctSpace } } };
        }
    
        // ------------------ FINAL CALCULATION ------------------
        const grossCharacters = calculateGrossCharacters(originalText, typedText);
        const grossSpeed = calculateGrossSpeed(grossCharacters, durationMinutes);
        const ecRes = calculateErrorCharacters(originalText, typedText);
    
        console.log("=== Typing Test Results ===");
        console.log("Original:", originalText);
        console.log("Typed   :", typedText);
        console.log("Duration:", durationMinutes, "minutes");
        console.log("Gross Characters:", grossCharacters);
        console.log("Gross Speed (WPM):", grossSpeed);
        console.log("Error Characters:", ecRes.errorCharacters, " (Full mistakes:", ecRes.fullMistakes, ", Half mistakes:", ecRes.halfMistakes, ")");
        console.log("Details:", ecRes.details || {});
    
    };