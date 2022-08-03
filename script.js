
(async function(){
    // Here, the scripts are injected as page scripts because Firefox can't run them correctly as content scripts.
    var chrome = {
        runtime: {
            getURL: __ytms_wrapper_runtime_getURL
        },
        storage: {
            local: {
                get: (param, callback) =>
                     __ytms_wrapper_storage_local_get(JSON.stringify(param), (result) => callback(JSON.parse(result))),
                set: (param, callback) =>
                     __ytms_wrapper_storage_local_set(JSON.stringify(param), callback),
                clear: __ytms_wrapper_storage_local_clear
            }
        }
    };

    var width = 0, height = 0, bar_h = 0, axis_h = 0, sono_h = 0;
    var canvas = null, canvas_ctx = null, axis = null, cqt = null, blocker = null, af_links = null, alpha_table = null;
    var audio_ctx = new window.AudioContext();
    function resume_audio_ctx() {
        if (audio_ctx.state === "suspended") {
            audio_ctx.resume();
            window.setTimeout(resume_audio_ctx, 100);
        }
    }
    resume_audio_ctx();
    var cqt = await ShowCQT.instantiate();
    var videos = document.getElementsByTagName("video");
    var copied_videos = [];
    var img_buffer = null;
    var analyser_l = audio_ctx.createAnalyser();
    var analyser_r = audio_ctx.createAnalyser();
    var splitter = audio_ctx.createChannelSplitter(2);
    var panner = audio_ctx.createStereoPanner();
    var iir = audio_ctx.createBiquadFilter();
    iir.type = "peaking";
    iir.frequency.value = 10;
    iir.Q.value = 0.33;
    panner.connect(iir);
    iir.connect(splitter);
    splitter.connect(analyser_l, 0);
    splitter.connect(analyser_r, 1);
    panner.connect(audio_ctx.destination);

    var options = {};
    function load_default_options() {
        options.height = 33;
        options.bar = 17;
        options.waterfall = 33;
        options.brightness = 17;
        options.bass = -30;
        options.speed = 2;
        options.interval = 1;
        options.codecs = 1;
        options.transparent = true;
        options.visible = true;
    }
    load_default_options();

    var bound = {
        height_min: 20, height_max: 100,
        bar_min: 3, bar_max: 33,
        waterfall_min: 0, waterfall_max: 40,
        brightness_min: 7, brightness_max: 49,
        bass_min: -50, bass_max: 0,
        speed_min: 1, speed_max: 12,
        interval_min: 1, interval_max: 4,
        codecs_min: 0, codecs_max: 2
    };

    var child_menu = {
        height: null,
        bar: null,
        waterfall: null,
        brightness: null,
        bass: null,
        speed: null,
        interval: null,
        codecs: null,
        transparent: null,
        visible: null
    };

    function load_options(value) {
        for (var name in child_menu) {
            if (value[name] != undefined) {
                if (bound[name + "_min"] === undefined)
                    options[name] = value[name];
                else if (value[name] >= bound[name + "_min"] && value[name] <= bound[name + "_max"])
                    options[name] = Math.round(value[name]);
            }
        }
    }

    function reset_child_menu() {
        for (var name in child_menu) {
            child_menu[name][child_menu[name].type != "checkbox" ? "value" : "checked"] = options[name];
            child_menu[name].onchange();
        }
    }

    function set_fixed_style(element, z_index) {
        element.style.position = "fixed";
        element.style.border = "none";
        element.style.margin = "0px";
        element.style.padding = "0px";
        element.style.zIndex = z_index;
    }

    function create_menu() {
        var menu = document.createElement("button");
        set_fixed_style(menu, 10000002);
        menu.style.left = "0px";
        menu.style.top = "0px";
        menu.style.backgroundColor = "transparent";
        menu.style.cursor = "pointer";
        menu.style.outline = "none";
        menu.style.lineHeight = "0px";
        menu.title = "YouTube Musical Spectrum";
        var menu_img = document.createElement("img");
        menu_img.src = chrome.runtime.getURL("icon-24.png");
        menu_img.alt = "Menu";
        menu.appendChild(menu_img);
        var menu_is_hidden = true;
        var menu_div = document.createElement("div");
        var menu_table = document.createElement("table");
        set_fixed_style(menu_div, 10000001);
        menu_div.style.left = "0px";
        menu_div.style.top = "0px";
        menu_div.style.padding = "8px";
        menu_div.style.border = "thin solid white";
        menu_div.style.color = "white";
        menu_div.style.fontSize = "10pt";
        menu_div.style.backgroundColor = "#000000DD";
        menu_div.style.verticalAlign = "middle";
        menu_div.style.maxHeight = "90%";
        menu_div.style.overflow = "auto";
        menu_div.style.scrollbarWidth = "none";
        menu_div.style.visibility = "hidden";
        menu_div.style.cursor = "default";

        var current_tr = null;

        function get_menu_table_tr() {
            if (current_tr)
                return current_tr;
            return document.createElement("tr");
        }

        function append_menu_table_tr(tr) {
            if (current_tr) {
                current_tr = null;
            } else {
                menu_table.appendChild(tr);
                current_tr = tr;
            }
        }

        function set_common_tr_style(tr) {
            tr.style.height = "32px";
        }

        function set_common_left_td_style(td) {
            td.style.paddingLeft = "48px";
            td.style.width       = "80px";
        }

        function create_child_range_menu(title, name, callback) {
            var tr = get_menu_table_tr();
            set_common_tr_style(tr);
            var td = document.createElement("td");
            set_common_left_td_style(td);
            td.textContent = title;
            tr.appendChild(td);
            td = document.createElement("td");
            var child = child_menu[name] = document.createElement("input");
            var child_text = document.createElement("td");
            child.style.cursor = "pointer";
            child.type = "range";
            child.min = bound[name + "_min"];
            child.max = bound[name + "_max"];
            child.step = 1;
            child.value = options[name];
            child.oninput = function() {
                child_text.textContent = this.value;
            };
            child.onchange = function() {
                this.oninput();
                options[name] = Math.round(this.value);
                if (callback)
                    callback();
            };
            td.appendChild(child);
            tr.appendChild(td);
            tr.appendChild(child_text);
            child_text.style.textAlign = "right";
            child_text.style.width = "32px";
            child.onchange();
            append_menu_table_tr(tr);
        }

        create_child_range_menu("Height", "height");
        create_child_range_menu("Bar", "bar");
        create_child_range_menu("Waterfall", "waterfall");
        create_child_range_menu("Brightness", "brightness");
        create_child_range_menu("Bass", "bass", function(){ iir.gain.value = options.bass; });
        create_child_range_menu("Speed", "speed");
        create_child_range_menu("Interval", "interval");

        function inject_codecs() {
            // shared id in codecs-wrapper.js, codecs.js, script.js
            const element_id = "__ytms_codecs_element_id";
            var codecs_element = document.getElementById(element_id);
            if (codecs_element)
                codecs_element.textContent = options.codecs;
        }

        function create_child_select_codecs() {
            var tr = get_menu_table_tr();
            set_common_tr_style(tr);
            var td = document.createElement("td");
            set_common_left_td_style(td);
            td.textContent = "Codecs";
            tr.appendChild(td);
            td = document.createElement("td");
            td.colSpan = 2;
            var child = child_menu["codecs"] = document.createElement("select");
            child.style.cursor = "pointer";
            child.onchange = function() {
                options.codecs = Math.round(this.value);
                inject_codecs();
            };
            var select_opt = [ "All", "Block AV1", "Only H.264" ];
            for (var k = 0; k < select_opt.length; k++) {
                var opt = document.createElement("option");
                opt.textContent = select_opt[k];
                opt.value = k;
                child.appendChild(opt);
            }
            child.value = options.codecs;
            inject_codecs();
            td.appendChild(child);
            tr.appendChild(td);
            append_menu_table_tr(tr);
        }
        create_child_select_codecs();

        current_tr = null;

        function create_child_checkbox_menu(title, name, callback) {
            var tr = get_menu_table_tr();
            set_common_tr_style(tr);
            var td = document.createElement("td");
            set_common_left_td_style(td);
            td.textContent = title;
            tr.appendChild(td);
            td = document.createElement("td");
            td.colSpan = 2;
            var child = child_menu[name] = document.createElement("input");
            child.style.cursor = "pointer";
            child.type = "checkbox";
            child.checked = options[name];
            child.onchange = function() {
                options[name] = this.checked;
                if (callback)
                    callback();
            };
            td.appendChild(child);
            tr.appendChild(td);
            append_menu_table_tr(tr);
        }

        create_child_checkbox_menu("Transparent", "transparent", function() {
            if (canvas)
                canvas.style.pointerEvents = options.transparent ? "none" : "auto";
        });

        create_child_checkbox_menu("Visible", "visible", function() {
            if (canvas)
                canvas.style.visibility = options.visible ? "visible" : "hidden";
            if (axis)
                axis.style.visibility = options.visible ? "visible" : "hidden";
            if (blocker)
                blocker.style.visibility = options.visible ? "visible" : "hidden";
            if (af_links)
                af_links.style.visibility = options.visible ? "visible" : "hidden";
        });

        current_tr = null;

        function create_child_button_menu(title, callback) {
            var tr = get_menu_table_tr();
            //set_common_tr_style(tr);
            var td = document.createElement("td");
            set_common_left_td_style(td);
            td.colSpan = 3;
            var child = document.createElement("button");
            child.textContent = title;
            child.style.cursor = "pointer";
            child.style.fontFamily = "inherit";
            child.style.fontSize = "inherit";
            child.onclick = function() {
                if (callback)
                    callback(child);
            };
            td.appendChild(child);
            tr.appendChild(td);
            append_menu_table_tr(tr);
        }

        create_child_button_menu("Reset Settings", function() {
            chrome.storage.local.get(null, function(value) {
                load_default_options();
                load_options(value);
                reset_child_menu();
            });
        });

        create_child_button_menu("Set as Default Settings", function(child) {
            child.textContent = "Saving...";
            chrome.storage.local.set(options, function(){
                window.setTimeout(function(){ child.textContent = "Set as Default Settings"; }, 300);
            });
        });

        create_child_button_menu("Reset Default Settings", function(child) {
            child.textContent = "Resetting...";
            chrome.storage.local.clear(function(){
                window.setTimeout(function(){ child.textContent = "Reset Default Settings"; }, 300); 
            });
        });

        menu_div.appendChild(menu_table);
        menu.onclick = function() {
            menu_is_hidden = !menu_is_hidden;
            if (menu_is_hidden)
                menu_div.style.visibility = "hidden";
            else
                menu_div.style.visibility = "visible";
        };

        chrome.storage.local.get("hide_menu", function(value) {
            var hide_menu = !!value.hide_menu;
            menu.style.visibility = hide_menu ? "hidden" : "visible";
            document.body.insertBefore(menu_div, document.body.firstChild);
            document.body.insertBefore(menu, document.body.firstChild);
            document.addEventListener("keydown", function(key) {
                if (key.ctrlKey && key.altKey && !key.shiftKey && !key.metaKey && !key.repeat) {
                    switch (key.code) {
                    case "KeyH":
                        hide_menu = !hide_menu;
                        if (hide_menu) {
                            menu_is_hidden = true;
                            menu.style.visibility = "hidden";
                            menu_div.style.visibility = "hidden";
                        } else {
                            menu_is_hidden = false;
                            menu.style.visibility = "visible";
                            menu_div.style.visibility = "visible";
                            menu.focus();
                        }
                        chrome.storage.local.set({hide_menu: hide_menu});
                        break;
                    case "KeyG":
                        options.visible = !options.visible;
                        child_menu.visible.checked = options.visible;
                        child_menu.visible.onchange();
                        break;
                    }
                }
            });
        });
    }

    function resize_canvas() {
        if (!canvas) {
            canvas = document.createElement("canvas");
            set_fixed_style(canvas, 9999999);
            canvas.style.bottom = "0px";
            canvas.style.left = "0px";
            document.body.insertBefore(canvas, document.body.firstChild);
        }
        canvas.width = width;
        canvas.height = height;
        canvas.style.visibility = options.visible ? "visible" : "hidden";
        canvas.style.pointerEvents = options.transparent ? "none" : "auto";
        canvas_ctx = canvas.getContext("2d", {alpha: true});
        img_buffer = canvas_ctx.createImageData(width, height);

        if (!axis) {
            axis = document.createElement("img");
            axis.src = chrome.runtime.getURL("axis-1920x32.png");
            set_fixed_style(axis, 10000000);
            axis.style.left = "0px";
            document.body.insertBefore(axis, document.body.firstChild);
        }
        axis.width = width;
        axis.height = axis_h;
        axis.style.bottom = sono_h + "px";
        axis.style.visibility = options.visible ? "visible" : "hidden";

        if (!blocker) {
            blocker = document.createElement("div");
            set_fixed_style(blocker, 9999998);
            blocker.style.left = "0px";
            blocker.style.bottom = "0px";
            document.body.insertBefore(blocker, document.body.firstChild);
        }
        blocker.style.width = width + "px";
        blocker.style.height = Math.round(sono_h + axis_h + 0.1 * bar_h) + "px";
        blocker.style.opacity = 0;
        blocker.style.visibility = options.visible ? "visible" : "hidden";

        if (!af_links) {
            af_links = document.createElement("div");
            const style = document.createElement("style");
            style.textContent = `
                .__ytms_class_af_links { opacity: 0; }
                .__ytms_class_af_links_at_the_beginning { opacity: 1; }
                .__ytms_class_af_links:hover { opacity: 1; }
                .__ytms_class_af_links img { vertical-align: middle; }
                .__ytms_class_af_links_at_the_beginning img { vertical-align: middle; }
            `;
            document.head.appendChild(style);
            af_links.className = "__ytms_class_af_links_at_the_beginning";
            setTimeout(function(){ af_links.className = "__ytms_class_af_links"; }, 15000);
            set_fixed_style(af_links, 10000001);
            af_links.style.right = "8px";
            af_links.style.padding = "8px";
            af_links.style.border = "thin solid white";
            af_links.style.backgroundColor = "#000000DD";
            af_links.style.color = "#FFFFFF";
            af_links.style.fontSize = "10pt";
            af_links.innerHTML = `<img src="${chrome.runtime.getURL("icon-16.png")}" alt="YTMS"/>
                Support me on
                <a href="https://www.youtube.com/c/mfcc64" target="_blank">YouTube</a>
                <a href="https://www.patreon.com/mfcc64" target="_blank">Patreon</a>
                <a href="https://github.com/mfcc64" target="_blank">GitHub</a>
                <a href="https://paypal.me/mfcc64" target="_blank">PayPal</a>
                <a href="https://saweria.co/mfcc64" target="_blank">Saweria</a>
            `;
            document.body.insertBefore(af_links, document.body.firstChild);
        }
        af_links.style.bottom = (sono_h + axis_h + 4) + "px";
        af_links.style.visibility = options.visible ? "visible" : "hidden";
    }

    const cleared_sono_line_offset = 100;
    var cleared_sono_line = 0;
    function clear_canvas(only_alpha) {
        for (var y = 0; y < height; y++) {
            var alpha = options.transparent ? alpha_table[y] : 255;
            var line = y * width * 4;
            if (only_alpha) {
                for (var x = 0; x < width * 4; x += 4)
                    img_buffer.data[line + x + 3] = alpha;
            } else {
                for (var x = 0; x < width * 4; x += 4) {
                    img_buffer.data[line + x] = 0;
                    img_buffer.data[line + x + 1] = 0;
                    img_buffer.data[line + x + 2] = 0;
                    img_buffer.data[line + x + 3] = alpha;
                }
            }
        }
        canvas_ctx.putImageData(img_buffer, 0, 0);
        if (!only_alpha)
            cleared_sono_line = sono_h + cleared_sono_line_offset;
    }

    function resize() {
        var new_width = Math.min(Math.max(Math.floor(document.documentElement.clientWidth), 960), 7680);
        var new_axis_h = Math.round(new_width * 32 / 1920);
        var new_height = Math.min(Math.max(Math.floor(window.innerHeight * options.height / 100), 4 * new_axis_h), 4320);
        var new_sono_h = Math.round(new_height * options.waterfall / 100);
        if (new_sono_h > 0)
            new_sono_h = Math.max(new_sono_h, options.speed + 1);
        var new_bar_h = new_height - new_sono_h - new_axis_h;

        if (new_width != width || new_bar_h != bar_h || new_height != height || new_axis_h != axis_h) {
            if (new_width != width)
                cqt.init(audio_ctx.sampleRate, new_width, 1, 17, 17, 1);
            width = new_width;
            bar_h = new_bar_h;
            height = new_height;
            sono_h = new_sono_h;
            axis_h = new_axis_h;
            bar_h = new_bar_h;
            analyser_l.fftSize = cqt.fft_size;
            analyser_r.fftSize = cqt.fft_size;
            resize_canvas();

            alpha_table = new Uint8Array(height);
            for (var y = 0; y < bar_h; y++)
                alpha_table[y] = Math.round(255 * Math.sin(0.5*Math.PI*y/bar_h) * Math.sin(0.5*Math.PI*y/bar_h));
            for (var y = bar_h; y < height; y++)
                alpha_table[y] = 255;

            clear_canvas();
        }
    }

    var is_dirty_canvas = false;
    var interval_count = 0;
    function draw() {
        requestAnimationFrame(draw);
        if (++interval_count < options.interval)
            return;
        interval_count = 0;

        var need_reconnect = copied_videos.length != videos.length;
        if (!need_reconnect) {
            for (var m = 0; m < videos.length; m++) {
                if (copied_videos[m] != videos[m]) {
                    need_reconnect = 1;
                    break;
                }
            }
        }

        if (need_reconnect) {
            var tmp_copied_videos = new Array(videos.length);

            for (var m = 0; m < videos.length; m++)
                tmp_copied_videos[m] = videos[m];

            for (var n = 0; n < copied_videos.length; n++) {
                for (var m = 0; m < videos.length; m++)
                    if (copied_videos[n] == videos[m])
                        copied_videos[n] = null;

                // the circular reference is needed.
                if (copied_videos[n])
                    copied_videos[n].__ytms_stream.disconnect();
            }

            for (var m = 0; m < videos.length; m++) {
                if (!tmp_copied_videos[m].__ytms_stream) {
                    if (!tmp_copied_videos[m].crossOrigin) {
                        tmp_copied_videos[m].crossOrigin = "anonymous";
                        if (tmp_copied_videos[m].src && tmp_copied_videos[m].src.substring(0,4) == "http")
                            tmp_copied_videos[m].src +=
                                "&modified-by-youtube-musical-spectrum=setting-cross-origin-to-anonymous";
                    }

                    tmp_copied_videos[m].__ytms_stream = audio_ctx.createMediaElementSource(tmp_copied_videos[m]);
                }

                tmp_copied_videos[m].__ytms_stream.connect(panner);
            }

            copied_videos = tmp_copied_videos;
        }

        resize();

        if (!options.visible) {
            if (is_dirty_canvas)
                clear_canvas();
            is_dirty_canvas = false;
            return;
        }

        is_dirty_canvas = true;

        // 0 = stopped, 1 = paused, 2 = played
        var playback_status = 0;

        for (var m = 0; m < copied_videos.length; m++)
            if (((copied_videos[m].src && copied_videos[m].src != "") || copied_videos[m].srcObject) && !copied_videos[m].ended)
                playback_status = Math.max(playback_status, copied_videos[m].paused ? 1 : 2);

        if (playback_status == 1) {
            if (options.transparent != !(img_buffer.data[3] == 255))
                clear_canvas(true);
            return;
        }

        if (playback_status == 0) {
            if (cleared_sono_line >= sono_h + cleared_sono_line_offset ) {
                if (options.transparent != !(img_buffer.data[3] == 255))
                    clear_canvas(true);
                return;
            }

            cleared_sono_line += options.speed;
        } else {
            cleared_sono_line = 0;
        }

        analyser_l.getFloatTimeDomainData(cqt.inputs[0]);
        analyser_r.getFloatTimeDomainData(cqt.inputs[1]);
        cqt.set_height(bar_h);
        cqt.set_volume(options.bar, options.brightness);
        cqt.calc();

        for (var y = 0; y < bar_h + axis_h; y++) {
            if (y <= bar_h)
                cqt.render_line_alpha(y, options.transparent ? alpha_table[y] : 255);
            img_buffer.data.set(cqt.output, 4*width*y);
        }

        if (sono_h) {
            var speed = Math.round(options.speed);
            img_buffer.data.copyWithin(4*width*(bar_h+axis_h), 4*width*(bar_h+axis_h-speed), 4*width*(height-speed));
            var src0 = 4*width*(bar_h+axis_h);
            var src1 = 4*width*(bar_h+axis_h+speed);
            for (var y = 1; y < speed; y++) {
                var dst = 4*width*(bar_h+axis_h+y);
                for (var x = 0; x < width*4; x++) {
                    var mul = y / speed;
                    img_buffer.data[dst+x] = (1 - mul) * img_buffer.data[src0+x] + mul * img_buffer.data[src1+x] + 0.3333;
                }
            }
        }
        canvas_ctx.putImageData(img_buffer, 0, 0);
    }

    // wait until document.body is available
    if (!document.body) {
        await new Promise(function(resolve) {
            var observer = new MutationObserver(function() {
                if (document.body) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        });
    }

    chrome.storage.local.get(null, function(value) {
        load_options(value);
        create_menu();
        requestAnimationFrame(draw);
    });

})();
