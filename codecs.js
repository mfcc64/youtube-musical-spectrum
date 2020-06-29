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

(function(){
    function inject() {
        var rejected = [ "av01" ];
        function override(obj, func_name, false_ret) {
            var old_func = obj[func_name];
            obj[func_name] = function(mime_type) {
                switch (mime_type) {
                    case "__ytms_codecs=0": rejected = []; break;
                    case "__ytms_codecs=1": rejected = [ "av01" ]; break;
                    case "__ytms_codecs=2": rejected = [ "av01", "vp09", "vp9", "vp08", "vp8" ]; break;
                }

                for (var type of rejected) {
                    if (String(mime_type).indexOf(type) != -1)
                        return false_ret;
                }

                return old_func.call(this, mime_type);
            };
        }

        override(Object.getPrototypeOf(document.createElement("video")), "canPlayType", "");
        override(MediaSource, "isTypeSupported", false);
    }

    function inject_script(inject_str) {
        var script = document.createElement("script");
        script.textContent = "(function(){\n" + inject_str + "\n})();";
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }

    inject_script(inject.toString() + "\n inject();");
    chrome.storage.local.get("codecs", function(v) {
        if (v.codecs !== undefined)
            inject_script('MediaSource.isTypeSupported("__ytms_codecs=' + v.codecs + '");');
    });
})();
