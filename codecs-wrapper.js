/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Muhammad Faiz <mfcc64@gmail.com>
 * Copyright (c) 2019 alextrv
 * Copyright (c) 2015 erkserkserks
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(async function(){
    // shared id in codecs-wrapper.js, codecs.js, script.js
    const element_id = "__ytms_codecs_element_id";

    let script = document.createElement("script");
    script.src = chrome.runtime.getURL("codecs.js");
    script.async = true;

    let element = document.createElement("div");
    element.style.display = "none";
    element.id = element_id;
    chrome.storage.local.get("codecs", (value) => {
        if (value["codecs"] != undefined)
            element.textContent = value["codecs"];
    });

    document.head.appendChild(script);
    document.body.appendChild(element);
})();
