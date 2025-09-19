const gurmukhiMap = {
    'q': 'ੌ', 'w': 'ੈ', 'e': 'ਾ', 'r': 'ੀ', 't': 'ੂ',
    'y': 'ਬ', 'u': 'ਹ', 'i': 'ਗ', 'o': 'ਦ', 'p': 'ਜ',
    '[': 'ਡ', ']': '਼', 'a': 'ੋ', 's': 'ੇ', 'd': '੍',
    'f': 'ਿ', 'g': 'ੁ', 'h': 'ਪ', 'j': 'ਰ', 'k': 'ਕ',
    'l': 'ਤ', ';': 'ਚ', "'": 'ਟ', 'x': 'ੰ', 'c': 'ਮ',
    'v': 'ਨ', 'b': 'ਵ', 'n': 'ਲ', 'm': 'ਸ', '/': 'ਯ',
    'Q': 'ਔ', 'W': 'ਐ', 'E': 'ਆ', 'R': 'ਈ', 'T': 'ਊ',
    'Y': 'ਭ', 'U': 'ਙ', 'I': 'ਘ', 'O': 'ਧ', 'P': 'ਝ',
    '{': 'ਢ', '}': 'ਞ', '~': '੍ਹ', 'A': 'ਓ', 'S': 'ਏ',
    'D': 'ਅ', 'F': 'ਇ', 'G': 'ਉ', 'H': 'ਫ', 'J': 'ੜ',
    'K': 'ਖ', 'L': 'ਥ', ':': 'ਛ', '"': 'ਠ', 'X': 'ਂ',
    'C': 'ਣ', 'B': 'ੲ', 'N': 'ਲ਼', 'M': 'ਸ਼', '!': '੍ਵ',
    '@': '੍ਯ', '#': '੍ਰ', '$': 'ੱ', '>': '।'
  };
  
  const gurmukhiNumbers = {
    '1': '੧', '2': '੨', '3': '੩', '4': '੪', '5': '੫',
    '6': '੬', '7': '੭', '8': '੮', '9': '੯', '0': '੦'
  };
  
  const gurmukhiCtrlAltMap = {
    'p': 'ਜ਼',
    'ī': 'ਗ਼',
    '[': 'ੜ',
    'ḥ': 'ਫ਼',
    'k': 'ਖ਼',
    'b': 'ੳ'
  };
  
  const altGrMap = {
    ".": "॥",
    "b": "ੳ"
  };
  
  function removeMacronAndDiacritics(str) {
    if (!str) return str;
    const map = { 'ā':'a','Ā':'A','ē':'e','Ē':'E','ī':'i','Ī':'I','ō':'o','Ō':'O','ū':'u','Ū':'U','¯':'' };
    str = str.replace(/[āĀēĒīĪōŌūŪ¯]/g, m => map[m] || '');
    str = str.normalize && str.normalize('NFD').replace(/\u0304/g, '').normalize('NFC');
    return str;
  }
  
  function insertAtCursor(el, char) {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    el.value = text.slice(0, start) + char + text.slice(end);
    el.setSelectionRange(start + char.length, start + char.length);
  }
  
  $(function () {
    const $input = $('#176486'); // your textarea id
    let justInsertedAltGr = false;
  
    $input.on('keydown', function (e) {
      const el = this;
      const key = e.key;
      const keyLower = key.toLowerCase();
      const domEvent = e.originalEvent || e;
      const isAltGr = (domEvent.ctrlKey && domEvent.altKey) || domEvent.getModifierState("AltGraph");
  
      // Ctrl+Alt or AltGr + 4 → ੪
      if ((domEvent.ctrlKey && domEvent.altKey) || isAltGr) {
          if (key === '4' || e.code === 'Digit4') {
              e.preventDefault();
              insertAtCursor(el, '੪');
              return;
          }
          // Ctrl+Alt+Shift + X → ੴ
          if ((e.shiftKey && (keyLower === 'x' || e.code === 'KeyX'))) {
              e.preventDefault();
              insertAtCursor(el, 'ੴ');
              return;
          }
      }
  
      // ❌ Block Ctrl+Alt + "-" (minus)
      if ((domEvent.ctrlKey && domEvent.altKey) || isAltGr) {
        if (key === '-' || e.code === 'Minus') {
          e.preventDefault();
          e.stopPropagation();   // to top OS/IME from handling it
          return false;          // double-safety
        }
      }
      
  
      // 1️⃣ Handle custom AltGr shortcuts (AltGr + . or B)
      if (isAltGr && altGrMap[keyLower]) {
        e.preventDefault();
        justInsertedAltGr = true;
        insertAtCursor(el, altGrMap[keyLower]);
        return;
      }
  
      // Block stray "." or "b" after AltGr insert
      if (justInsertedAltGr && (key === "." || keyLower === "b")) {
        e.preventDefault();
        justInsertedAltGr = false;
        return;
      } else {
        justInsertedAltGr = false;
      }
  
      // 2️⃣ Handle Caps Lock
      if (key === key.toUpperCase() && /^[a-zA-Z]$/.test(key) && !e.shiftKey) {
        e.preventDefault();
        alert('Caps Lock is ON. Please turn it off to continue typing.');
        return;
      }
  
      // 3️⃣ Allowed keys (navigation, backspace, etc.)
      const allowedKeys = new Set(['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter']);
      if (allowedKeys.has(key)) return;
  
      // 4️⃣ Block unwanted keys
      const blockedKeys = new Set(['z', 'Z', '?', 'V', '<', '+', '=']);
      if (blockedKeys.has(key)) {
        e.preventDefault();
        return;
      }
  
      // 5️⃣ Ctrl+Alt (AltGr) maps
      if (isAltGr && gurmukhiNumbers[key]) {
        e.preventDefault();
        insertAtCursor(el, gurmukhiNumbers[key]);
        return;
      }
  
      if (isAltGr && gurmukhiCtrlAltMap[keyLower]) {
        e.preventDefault();
        insertAtCursor(el, gurmukhiCtrlAltMap[keyLower]);
        return;
      }
  
      // 6️⃣ Gurmukhi map for normal keys
      if (gurmukhiMap[key]) {
        e.preventDefault();
        insertAtCursor(el, gurmukhiMap[key]);
      }
    });
  
    // Fix Ctrl+Alt key glitches
    $input.on('input', function () {
      const el = this;
      const val = el.value;
      const lastChar = val.slice(-1);
      const fixMap = {
        'ī': 'ਗ਼',
        'ḥ': 'ਫ਼'
      };
      if (fixMap[lastChar]) {
        el.value = val.slice(0, -1) + fixMap[lastChar];
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  });
  return true;