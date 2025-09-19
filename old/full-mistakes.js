function compareParagraph(original, typed, testDurationMinutes = 10) {
  function tokenize(text) {
    return text.match(/[A-Za-z0-9]+|[.,!?;:]/g) || [];
  }

  const origTokens = tokenize(original);
  const typedTokens = tokenize(typed);

  // Dynamic programming alignment (edit distance matrix)
  const m = origTokens.length;
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
      if (origTokens[i - 1] === typedTokens[j - 1]) {
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
  let fullMistakes = 0, halfMistakes = 0, GC = 0;

  while (i > 0 || j > 0) {
    const action = bt[i][j];

    if (action === "M") {
      const word = origTokens[i - 1];
      const len = word.length;
      GC += len;
      if (i > 1) GC++; // count space except last
      i--; j--;
    } else if (action === "S") {
      const orig = origTokens[i - 1];
      const typedWord = typedTokens[j - 1];
      GC += Math.min(orig.length, typedWord.length);
      if (i > 1) GC++;
      fullMistakes++;
      i--; j--;
    } else if (action === "D") {
      const orig = origTokens[i - 1];
      GC += orig.length;
      if (i > 1) GC++;
      fullMistakes++;
      i--;
    } else if (action === "I") {
      fullMistakes++;
      j--;
    }
  }

  // TODO: Half mistakes: spacing/punctuation handling
  // e.g., missing space after punctuation or extra spaces in typed text.
  // (Could be added by checking original spacing separately)

  const EC = (fullMistakes * 5) + (halfMistakes * 2.5);
  const NC = GC - EC;
  const WPM = Math.floor(GC / (5 * testDurationMinutes));
  const Accuracy = (NC * 100) / GC;
  const Result = (WPM >= 30 && Accuracy >= 92) ? "PASS" : "FAIL";

  console.log("=== TYPING RESULT ===");
  console.log("Gross Characters (GC):", GC);
  console.log("Error Characters (EC):", EC);
  console.log("Net Characters (NC)  :", NC);
  console.log("Gross Speed (WPM)    :", WPM);
  console.log("Accuracy (%)         :", Accuracy.toFixed(2));
  console.log("Full Mistakes        :", fullMistakes);
  console.log("Half Mistakes        :", halfMistakes);
  console.log("Result               :", Result);
}