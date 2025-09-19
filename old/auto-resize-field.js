function autoResizeTypedField(srcElement){
    var el = document.getElementById("176486"); // typed textarea
    if (!el) return false;
  
    // adjust once immediately
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  
    // adjust on input
    el.addEventListener("input", function () {
      this.style.height = "auto";  // reset first
      this.style.height = this.scrollHeight + "px"; // fit to content
    });
  
    return true;
  
  };