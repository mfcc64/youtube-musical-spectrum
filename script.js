
(function(){
    var width = 0, height = 0, bar_h = 0, axis_h = 0, sono_h = 0;
    var canvas = null, canvas_ctx = null, axis = null, cqt = null, blocker = null, alpha_table = null;
    var audio_ctx = new window.AudioContext();
    function resume_audio_ctx() {
        if (audio_ctx.state === "suspended") {
            audio_ctx.resume();
            window.setTimeout(resume_audio_ctx, 100);
        }
    }
    resume_audio_ctx();
    var videos = document.getElementsByTagName("video");
    var copied_videos = [];
    var img_buffer = null, audio_data_l = null, audio_data_r = null, line = null;
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
        interval_min: 1, interval_max: 4
    }

    var child_menu = {
        height: null,
        bar: null,
        waterfall: null,
        brightness: null,
        bass: null,
        speed: null,
        interval: null,
        transparent: null,
        visible: null
    };

    var child_text = {
        height: null,
        bar: null,
        waterfall: null,
        brightness: null,
        bass: null,
        speed: null,
        interval: null,
    };

    function load_options(value) {
        function check_and_set_range(name) {
            if (value[name] != undefined && value[name] >= bound[name + "_min"] && value[name] <= bound[name + "_max"])
                options[name] = Math.round(value[name]);
        }
        check_and_set_range("height");
        check_and_set_range("bar");
        check_and_set_range("waterfall");
        check_and_set_range("brightness");
        check_and_set_range("bass");
        check_and_set_range("speed");
        check_and_set_range("interval");
        if (value.transparent != undefined)
            options.transparent = value.transparent;
        if (value.visible != undefined)
            options.visible = value.visible;
    }

    function reset_child_menu() {
        child_menu.height.value = options.height;
        child_menu.height.onchange();
        child_menu.bar.value = options.bar;
        child_menu.bar.onchange();
        child_menu.waterfall.value = options.waterfall;
        child_menu.waterfall.onchange();
        child_menu.brightness.value = options.brightness;
        child_menu.brightness.onchange();
        child_menu.bass.value = options.bass;
        child_menu.bass.onchange();
        child_menu.speed.value = options.speed;
        child_menu.speed.onchange();
        child_menu.interval.value = options.interval;
        child_menu.interval.onchange();
        child_menu.transparent.checked = options.transparent;
        child_menu.transparent.onchange();
        child_menu.visible.checked = options.visible;
        child_menu.visible.onchange();
    }

    function set_fixed_style(element, z_index) {
        element.style.position = "fixed";
        element.style.border = "none";
        element.style.margin = "0px";
        element.style.padding = "0px";
        element.style.zIndex = z_index;
    }

    function create_menu() {
        var menu = document.createElement("img");
        menu.src = chrome.extension.getURL("/icon-24.png");
        menu.width = 24;
        menu.height = 24;
        set_fixed_style(menu, 10000002);
        menu.style.left = "0px";
        menu.style.top = "0px";
        menu.style.cursor = "pointer";
        var menu_is_hidden = true;
        var child = null;
        var menu_table = document.createElement("div");
        set_fixed_style(menu_table, 10000001);
        menu_table.style.left = "0px";
        menu_table.style.top = "0px";
        menu_table.style.padding = "8px";
        menu_table.style.paddingTop = "32px";
        menu_table.style.border = "thin solid white";
        menu_table.style.whiteSpace = "pre";
        menu_table.style.fontFamily = "monospace";
        menu_table.style.color = "white";
        menu_table.style.fontSize = "8pt";
        menu_table.style.backgroundColor = "black";
        menu_table.style.lineHeight = "20pt";
        menu_table.style.display = "none";

        function create_child_range_menu(title, name, callback) {
            child = document.createElement("span");
            child.textContent = title;
            menu_table.appendChild(child);
            child_menu[name] = child = document.createElement("input");
            child.type = "range";
            child.min = bound[name + "_min"];
            child.max = bound[name + "_max"];
            child.step = 1;
            child.value = options[name];
            child.oninput = function() {
                var str = this.value.toString();
                while (str.length < 4)
                    str = " " + str;
                child_text[name].textContent = str;
            }
            child.onchange = function() {
                this.oninput();
                options[name] = Math.round(this.value);
                if (callback)
                    callback();
            }
            menu_table.appendChild(child);
            menu_table.appendChild(child_text[name] = document.createElement("span"));
            child.onchange();
            menu_table.appendChild(document.createElement("br"));
        }

        create_child_range_menu("Height          ", "height");
        create_child_range_menu("Bar             ", "bar");
        create_child_range_menu("Waterfall       ", "waterfall");
        create_child_range_menu("Brightness      ", "brightness");
        create_child_range_menu("Bass            ", "bass", function(){ iir.gain.value = options.bass; });
        create_child_range_menu("Speed           ", "speed");
        create_child_range_menu("Interval        ", "interval");

        child = document.createElement("span");
        child.textContent = "Transparent      ";
        menu_table.appendChild(child);
        child = child_menu.transparent = document.createElement("input");
        child.type = "checkbox";
        child.checked = options.transparent;
        child.onchange = function() {
            options.transparent = this.checked;
            if (canvas)
                canvas.style.pointerEvents = options.transparent ? "none" : "auto";
        }
        menu_table.appendChild(child);
        menu_table.appendChild(document.createElement("br"));

        child = document.createElement("span");
        child.textContent = "Visible          ";
        menu_table.appendChild(child);
        child = child_menu.visible = document.createElement("input");
        child.type = "checkbox";
        child.checked = options.visible;
        child.onchange = function() {
            options.visible = this.checked;
            if (canvas)
                canvas.style.visibility = options.visible ? "visible" : "hidden";
            if (axis)
                axis.style.visibility = options.visible ? "visible" : "hidden";
            if (blocker)
                blocker.style.visibility = options.visible ? "visible" : "hidden";
        }
        menu_table.appendChild(child);
        menu_table.appendChild(document.createElement("br"));

        child = document.createElement("input");
        child.type = "button";
        child.style.cursor = "pointer";
        child.value = "Reset Settings";
        child.onclick = function() {
            chrome.storage.local.get(null, function(value) {
                load_default_options();
                load_options(value);
                reset_child_menu();
            });
        }
        menu_table.appendChild(child);
        menu_table.appendChild(document.createElement("br"));

        child = document.createElement("input");
        child.type = "button";
        child.style.cursor = "pointer";
        child.value = "Set as Default Settings";
        child.onclick = function() {
            var t = this;
            t.value = "Saving...";
            chrome.storage.local.set(options, function(){
                window.setTimeout(function(){ t.value = "Set as Default Settings"; }, 300);
            });
        }
        menu_table.appendChild(child);
        menu_table.appendChild(document.createElement("br"));

        child = document.createElement("input");
        child.type = "button";
        child.style.cursor = "pointer";
        child.value = "Reset Default Settings";
        child.onclick = function() {
            var t = this;
            t.value = "Resetting...";
            chrome.storage.local.clear(function(){
                window.setTimeout(function(){ t.value = "Reset Default Settings"; }, 300); 
            });
        }
        menu_table.appendChild(child);

        document.body.appendChild(menu_table);
        menu.onclick = function() {
            if (menu_is_hidden)
                menu_table.style.display = "block";
            else
                menu_table.style.display = "none";
            menu_is_hidden = !menu_is_hidden;
        }

        chrome.storage.local.get("hide_menu", function(value) {
            var hide_menu = !!value.hide_menu;
            menu.style.visibility = hide_menu ? "hidden" : "visible";
            document.body.appendChild(menu);
            document.addEventListener("keydown", function(key) {
                if (key.ctrlKey && key.altKey && !key.shiftKey && !key.metaKey && !key.repeat) {
                    switch (key.code) {
                    case "KeyH":
                        hide_menu = !hide_menu;
                        if (hide_menu) {
                            menu_is_hidden = true;
                            menu.style.visibility = "hidden";
                            menu_table.style.display = "none";
                        } else {
                            menu_is_hidden = false;
                            menu.style.visibility = "visible";
                            menu_table.style.display = "block";
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
            document.body.appendChild(canvas);
        }
        canvas.width = width;
        canvas.height = height;
        canvas.style.visibility = options.visible ? "visible" : "hidden";
        canvas.style.pointerEvents = options.transparent ? "none" : "auto";
        canvas_ctx = canvas.getContext("2d", {alpha: true});
        img_buffer = canvas_ctx.createImageData(width, height);
        /* make opaque */
        for (var k = 0; k < width * height * 4; k += 4) {
            img_buffer.data[k] = 0;
            img_buffer.data[k+1] = 0;
            img_buffer.data[k+2] = 0;
            img_buffer.data[k+3] = 255;
        }

        if (!axis) {
            axis = document.createElement("img");
            axis.src = chrome.extension.getURL("/axis-1920x32.png");
            set_fixed_style(axis, 10000000);
            axis.style.left = "0px";
            document.body.appendChild(axis);
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
            document.body.appendChild(blocker);
        }
        blocker.style.width = width + "px";
        blocker.style.height = Math.round(sono_h + axis_h + 0.1 * bar_h) + "px";
        blocker.style.visibility = options.visible ? "visible" : "hidden";
    }

    function resize() {
        var new_width = Math.min(Math.max(Math.floor(document.documentElement.clientWidth), 960), 7680);
        var new_axis_h = Math.round(new_width * 32 / 1920);
        var new_height = Math.min(Math.max(Math.floor(window.innerHeight * options.height / 100), 4 * new_axis_h), 4320);
        var new_sono_h = Math.round(new_height * options.waterfall / 100);
        if (new_sono_h > 0)
            new_sono_h = Math.max(new_sono_h, bound.speed_max + 1);
        var new_bar_h = new_height - new_sono_h - new_axis_h;

        if (new_width != width || new_bar_h != bar_h || new_height != height || new_axis_h != axis_h) {
            if (new_width != width)
                cqt = new ShowCQTBar(audio_ctx.sampleRate, new_width, 1, 17, 17, 1);
            width = new_width;
            bar_h = new_bar_h;
            height = new_height;
            sono_h = new_sono_h;
            axis_h = new_axis_h;
            bar_h = new_bar_h;
            audio_data_l = cqt.get_input_array(0);
            audio_data_r = cqt.get_input_array(1);
            analyser_l.fftSize = cqt.fft_size;
            analyser_r.fftSize = cqt.fft_size;
            line = cqt.get_output_array();
            resize_canvas();

            alpha_table = new Uint8Array(bar_h + axis_h);
            for (var y = 0; y < bar_h; y++)
                alpha_table[y] = Math.round(255 * Math.sin(0.5*Math.PI*y/bar_h) * Math.sin(0.5*Math.PI*y/bar_h));
            for (var y = bar_h; y < bar_h + axis_h; y++)
                alpha_table[y] = 255;
        }
    }

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

        if (!options.visible)
            return;

        analyser_l.getFloatTimeDomainData(audio_data_l);
        analyser_r.getFloatTimeDomainData(audio_data_r);
        cqt.set_height(bar_h);
        cqt.set_volume(options.bar, options.brightness);
        cqt.calc();

        for (var y = 0; y < bar_h + axis_h; y++) {
            cqt.render_line(y, options.transparent ? alpha_table[y] : 255);
            img_buffer.data.set(line, 4*width*y);
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

    chrome.storage.local.get(null, function(value) {
        load_options(value);
        create_menu();
        requestAnimationFrame(draw);
    });

})();
