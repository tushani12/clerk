function countSpeedAccuracy(typeHere, Paragraph, countSpeedAccuracyHdn, durationVal, accuracyVal, grossCharsVal, grossSpeedVal, errorHitsVal, errorsVal, netCharsVal, netSpeedVal, srcElement){
    var startTime = null;
    
    $('#' + typeHere).on('input', function () {
        var typedText = $(this).val();
        var originalText = $('#' + Paragraph).val().trim();
    
        if (!originalText) {
            console.warn('Reference text is empty.');
            return;
        }
    
        // Start timer on first key press
        if (!startTime && typedText.length > 0) {
            startTime = new Date();
        }
    
        // Duration
        var durationSeconds = (new Date() - startTime) / 1000;
        var durationMinutes = durationSeconds / 60;
    
        // Gross Characters (typed length)
        var grossChars = typedText.length;
    
        // Compare char-by-char
        var errorHits = 0;
        for (var i = 0; i < typedText.length; i++) {
            if (originalText[i] !== typedText[i]) {
                errorHits++;
            }
        }
    
        // Net Characters
        var netChars = grossChars - errorHits;
    
        // Speeds using 5-char definition
        var grossSpeed = durationMinutes > 0 ? Math.round((grossChars / 5) / durationMinutes) : 0;
        var netSpeed = durationMinutes > 0 ? Math.round((netChars / 5) / durationMinutes) : 0;
    
        // Accuracy
        var accuracy = grossChars > 0 ? Math.round((netChars / grossChars) * 100) : 0;
    
        // Errors (in words = grossChars/5 minus netChars/5, rounded)
        var errors = Math.round(errorHits / 5);
    
        // Save results
        $('#' + countSpeedAccuracyHdn).val(
            'Duration: ' + durationSeconds.toFixed(2) + ' sec, ' +
            'Accuracy: ' + accuracy + '%, ' +
            'Gross Characters: ' + grossChars + ', ' +
            'Gross Speed: ' + grossSpeed + ' WPM, ' +
            'Error Hits: ' + errorHits + ', ' +
            'Errors (5-char words): ' + errors + ', ' +
            'Net Characters: ' + netChars + ', ' +
            'Net Speed: ' + netSpeed + ' WPM'
        );
    
        // Populate individual fields
        $('#175899').val(durationSeconds.toFixed(2) + ' sec'); // Duration
        $('#175903').val(accuracy + '%'); // Accuracy
        $('#175900').val(grossChars); // Gross Chars
        $('#175904').val(grossSpeed + ' WPM'); // Gross Speed
        $('#175901').val(errorHits); // Error Hits
        $('#175905').val(errors); // Errors (in words)
        $('#175902').val(netChars); // Net Chars
        $('#175906').val(netSpeed + ' WPM'); // Net Speed
    
        console.log($('#' + countSpeedAccuracyHdn).val());
    });
    
    return true;
    
    };