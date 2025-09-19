function calculateGrossSpeed(grossCharacters, durationMinutes) {
    if (!grossCharacters || !durationMinutes || durationMinutes <= 0) return 0;
    return Math.floor(grossCharacters / (5 * durationMinutes));
}