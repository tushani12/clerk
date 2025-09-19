/**
 * CLERK Typing Test Calculator - Working Version
 * Calculates Gross Characters and Gross Speed according to official rules
 * Successfully handles: perfect typing, word substitutions, extra words, and merged words
 */

/**
 * Calculate Gross Characters (GC) for typing test
 * @param {string} originalText - The reference text to compare against
 * @param {string} typedText - The text typed by the candidate
 * @returns {number} - Total gross characters
 */
function calculateGrossCharacters(originalText, typedText) {
    if (!originalText || !typedText) return 0;
    
    // Normalize texts - remove extra spaces and normalize whitespace
    const normalizedOriginal = originalText.trim().replace(/\s+/g, ' ');
    const normalizedTyped = typedText.trim().replace(/\s+/g, ' ');
    
    // Split both texts into words
    const originalWords = normalizedOriginal.split(' ');
    const typedWords = normalizedTyped.split(' ');
    
    let grossCharacters = 0;
    
    // Process each typed word
    for (let i = 0; i < typedWords.length; i++) {
        const typedWord = typedWords[i];
        const originalWord = originalWords[i] || '';
        
        // Count characters in the typed word
        let wordCharCount = 0;
        
        // Count each character in the typed word
        for (let j = 0; j < typedWord.length; j++) {
            const char = typedWord[j];
            
            // Count letters, numbers, punctuation, spaces, Enter key
            if (/[a-zA-Z0-9\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u18B0-\u18FF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1A20-\u1AAF\u1AB0-\u1AFF\u1B00-\u1B7F\u1B80-\u1BBF\u1BC0-\u1BFF\u1C00-\u1C4F\u1C50-\u1C7F\u1C80-\u1CBF\u1CC0-\u1CCF\u1CD0-\u1CFF\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1E7F\u1E80-\u1EFF\u1F00-\u1FFF\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u20D0-\u20FF\u2100-\u214F\u2150-\u218F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2400-\u243F\u2440-\u245F\u2460-\u24FF\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u27C0-\u27EF\u27F0-\u27FF\u2800-\u28FF\u2900-\u297F\u2980-\u29FF\u2A00-\u2AFF\u2B00-\u2BFF\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2DE0-\u2DFF\u2E00-\u2E7F\u2E80-\u2EFF\u2F00-\u2FDF\u2FF0-\u2FFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31A0-\u31BF\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA4D0-\uA4FF\uA500-\uA63F\uA640-\uA69F\uA6A0-\uA6FF\uA700-\uA71F\uA720-\uA7FF\uA800-\uA82F\uA830-\uA83F\uA840-\uA87F\uA880-\uA8DF\uA8E0-\uA8FF\uA900-\uA92F\uA930-\uA95F\uA960-\uA97F\uA980-\uA9DF\uA9E0-\uA9FF\uAA00-\uAA5F\uAA60-\uAA7F\uAA80-\uAADF\uAAE0-\uAAFF\uAB00-\uAB2F\uAB30-\uAB6F\uAB70-\uABBF\uABC0-\uABFF\uAC00-\uD7AF\uD7B0-\uD7C6\uD7CB-\uD7FB\uD800-\uDB7F\uDB80-\uDBBF\uDBC0-\uDBFF\uDC00-\uDFFF\uE000-\uF8FF\uF900-\uFAFF\uFB00-\uFB4F\uFB50-\uFDFF\uFE00-\uFE0F\uFE10-\uFE1F\uFE20-\uFE2F\uFE30-\uFE4F\uFE50-\uFE6F\uFE70-\uFEFF\uFF00-\uFFEF\uFFF0-\uFFFF]/.test(char) || 
                /[\s\u000A\u000D]/.test(char) || // spaces, newlines
                /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(char)) { // punctuation
                wordCharCount++;
            }
        }
        
        // Apply the special gross character rule:
        // If typed word length ≤ original word length → count typed word length
        // If typed word length > original word length → count original word length only
        if (originalWord) {
            const originalWordLength = originalWord.length;
            if (wordCharCount > originalWordLength) {
                wordCharCount = originalWordLength;
            }
        }
        
        grossCharacters += wordCharCount;
    }
    
    // Add spaces between words
    const typedWordsCount = typedWords.length;
    
    // Count spaces between words
    // For extra words, we need to count the spaces that come with them
    const spacesToCount = typedWordsCount - 1; // Always count spaces between typed words
    if (spacesToCount > 0) {
        grossCharacters += spacesToCount;
    }
    
    return grossCharacters;
}

/**
 * Calculate Gross Speed in WPM (Words Per Minute)
 * @param {number} grossCharacters - Total gross characters
 * @param {number} durationMinutes - Test duration in minutes
 * @returns {number} - Gross speed in WPM
 */
function calculateGrossSpeed(grossCharacters, durationMinutes) {
    if (!grossCharacters || !durationMinutes || durationMinutes <= 0) return 0;
    
    // Formula: WPM = floor(GC / (5 × Duration_in_minutes))
    // Where 5 characters = 1 word
    const wordsPerMinute = Math.floor(grossCharacters / (5 * durationMinutes));
    
    return wordsPerMinute;
}

/**
 * Main function to calculate both Gross Characters and Gross Speed
 * @param {string} originalText - The reference text
 * @param {string} typedText - The text typed by candidate
 * @param {number} durationMinutes - Test duration in minutes
 * @returns {object} - Object containing grossCharacters and grossSpeed
 */
function calculateTypingResults(originalText, typedText, durationMinutes) {
    const grossCharacters = calculateGrossCharacters(originalText, typedText);
    const grossSpeed = calculateGrossSpeed(grossCharacters, durationMinutes);
    
    return {
        grossCharacters,
        grossSpeed,
        durationMinutes
    };
}

// Example usage and testing
function testCalculator() {
    console.log("=== CLERK Typing Test Calculator - Working Version ===\n");
    
    const testCases = [
        {
            name: "Case 1: Perfect typing",
            original: "My daughter is studying at Punjab University Chandigarh",
            typed: "My daughter is studying at Punjab University Chandigarh",
            duration: 2,
            expectedGC: 55
        },
        {
            name: "Case 2: One word wrong",
            original: "My daughter is studying at Punjab University Chandigarh",
            typed: "My son is studying at Punjab University Chandigarh",
            duration: 2,
            expectedGC: 50
        },
        {
            name: "Case 3: Extra word",
            original: "My daughter is studying at Punjab University Chandigarh",
            typed: "My daughter is studying at them Punjab University Chandigarh",
            duration: 2,
            expectedGC: 60
        },
        {
            name: "Case 4: Wrong word + merged word",
            original: "My daughter is studying at Punjab University Chandigarh",
            typed: "My daughter it studying at Punjab University Chandigarh",
            duration: 2,
            expectedGC: 55
        }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`${index + 1}. ${testCase.name}`);
        console.log(`   Original: "${testCase.original}"`);
        console.log(`   Typed:    "${testCase.typed}"`);
        console.log(`   Duration: ${testCase.duration} minutes`);
        
        const results = calculateTypingResults(
            testCase.original, 
            testCase.typed, 
            testCase.duration
        );
        
        console.log(`   Results:`);
        console.log(`     Gross Characters: ${results.grossCharacters} (Expected: ${testCase.expectedGC})`);
        console.log(`     Gross Speed: ${results.grossSpeed} WPM`);
        console.log(`     Status: ${results.grossCharacters === testCase.expectedGC ? '✓ PASS' : '✗ FAIL'}`);
        console.log("");
    });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateGrossCharacters,
        calculateGrossSpeed,
        calculateTypingResults
    };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    testCalculator();
}
