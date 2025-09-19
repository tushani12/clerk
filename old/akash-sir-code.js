function compareParagraph(srcElement){
    /* ========== 1. Helpers ================================================ */
    
    const WS = [9, 10, 13, 32, 160];
    function isWS(ch) { return WS.indexOf(ch.charCodeAt(0)) !== -1; }
    
    function wordsOnly(text = '') {
      const arr = [];
      let buff = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (isWS(ch)) {
          if (buff) { arr.push({ raw: buff, low: buff.toLowerCase() }); buff = ''; }
        } else buff += ch;
      }
      if (buff) arr.push({ raw: buff, low: buff.toLowerCase() });
      return arr;
    }
    
    function spaceErrors(orig = '', typed = '') {
      let o = 0, t = 0, extras = 0;
      while (o < orig.length || t < typed.length) {
        const oWS = o < orig.length && isWS(orig[o]);
        const tWS = t < typed.length && isWS(typed[t]);
        if (!oWS && tWS) { extras++; t++; continue; }
        o++; t++;
      }
      return extras;
    }
    
    function show(tok) { return tok === '' ? '·' : tok; }
    
    /* Levenshtein Distance (used for typo detection) */
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
    
    /* ========== 2. Word Matching + Merge Detection ======================== */
    
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
            const mergeTry = (sysW[i].low + (sysW[i + 1] ? sysW[i + 1].low : ''));
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
    
      while (i < sysW.length) {
        aligned.push({ word: '(none)', status: 'missing', expected: sysW[i].raw });
        i++;
      }
    
      while (j < usrW.length) {
        aligned.push({ word: usrW[j].raw, status: 'extra' });
        j++;
      }
    
      return aligned;
    }
    
    /* ========== 3. Main Compare =========================================== */
    
    function compare() {
      const sysVal = document.getElementById('176488').value;
      const usrVal = document.getElementById('176486').value;
    
      const sysW = wordsOnly(sysVal);
      const usrW = wordsOnly(usrVal);
    
      const aligned = alignWords(sysW, usrW);
      const spaceErrs = spaceErrors(sysVal, usrVal);
    
      const counts = {
        correct: 0,
        wrong: 0,
        missing: 0,
        extra: 0,
        typo: 0,
        merged: 0
      };
    
      for (const w of aligned) {
        if (counts[w.status] !== undefined) counts[w.status]++;
      }
    
      const score = Math.round((counts.correct / sysW.length) * 100);
    
      console.clear();
      console.log('=== TYPING RESULT ===');
      console.log('System words         : ' + sysW.length);
      console.log('Typed words          : ' + usrW.length);
      console.log('Correct words        : ' + counts.correct);
      console.log('Typos (1-2 char err) : ' + counts.typo);
      console.log('Merged words         : ' + counts.merged);
      console.log('Wrong words          : ' + counts.wrong);
      console.log('Missing words        : ' + counts.missing);
      console.log('Extra words          : ' + counts.extra);
      console.log('Extra spaces typed   : ' + spaceErrs);
      console.log('Typing Score         : ' + score + '%');
    
      // Colored output
      let fmt = '', css = [];
      for (const w of aligned) {
        const txt = show(w.word) + ' ';
        if (w.status === 'correct') {
          fmt += '%c' + txt;
          css.push('color:green;');
        } else if (w.status === 'wrong') {
          fmt += '%c' + txt;
          css.push('color:white;background:#e53935;');
        } else if (w.status === 'missing') {
          fmt += '%c' + w.expected + ' ';
          css.push('color:#b71c1c;background:#fff9c4;');
        } else if (w.status === 'extra') {
          fmt += '%c' + txt;
          css.push('color:#880e4f;background:#f8bbd0;');
        } else if (w.status === 'typo') {
          fmt += '%c' + txt;
          css.push('color:darkorange;background:#fff3e0;');
        } else if (w.status === 'merged') {
          fmt += '%c' + txt;
          css.push('color:navy;background:#c5cae9;');
        }
      }
    
      console.log(fmt.trim(), ...css);
    }
    return true;
    };