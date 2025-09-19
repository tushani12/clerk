function setEnglishParagraph(srcElement){
    var el = document.getElementById("176488"); // English textarea
    if (!el) {
      console.warn("Field 176488 not found");
      return false;
    }
  
    // Fixed 30-word paragraph
    var paragraph = "My daughter is studying at Punjab University Chandigarh";
    
    el.value = paragraph;
  
    // Make it readonly
    el.readOnly = true;
  
    // Reset height, then adjust based on scrollHeight
    el.style.height = "auto";             // reset first
    el.style.height = el.scrollHeight + "px"; // fit to content
  
    // Optional width tweak
    el.style.width = "95%";
  
    // Optional: prevent user resize
    el.style.resize = "none";
  
    return true;
  
  };
  