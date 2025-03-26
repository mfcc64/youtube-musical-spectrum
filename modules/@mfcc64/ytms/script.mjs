/*
 * Copyright (c) 2024 Muhammad Faiz <mfcc64@gmail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */

import {ShowCQTElement} from "../../showcqt-element@2/showcqt-element.mjs";

(async function(){
    const get_asset = (name) => String(new URL(`../ytms-assets@1.0.0/${name}`, import.meta.url));
    const axis_list = [
        "",
        get_asset("axis-hz-1920x32.png")
    ];

    const defaults = {
        height:     { def: 33, min: 20, max:100 },
        bar:        { def: 17, min:  1, max: 33 },
        waterfall:  { def: 33, min:  0, max: 70 },
        brightness: { def: 17, min:  1, max: 70 },
        bass:       { def:-30, min:-50, max:  0 },
        speed:      { def:  2, min:  1, max: 12 },
        mic:        { def:  0, min:  0, max: 30 },
        mic_pan:    { def:  0, min:-10, max: 10 },
        scale_x:    { def:100, min: 30, max:100 },
        scale_y:    { def:100, min: 30, max:100 },
        base_note:  { def: 16, min: 16, max:100 },
        semitones:  { def:120, min: 36, max:120 },
        peak_color: { def:0xffffff, min:0, max:0xffffff },
        left_color: { def:0xdcb900, min:0, max:0xffffff },
        right_color:{ def:0x00b9dc, min:0, max:0xffffff },
        mid_color:  { def:0xdcdcdc, min:0, max:0xffffff },
        interval:   { def:  1, min:  1, max:  4 },
        codecs:     { def:  1, min:  0, max:  2 },
        transparent:{ def:  1, min:  0, max:  1 },
        visible:    { def: document.location.hostname == "music.youtube.com" ? 1 : 0,
                               min:  0, max:  1 },
        axis:       { def:  0, min:  0, max: axis_list.length - 1 }
    };

    const opt_prefix = "__youtube_musical_spectrum_opt_";
    function get_opt(name) {
        var value = localStorage.getItem(opt_prefix + name);
        if (!defaults[name])
            return value;
        if (!value)
            return defaults[name].def;
        value = Math.round(value);
        return Math.max(defaults[name].min, Math.min(defaults[name].max, isNaN(value) ? defaults[name].def : value));
    }

    function set_opt(name, value) {
        value = Math.round(value);
        if (defaults[name])
            value = Math.max(defaults[name].min, Math.min(defaults[name].max, isNaN(value) ? defaults[name].def : value));
        try {
            localStorage.setItem(opt_prefix + name, value);
        } catch(e) {
            console.warn(`Unable to store option ${name}.`, e);
        }
    }

    var child_menu = {};

    function set_fixed_style(element, z_index) {
        element.style.position = "fixed";
        element.style.border = "none";
        element.style.margin = "0px";
        element.style.padding = "0px";
        element.style.zIndex = z_index;
    }

    const icon_16 = get_asset("icon-16.png");
    const af_links = document.createElement("div");
    set_fixed_style(af_links, 10000001);
    af_links.style.padding = "8px";
    af_links.style.border = "thin solid white";
    af_links.style.backgroundColor = "#000000DD";
    af_links.style.color = "#FFFFFF";
    af_links.style.fontSize = "10pt";
    af_links.style.right = "8px";
    af_links.style.bottom = "8px";
    af_links.style.opacity = 1;
    {
        const e = (name, ...args) => {
            const v = document.createElement(name);
            for (const arg of args)
                if (typeof arg == "object" && !(arg instanceof Node))
                    v.setAttribute(...Object.entries(arg)[0])
                else
                    v.append(arg);
            return v;
        };
        af_links.attachShadow({mode: "open"}).append(
            e("style",
              `:host { opacity: 0; max-width: 700px; }
              :host(:hover) { opacity: 1; }
              img { vertical-align: middle; }`),
            e("div", {id: "message"},
              e("h3", "YouTube Musical Spectrum"),
              e("ul",
                e("li", "By default, the visualization is visible on YT Music page but hidden on YouTube page."),
                e("li", "Press ", e("b", "Ctrl+Alt+G"), " as a shortcut to show/hide visualization. This is equivalent to check/uncheck ", e("b", "Visible"), " setting."),
                e("li", "Click the ", e("img", {alt: "YTMS"}, {src: icon_16}), " icon at the top left corner to open/close settings."),
                e("li", "Press ", e("b", "Ctrl+Alt+H"), " to open/close settings and show/hide the ", e("img", {alt: "YTMS"}, {src: icon_16}), " icon."),
                e("li", "If you want to change the axis, click it."),
                e("li", "If you want to make your change persistent, click ", e("b", "Set as Default Settings"), " button."),
                e("li", e("b", "New Features:"), " Hz-scale axis, microphone support, YT Music support, scale options to " +
                    "reduce CPU usage, custom color, custom range, peak color."),
                e("li", e("a", {href: "https://github.com/mfcc64/youtube-musical-spectrum#settings"}, {target: "_blank"}, "Read more..."))
              ),
              e("p",
                e("button", {id: "close_message"}, {style: "cursor: pointer;"}, "Close"),
                " (Click the ", e("img", {alt: "YTMS"}, {src: icon_16}), " icon below to reopen again)"
              )
            ),
            e("div", {style: "text-align: right;"},
              e("img", {alt: "YTMS"}, {src: icon_16}, {style: "curson: pointer;"}, {id: "open_message"}),
              " Support me on ",
              e("a", {href: "https://www.youtube.com/@mfcc64"}, {target: "_blank"}, "Youtube"), " ",
              e("a", {href: "https://www.patreon.com/mfcc64"}, {target: "_blank"}, "Patreon"), " ",
              e("a", {href: "https://github.com/mfcc64"}, {target: "_blank"}, "GitHub"), " ",
              e("a", {href: "https://paypal.me/mfcc64"}, {target: "_blank"}, "PayPal"), " ",
              e("a", {href: "https://saweria.co/mfcc64"}, {target: "_blank"}, "Saweria")
            )
        );
    }

    let af_links_timeout = false;
    setTimeout(() => {
        af_links.style.opacity = "";
        af_links_timeout = true,
        update_af_links();
    }, 15000);

    function update_af_links() {
        af_links.style.display = !af_links_timeout || (child_menu.visible?.checked ?? true) ? "block" : "none";
    }

    const message_version = 9;
    af_links.shadowRoot.getElementById("message").style.display = get_opt("message_version") == message_version ? "none" : "block";
    af_links.shadowRoot.getElementById("close_message").addEventListener("click", function() {
        set_opt("message_version", message_version);
        af_links.shadowRoot.getElementById("message").style.display = "none";
    });
    af_links.shadowRoot.getElementById("open_message").addEventListener("click", function() {
        af_links.shadowRoot.getElementById("message").style.display = "block";
    });

    const cqt = new ShowCQTElement();
    set_fixed_style(cqt, 9999999);
    cqt.style.left = cqt.style.bottom = 0;
    cqt.style.width = "100%";
    let stop_count = 0;
    const videos = document.getElementsByTagName("video");
    let svideos = [];
    cqt.render_callback = function() {
        let need_refresh = (videos.length != svideos.length);
        for (let k = 0; k < videos.length && !need_refresh; k++)
            need_refresh = (videos[k] != svideos[k]);
        if (need_refresh) {
            this.dataset.inputs = "video";
            svideos = Array.from(videos);
        }

        let state = 0;
        for (let k = 0; k < svideos.length && state < 2; k++)
            if (svideos[k].src && !svideos[k].ended)
                state = svideos[k].paused ? 1 : 2;

        (state == 1) ? this.render_pause() : this.render_play();
    };

    function ytmusic_layout() {
        const style = document.createElement("style");
        style.textContent = `
            ytmusic-player-bar { z-index: 12 !important; }
            #main-panel { align-items: flex-start !important; }
            #player { margin-top: 0 !important; }`;
        document.head.appendChild(style);
        af_links.style.zIndex = 11;
        af_links.style.bottom = "calc(var(--ytmusic-player-bar-height, 0) + 8px)";
        cqt.style.zIndex = 10;

        function update_cqt_bottom() {
            if (document.fullscreenElement) {
                cqt.style.bottom = 0;
                af_links.style.visibility = "hidden";
            } else {
                cqt.style.bottom = "var(--ytmusic-player-bar-height, 0)";
                af_links.style.visibility = "visible";
            }
        }

        addEventListener("fullscreenchange", update_cqt_bottom);
        update_cqt_bottom();
    }

    if (document.location.hostname == "music.youtube.com")
        ytmusic_layout();

    child_menu.axis = { value: get_opt("axis") };
    child_menu.axis.onchange = function() { cqt.dataset.axis = axis_list[child_menu.axis.value]; };
    cqt.shadowRoot.getElementById("axis").addEventListener("click", function() {
        child_menu.axis.value = (child_menu.axis.value + 1) % axis_list.length;
        child_menu.axis.onchange();
    });
    child_menu.axis.onchange();

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
        menu_img.src = get_asset("icon-24.png");
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
        var current_tr_count = 0;

        function get_menu_table_tr() {
            if (current_tr && current_tr_count < 3)
                return current_tr_count++, current_tr;
            current_tr_count = 1;
            current_tr = document.createElement("tr");
            menu_table.appendChild(current_tr);
            return current_tr;
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
            td.style.width = "120px";
            td.colSpan = 2;
            var child = child_menu[name] = document.createElement("input");
            var child_text = document.createElement("td");
            child.style.cursor = "pointer";
            child.style.width = "100%";
            child.type = "range";
            child.min = defaults[name].min;
            child.max = defaults[name].max;
            child.step = 1;
            child.value = get_opt(name);
            child.oninput = function() {
                child_text.textContent = this.value;
            };
            child.onchange = function() {
                this.oninput();
                if (callback)
                    callback(child);
            };
            td.appendChild(child);
            tr.appendChild(td);
            tr.appendChild(child_text);
            child_text.style.textAlign = "right";
            child_text.style.width = "32px";
            child.onchange();
        }

        const mic = { };
        mic.pan = cqt.audio_context.createStereoPanner();
        mic.gain = cqt.audio_context.createGain();
        mic.pan.connect(cqt.audio_input);
        mic.gain.connect(mic.pan);

        create_child_range_menu("Height", "height", (child) => cqt.style.height = child.value + "%");
        create_child_range_menu("Bar", "bar", (child) => cqt.dataset.bar = child.value);
        create_child_range_menu("Waterfall", "waterfall", (child) => cqt.dataset.waterfall = child.value);
        create_child_range_menu("Brightness", "brightness", (child) => cqt.dataset.brightness = child.value);
        create_child_range_menu("Bass", "bass", (child) => cqt.dataset.bass = child.value);
        create_child_range_menu("Speed", "speed", (child) => cqt.dataset.speed = child.value);
        create_child_range_menu("Mic", "mic", async (child) => {
            mic.gain.gain.value = child.value * child.value / 100;
            if (!mic.promise) {
                if (child.value == 0)
                    return;
                const media_params = {
                    audio: {
                        echoCancellation: false,
                        autoGainControl: false,
                        noiseSuppression: false,
                        latency: 0,
                        channelCount: 2,
                        sampleRate: cqt.audio_context.sampleRate
                    }
                };
                mic.promise = navigator.mediaDevices.getUserMedia(media_params);
                mic.stream = await mic.promise;
                mic.source = cqt.audio_context.createMediaStreamSource(mic.stream);
                mic.source.connect(mic.gain);
            }

            if (mic.source && child.value == 0) {
                mic.source.disconnect(mic.gain);
                for (const track of mic.stream.getTracks())
                    track.stop();
                mic.source = mic.stream = mic.promise = null;
            }
        });
        create_child_range_menu("Mic Pan", "mic_pan", (child) => mic.pan.pan.value = child.value / 10);
        create_child_range_menu("Interval", "interval", (child) => cqt.dataset.interval = child.value);
        create_child_range_menu("Scale X", "scale_x", (child) => cqt.dataset.scaleX = child.value);
        create_child_range_menu("Scale Y", "scale_y", (child) => cqt.dataset.scaleY = child.value);
        create_child_select_codecs();

        function update_range(child) {
            if (!child_menu.base_note || !child_menu.semitones)
                return;

            const width = child_menu.semitones.value * 1;
            const base = child_menu.base_note.value - 16;
            if (base + width > 120) {
                child == child_menu.semitones ?
                    (child_menu.base_note.value = 120 - width + 16, child_menu.base_note.onchange()) :
                    (child_menu.semitones.value = 120 - base, child_menu.semitones.onchange());
                return;
            }
            cqt.style.left = -base / width * 100 + "%";
            cqt.style.width = 12000 / width + "%";
        }

        create_child_range_menu("Base Note", "base_note", child => update_range(child));
        create_child_range_menu("Semitones", "semitones", child => update_range(child));

        const number2color = n => "#" + (n|0).toString(16).padStart(6, "0");
        const color2number = c => Number.parseInt(c.slice(1), 16);
        const color_int = [ 0, 0, 0, 0 ];
        const color_table = new Array(9);
        const peak_color = new Array(3);

        function create_child_color_menu(title, name, callback) {
            var tr = get_menu_table_tr();
            set_common_tr_style(tr);
            var td = document.createElement("td");
            set_common_left_td_style(td);
            td.textContent = title;
            tr.appendChild(td);
            td = document.createElement("td");
            td.style.width = "80px";
            var child_text = document.createElement("td");
            child_text.style.textAlign = "right";
            child_text.colSpan = 2;
            var child = child_menu[name] = document.createElement("input");
            child.style.cursor = "pointer";
            child.style.width = "100%";
            child.type = "color";
            child.value = number2color(get_opt(name));
            child.onchange = function() {
                child_text.textContent = child.value;
                child.textContent = child.value;
                callback?.(child);
                update_color_table();
            };
            child.oninput = child.onchange;
            td.appendChild(child);
            tr.appendChild(td);
            tr.appendChild(child_text);
            child.onchange();
        }

        create_child_color_menu("Peak Color", "peak_color", child => color_int[3] = color2number(child.value));

        function detect_peak(color) {
            if (color_int[3] == 0xffffff)
                return;

            for (let k = 4; k < color.length - 4; k += 4) {
                if (color[k+3] <= color[k-1] || color[k+3] < color[k+7])
                    continue;

                const alpha = (1 - (k+2) / color.length) ** 2;
                for (let m = 0; m < 3; m++)
                    color[k+m] = Math.min(color[k+m], 1) * (1 - alpha + peak_color[m] * alpha);
            }
        }

        function update_color_table() {
            const k = 0xb9/0xdc;
            const color_tmp = new Array(9);
            for (let x = 0; x < 3; x++) {
                color_tmp[3*x] = ((color_int[x] >> 16) & 0xff) / 0xdc;
                color_tmp[3*x+1] = ((color_int[x] >> 8) & 0xff) / 0xdc;
                color_tmp[3*x+2] = (color_int[x] & 0xff) / 0xdc;
            }

            for (let x = 0; x < 3; x++) {
                color_table[3+x] = (color_tmp[0+x] + color_tmp[6+x] - color_tmp[3+x]) / (2 * k - 1);
                color_table[0+x] = color_tmp[0+x] - k * color_table[3+x];
                color_table[6+x] = color_tmp[6+x] - k * color_table[3+x];
            }

            peak_color[0] = ((color_int[3] >> 16) & 0xff) / 0xff;
            peak_color[1] = ((color_int[3] >> 8) & 0xff) / 0xff;
            peak_color[2] = (color_int[3] & 0xff) / 0xff;
        }

        create_child_color_menu("Left Color", "left_color", child => color_int[0] = color2number(child.value));
        create_child_color_menu("Mid Color", "mid_color", child => color_int[1] = color2number(child.value));
        create_child_color_menu("Right Color", "right_color", child => color_int[2] = color2number(child.value));

        function transform_color(color) {
            if (color_int[0] == 0xdcb900 && color_int[1] == 0xdcdcdc && color_int[2] == 0x00b9dc)
                return;

            for (let x = 0; x < color.length; x += 4) {
                const left = color[x], mid = color[x+1], right = color[x+2];
                color[x  ] = color_table[0] * left + color_table[3] * mid + color_table[6] * right;
                color[x+1] = color_table[1] * left + color_table[4] * mid + color_table[7] * right;
                color[x+2] = color_table[2] * left + color_table[5] * mid + color_table[8] * right;
            }
        }

        cqt.actual_render_callback = function(color) {
            transform_color(color);
            detect_peak(color);
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
            child.style.width = "100%";
            var select_opt = [ "All", "Block AV1", "Only H.264" ];
            for (var k = 0; k < select_opt.length; k++) {
                var opt = document.createElement("option");
                opt.textContent = select_opt[k];
                opt.value = k;
                child.appendChild(opt);
            }
            child.value = get_opt("codecs");
            td.appendChild(child);
            tr.appendChild(td);
            tr.appendChild(document.createElement("td"));
            child.onchange = function() {};
            const old_func = MediaSource.isTypeSupported;
            MediaSource.isTypeSupported = function (mime_type) {
                let rejected = [ "av01" ];
                switch (child.value) {
                    case "0": rejected = []; break;
                    case "1": rejected = [ "av01" ]; break;
                    case "2": rejected = [ "av01", "vp09", "vp9", "vp08", "vp8" ]; break;
                }

                for (const type of rejected) {
                    if (String(mime_type).indexOf(type) >= 0)
                        return false;
                }

                return old_func.call(this, mime_type);
            }
        }

        function create_child_checkbox_menu(title, name, callback) {
            var tr = get_menu_table_tr();
            set_common_tr_style(tr);
            var td = document.createElement("td");
            set_common_left_td_style(td);
            td.textContent = title;
            tr.appendChild(td);
            td = document.createElement("td");
            td.colSpan = 3;
            var child = child_menu[name] = document.createElement("input");
            child.style.cursor = "pointer";
            child.type = "checkbox";
            child.checked = get_opt(name) * 1;
            child.onchange = function() {
                if (callback)
                    callback(child);
            };
            child.onchange();
            td.appendChild(child);
            tr.appendChild(td);
        }

        create_child_checkbox_menu("Transparent", "transparent", (child) => cqt.dataset.opacity = child.checked ? "transparent" : "opaque");
        create_child_checkbox_menu("Visible", "visible", (child) => {
            cqt.style.display = child.checked ? "block" : "none";
            update_af_links();
        });

        current_tr = null;
        set_common_tr_style(get_menu_table_tr());
        current_tr = null;

        var child_buttons_td = document.createElement("td");
        child_buttons_td.colSpan = 4 * 3;
        child_buttons_td.style.textAlign = "right";
        get_menu_table_tr().appendChild(child_buttons_td);

        function create_child_button_menu(title, callback) {
            var child = document.createElement("input");
            child.type = "button";
            child.value = title;
            child.style.cursor = "pointer";
            child.style.fontFamily = "inherit";
            child.style.fontSize = "inherit";
            child.style.marginLeft = "8px";
            child.style.width = "180px";
            child.onclick = function() {
                if (callback)
                    callback(child);
            };
            child_buttons_td.appendChild(child);
        }

        create_child_button_menu("Reset Settings", function() {
            for (const name in child_menu) {
                if (child_menu[name].type == "checkbox")
                    child_menu[name].checked = get_opt(name) * 1;
                else if(child_menu[name].type == "color")
                    child_menu[name].value = number2color(get_opt(name));
                else
                    child_menu[name].value = get_opt(name);
                child_menu[name].onchange();
            }
        });

        create_child_button_menu("Set as Default Settings", function(child) {
            child.value = "Saving...";
            for (const name in child_menu) {
                if (child_menu[name].type == "checkbox")
                    set_opt(name, child_menu[name].checked);
                else if (child_menu[name].type == "color")
                    set_opt(name, color2number(child_menu[name].value));
                else
                    set_opt(name, child_menu[name].value);
            }
            setTimeout(function(){ child.value = "Set as Default Settings"; }, 300);
        });

        create_child_button_menu("Reset Default Settings", function(child) {
            child.value = "Resetting...";
            for (const name in defaults)
                set_opt(name, defaults[name].value);
            setTimeout(function(){ child.value = "Reset Default Settings"; }, 300);
        });

        menu_div.appendChild(menu_table);
        menu.onclick = function() {
            menu_is_hidden = !menu_is_hidden;
            if (menu_is_hidden)
                menu_div.style.visibility = "hidden";
            else
                menu_div.style.visibility = "visible";
        };

        var hide_menu = !!(get_opt("hide_menu") * 1);
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
                    set_opt("hide_menu", hide_menu * 1);
                    break;
                case "KeyG":
                    child_menu.visible.checked = !child_menu.visible.checked;
                    child_menu.visible.onchange();
                    break;
                }
            }
        });
    }

    create_menu();
    document.body.appendChild(cqt);
    document.body.appendChild(af_links);
})().catch(e => console.error(e));
