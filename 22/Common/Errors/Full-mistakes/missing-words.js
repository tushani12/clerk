// missing words= same as in asc1.js (missing words of word by word analysis)

/**
 * Missing Words Calculator
 * Extracted from asc1.js - calculates missing words in word-by-word analysis
 */

// Helper function to check if character is whitespace
function isWS(ch) {
    const WS = [9, 10, 13, 32, 160]; // tab, newline, carriage return, space, non-breaking space
    return WS.indexOf(ch.charCodeAt(0)) !== -1;
}

// Extract words from text, filtering out whitespace
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

// Align words between system and user text to identify missing words
function alignWords(sysW, usrW) {
    const aligned = [];
    let i = 0, j = 0;
    const maxSkip = 3;

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
                        expected: sysW[i].raw + ' ' + (sysW[i + 1]?.raw || '')
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

/**
 * Main function to calculate missing words
 * @param {string} originalText - The original/system text
 * @param {string} typedText - The user's typed text
 * @returns {Object} Object containing missing words count and details
 */
function calculateMissingWords(originalText, typedText) {
    if (!originalText || !typedText) {
        return {
            missingWordsCount: 0,
            missingWordsList: [],
            totalSystemWords: 0,
            totalTypedWords: 0
        };
    }

    // Extract words from both texts
    const sysW = wordsOnly(originalText);
    const usrW = wordsOnly(typedText);
    
    // Align words to identify missing ones
    const aligned = alignWords(sysW, usrW);
    
    // Count missing words and collect details
    const missingWords = aligned.filter(w => w.status === 'missing');
    const missingWordsCount = missingWords.length;
    const missingWordsList = missingWords.map(w => w.expected);
    
    return {
        missingWordsCount: missingWordsCount,
        missingWordsList: missingWordsList,
        totalSystemWords: sysW.length,
        totalTypedWords: usrW.length,
        alignedWords: aligned,
        details: {
            correct: aligned.filter(w => w.status === 'correct').length,
            wrong: aligned.filter(w => w.status === 'wrong').length,
            missing: missingWordsCount,
            extra: aligned.filter(w => w.status === 'extra').length,
            typo: aligned.filter(w => w.status === 'typo').length,
            merged: aligned.filter(w => w.status === 'merged').length
        }
    };
}

/**
 * Function to get detailed missing words analysis
 * @param {string} originalText - The original/system text
 * @param {string} typedText - The user's typed text
 * @returns {Object} Detailed analysis with word-by-word breakdown
 */
function getMissingWordsAnalysis(originalText, typedText) {
    const result = calculateMissingWords(originalText, typedText);
    
    // Add percentage calculations
    const accuracyPercentage = result.totalSystemWords > 0 
        ? ((result.totalSystemWords - result.missingWordsCount) / result.totalSystemWords * 100).toFixed(2)
        : 0;
    
    return {
        ...result,
        accuracyPercentage: parseFloat(accuracyPercentage),
        missingWordsPercentage: result.totalSystemWords > 0 
            ? (result.missingWordsCount / result.totalSystemWords * 100).toFixed(2)
            : 0
    };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateMissingWords,
        getMissingWordsAnalysis,
        alignWords,
        wordsOnly,
        levenshtein,
        isWS
    };
}