"use strict";

(function() {
    const script = document.createElement("script");
    script.type = "module";
    script.src = chrome.runtime.getURL("modules/@mfcc64/ytms/script.mjs");
    document.head.appendChild(script);
})();
