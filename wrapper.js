
// Here, the scripts are injected as page scripts because Firefox can't run them correctly as content scripts.

let runtime_getURL = (path) => chrome.runtime.getURL(path);
let storage_local_get = (param, callback) => chrome.storage.local.get(JSON.parse(param), (result) => callback(JSON.stringify(result)));
let storage_local_set = (param, callback) => chrome.storage.local.set(JSON.parse(param), () => callback());
let storage_local_clear = (callback) => chrome.storage.local.clear(() => callback());

exportFunction(runtime_getURL, window, {defineAs: "__ytms_wrapper_runtime_getURL"});
exportFunction(storage_local_get, window, {defineAs: "__ytms_wrapper_storage_local_get"});
exportFunction(storage_local_set, window, {defineAs: "__ytms_wrapper_storage_local_set"});
exportFunction(storage_local_clear, window, {defineAs: "__ytms_wrapper_storage_local_clear"});

(async function(){
    var script = document.createElement("script");
    script.textContent = "(function(){\n" +
        await (await fetch(chrome.runtime.getURL("showcqt.js"))).text() + "\n" +
        await (await fetch(chrome.runtime.getURL("script.js"))).text() + "\n})();"
    // wait until document.head is available
    if (!document.head) {
        await new Promise(function(resolve) {
            var observer = new MutationObserver(function() {
                if (document.head) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        });
    }
    document.head.appendChild(script);
})();
