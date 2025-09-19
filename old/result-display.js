var resultEl = document.getElementById("176489");  // result field
// ---- display inside field ----
if (resultEl) {
    resultEl.value = 
        `WPM: ${grossSpeed} | GC: ${grossCharacters} | EC: ${ecRes.errorCharacters} (Full mistakes: ${ecRes.fullMistakes}, Half mistakes: ${ecRes.halfMistakes} DETAILS: ${ecRes.details})`;
}
el.style.height = "auto";             // reset first
el.style.height = el.scrollHeight + "px"; // fit to content