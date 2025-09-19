/**
 * Tokenize text into an array of tokens while preserving spaces.
 * Token types: 'word' (letters/numbers incl. Punjabi), 'punct' (punctuation), 'space' (one or more spaces/tabs/newlines)
 * @param {string} text
 * @returns {{type: 'word'|'punct'|'space', value: string}[]}
 */
function tokenizeWithSpaces(text) {
    if (typeof text !== 'string') return [];
    // Words: English letters/digits and Punjabi (Gurmukhi) block
    // Punctuation: any single non-space char that is not captured by word class
    const regex = /(\s+|[A-Za-z0-9\u0A00-\u0A7F]+|[^\sA-Za-z0-9\u0A00-\u0A7F])/g;
    const rawTokens = text.match(regex) || [];
    return rawTokens.map(tok => {
        if (/^\s+$/.test(tok)) return { type: 'space', value: tok };
        if (/^[A-Za-z0-9\u0A00-\u0A7F]+$/.test(tok)) return { type: 'word', value: tok };
        return { type: 'punct', value: tok };
    });
}

/**
 * Compute alignment-based full mistakes between two token arrays (non-space tokens only)
 * Counts substitutions, insertions (additions), deletions (omissions). Punctuation tokens are treated the same as words.
 * @param {string[]} originalTokens - non-space tokens from original
 * @param {string[]} typedTokens - non-space tokens from typed
 * @returns {{substitutions: number, insertions: number, deletions: number, totalFullMistakes: number}}
 */
function computeFullMistakesByAlignment(originalTokens, typedTokens) {
    const m = originalTokens.length;
    const n = typedTokens.length;
    // Initialize DP table
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i; // deletions
    for (let j = 0; j <= n; j++) dp[0][j] = j; // insertions
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = originalTokens[i - 1] === typedTokens[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,       // deletion
                dp[i][j - 1] + 1,       // insertion
                dp[i - 1][j - 1] + cost // substitution or match
            );
        }
    }
    // Backtrace to count operations
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
        // else insertion
        insertions++; j--;
    }
    return { substitutions, insertions, deletions, totalFullMistakes: substitutions + insertions + deletions };
}

/**
 * Calculate Error Characters (EC) based on full and half mistakes.
 * Full mistakes (−5): wrong/substituted token, omission (deleted), addition (inserted), punctuation error.
 * Half mistakes (−2.5): spacing errors (double spaces, missing/extra spaces around punctuation).
 * This function operates independently from GC.
 * @param {string} originalText
 * @param {string} typedText
 * @returns {{fullMistakes: number, halfMistakes: number, errorCharacters: number, details: {substitutions:number, insertions:number, deletions:number, spacing:{doubleSpaces:number, missingAfterPunct:number, beforePunctSpace:number}}}}
 */
function calculateErrorCharacters(originalText, typedText) {
    if (!originalText || typeof originalText !== 'string') return { fullMistakes: 0, halfMistakes: 0, errorCharacters: 0, details: { substitutions: 0, insertions: 0, deletions: 0, spacing: { doubleSpaces: 0, missingAfterPunct: 0, beforePunctSpace: 0 } } };
    if (!typedText || typeof typedText !== 'string') {
        // If nothing typed, all original tokens are omissions (full mistakes)
        const originalNonSpace = tokenizeWithSpaces(originalText).filter(t => t.type !== 'space').map(t => t.value);
        const deletions = originalNonSpace.length;
        const fullMistakes = deletions;
        const halfMistakes = 0;
        return {
            fullMistakes,
            halfMistakes,
            errorCharacters: fullMistakes * 5 + halfMistakes * 2.5,
            details: { substitutions: 0, insertions: 0, deletions, spacing: { doubleSpaces: 0, missingAfterPunct: 0, beforePunctSpace: 0 } }
        };
    }

    // Tokenize and remove spaces for alignment-based full mistake counting
    const originalTokens = tokenizeWithSpaces(originalText).filter(t => t.type !== 'space').map(t => t.value);
    const typedTokens = tokenizeWithSpaces(typedText).filter(t => t.type !== 'space').map(t => t.value);
    const { substitutions, insertions, deletions, totalFullMistakes } = computeFullMistakesByAlignment(originalTokens, typedTokens);

    // Spacing errors (half mistakes)
    let doubleSpaces = 0, missingAfterPunct = 0, beforePunctSpace = 0;
    // Count runs of 2+ spaces (treat each run as one half mistake)
    const dsMatches = typedText.match(/ {2,}/g);
    if (dsMatches) doubleSpaces = dsMatches.length;
    // Missing space after common punctuation between words, e.g., ",word"
    const punctAfterPattern = /([A-Za-z0-9\u0A00-\u0A7F])[,:;!\?]([A-Za-z0-9\u0A00-\u0A7F])/g;
    const maMatches = typedText.match(punctAfterPattern);
    if (maMatches) missingAfterPunct = maMatches.length;
    // Extra space before punctuation, e.g., "word ,"
    const beforePunctPattern = /([A-Za-z0-9\u0A00-\u0A7F])\s+[,:;!\?]/g;
    const bpMatches = typedText.match(beforePunctPattern);
    if (bpMatches) beforePunctSpace = bpMatches.length;

    const halfMistakes = doubleSpaces + missingAfterPunct + beforePunctSpace;
    const fullMistakes = totalFullMistakes;
    const errorCharacters = fullMistakes * 5 + halfMistakes * 2.5;

    return {
        fullMistakes,
        halfMistakes,
        errorCharacters,
        details: {
            substitutions,
            insertions,
            deletions,
            spacing: { doubleSpaces, missingAfterPunct, beforePunctSpace }
        }
    };
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateErrorCharacters
    };
}

if (typeof window === 'undefined') {
    // Error Characters quick test using worked example
    const originalEC = "My daughter is studying at Punjab University, Chandigarh.";
    const typedEC = "My daughter iss studying at Punjab University, Chandigarh.";
    const ecRes = calculateErrorCharacters(originalEC, typedEC);
    console.log("\nEC Worked Example:");
    console.log(`  Full mistakes: ${ecRes.fullMistakes} (Expected: 5)`);
    console.log(`  Half mistakes: ${ecRes.halfMistakes} (Expected: 2)`);
    console.log(`  Error Characters: ${ecRes.errorCharacters} (Expected: 30)`);
}