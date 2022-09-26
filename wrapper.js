"use strict";

(function() {
    const script = document.createElement("script");
    script.type = "module";
    script.src = chrome.runtime.getURL("script.js");
    document.head.appendChild(script);
})();
