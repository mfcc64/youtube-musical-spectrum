"use strict";

(function() {
    function run_script() {
        const script = document.createElement("script");
        script.type = "module";
        script.src = chrome.runtime.getURL("script.js");
        document.head.appendChild(script);
    }

    const prefix = "__youtube_musical_spectrum_opt_";
    const opts = ["height", "bar", "waterfall", "brightness", "bass", "speed", "interval", "codecs", "transparent", "visible"];
    chrome.storage.local.get(opts, (items) => {
        items = items ? items : {};
        for (const name in items) {
            if (!localStorage.getItem(prefix + name)) {
                try {
                    localStorage.setItem(prefix + name, Math.round(items[name]));
                } catch(e) { console.warn(e); }
            }
        }
        chrome.storage.local.clear(() => run_script());
    });
})();
