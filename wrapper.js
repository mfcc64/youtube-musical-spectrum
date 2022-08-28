
const script = document.createElement("script");
script.src = chrome.runtime.getURL("script.js");
document.head.appendChild(script);
