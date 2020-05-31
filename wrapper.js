
// Here, the scripts are injected as page scripts because Firefox can't run them correctly as content scripts.

let runtime_getURL = (path) => chrome.runtime.getURL(path);
let storage_local_get = (param, callback) => chrome.storage.local.get(JSON.parse(param), (result) => callback(JSON.stringify(result)));
let storage_local_set = (param, callback) => chrome.storage.local.set(JSON.parse(param), () => callback());
let storage_local_clear = (callback) => chrome.storage.local.clear(() => callback());

exportFunction(runtime_getURL, window, {defineAs: "__ytms_wrapper_runtime_getURL"});
exportFunction(storage_local_get, window, {defineAs: "__ytms_wrapper_storage_local_get"});
exportFunction(storage_local_set, window, {defineAs: "__ytms_wrapper_storage_local_set"});
exportFunction(storage_local_clear, window, {defineAs: "__ytms_wrapper_storage_local_clear"});

let inject_script = function(src) {
    var script = document.createElement("script");
    script.src = chrome.runtime.getURL(src);
    script.async = false;
    document.head.appendChild(script);
}

inject_script("showcqt.js");
inject_script("script.js");
