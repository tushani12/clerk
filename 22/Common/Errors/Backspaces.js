// Independent Backspace Counter
function backspaceTracker(inputId, finishBtnId) {
    let backspaceCount = 0;

    // Find the input element
    const inputEl = document.getElementById(inputId);
    if (!inputEl) {
        console.error("❌ Input field not found:", inputId);
        return;
    }

    // Count backspaces while typing
    inputEl.addEventListener("keydown", (event) => {
        if (event.key === "Backspace") {
            backspaceCount++;
            console.log("Backspaces so far:", backspaceCount);
        }
    });

    // Hook into Finish button
    const finishBtn = document.getElementById(finishBtnId);
    if (finishBtn) {
        finishBtn.addEventListener("click", () => {
            console.log("✅ Final Backspace Count:", backspaceCount);
        });
    } else {
        console.warn("⚠️ Finish button not found:", finishBtnId);
    }

    return () => backspaceCount; // helper if you ever need to fetch count manually
}

// === Usage ===
// Trigger on load
document.addEventListener("DOMContentLoaded", () => {
    backspaceTracker("176486", "176487"); 
});
