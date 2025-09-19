function extraSpaceRuns(txt) {
    const runs = [];
    txt.replace(/ {2,}/g, (m, idx) => runs.push({ index: idx, length: m.length }));
    return runs;
  }
  
  // Usage example:
  function countExtraSpaces(text) {
    const runs = extraSpaceRuns(text);
    let totalExtraSpaces = 0;
    
    runs.forEach(run => {
      totalExtraSpaces += run.length - 1;
      console.log(`Extra spaces (${run.length - 1}) at position ${run.index}`);
    });
    
    // Also check for leading/trailing spaces
    if (text.startsWith(" ")) {
      totalExtraSpaces++;
      console.log("Leading space at beginning");
    }
    
    if (text.endsWith(" ")) {
      totalExtraSpaces++;
      console.log("Trailing space at end");
    }
    
    return totalExtraSpaces;
  }

// const text = "Hello   world!  This has   extra spaces. ";
// const extraCount = countExtraSpaces(text);
// console.log(`Total extra spaces: ${extraCount}`);

// Extra spaces (2) at position 5
// Extra spaces (1) at position 19
// Extra spaces (2) at position 30
// Trailing space at end
// Total extra spaces: 6