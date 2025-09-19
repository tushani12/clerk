// Gross Characters Calculator
// This function calculates the gross character count and extra spaces between system and user values

// Whitespace regex pattern
const WS = /\s/;

/**
 * Calculate gross characters and extra spaces between system and user values
 * @param {string} sysVal - The system/original value
 * @param {string} usrVal - The user/typed value
 * @returns {Object} Object containing gross characters count and extra spaces count
 */
function calculateGrossChars(sysVal, usrVal) {
  let GC = 0;
  let extraSpaces = 0;

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

  return { grossChars: GC, extraSpaces: extraSpaces };
}

// Test cases
function testGrossCharsCalculation() {
  console.log("=== Testing Gross Characters Calculation ===\n");

  const testCases = [
    {
      name: "Perfect match",
      sysVal: "Hello world",
      usrVal: "Hello world",
      expected: { grossChars: 11, extraSpaces: 0 }
    },
    {
      name: "Extra spaces in user input",
      sysVal: "Hello world",
      usrVal: "Hello  world",
      expected: { grossChars: 12, extraSpaces: 1 }
    },
    {
      name: "Different space characters",
      sysVal: "Hello world",
      usrVal: "Hello\tworld",
      expected: { grossChars: 11, extraSpaces: 1 }
    },
    {
      name: "User skips system spaces",
      sysVal: "Hello world",
      usrVal: "blah blahblah",
      expected: { grossChars: 10, extraSpaces: 0 }
    },
    {
      name: "User adds extra characters",
      sysVal: "The quick brown fox jumps over the lazy dog, while seven curious cats watch silently from the garden wall, waiting for their turn to chase something interesting today.",
      usrVal: "The quick brown fox jumps over the lazy dog, while seven curious cats watch silently from the garden wall, waiting for their turn to chase something interesting today.",
      expected: { grossChars: 10, extraSpaces: 0 }
    },
    {
      name: "Complex case with mixed spaces",
      sysVal: "  Hello   world  ",
      usrVal: " Hello world ",
      expected: { grossChars: 13, extraSpaces: 2 }
    }
  ];

  testCases.forEach((testCase, index) => {
    const result = calculateGrossChars(testCase.sysVal, testCase.usrVal);
    const passed = result.grossChars === testCase.expected.grossChars && 
                   result.extraSpaces === testCase.expected.extraSpaces;
    
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`System: "${testCase.sysVal}"`);
    console.log(`User:   "${testCase.usrVal}"`);
    console.log(`Expected: GC=${testCase.expected.grossChars}, ES=${testCase.expected.extraSpaces}`);
    console.log(`Result:   GC=${result.grossChars}, ES=${result.extraSpaces}`);
    console.log(`Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('---');
  });
}

// Interactive testing function
function interactiveTest() {
  console.log("=== Interactive Gross Characters Testing ===");
  console.log("Enter system value and user value to test the calculation.");
  console.log("Type 'quit' to exit.\n");
  
  // For demonstration, you can modify these values to test different scenarios
  const demoSysVal = "Hello world";
  const demoUsrVal = "Hello  world";
  
  console.log(`Demo test:`);
  console.log(`System: "${demoSysVal}"`);
  console.log(`User:   "${demoUsrVal}"`);
  
  const result = calculateGrossChars(demoSysVal, demoUsrVal);
  console.log(`Result: GC=${result.grossChars}, ES=${result.extraSpaces}\n`);
  
  // You can add more interactive testing here if needed
}

// Export the function for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateGrossChars, WS };
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  testGrossCharsCalculation();
  console.log('\n');
  interactiveTest();
}
