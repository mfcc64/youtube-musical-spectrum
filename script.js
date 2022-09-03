import "./modules/showcqt-element.mjs";

(async function(){
    const current_script = import.meta.url;

    const defaults = {
        height:     { def: 33, min: 20, max:100 },
        bar:        { def: 17, min:  3, max: 33 },
        waterfall:  { def: 33, min:  0, max: 40 },
        brightness: { def: 17, min:  7, max: 49 },
        bass:       { def:-30, min:-50, max:  0 },
        speed:      { def:  2, min:  1, max: 12 },
        interval:   { def:  1, min:  1, max:  4 },
        codecs:     { def:  1, min:  0, max:  2 },
        transparent:{ def:  1, min:  0, max:  1 },
        visible:    { def:  1, min:  0, max:  1 }
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

    const af_links = document.createElement("div");
    set_fixed_style(af_links, 10000001);
    af_links.className = "__ytms_class_af_links_at_the_beginning";
    af_links.style.padding = "8px";
    af_links.style.border = "thin solid white";
    af_links.style.backgroundColor = "#000000DD";
    af_links.style.color = "#FFFFFF";
    af_links.style.fontSize = "10pt";
    af_links.style.right = "8px";
    af_links.style.bottom = "8px";
    af_links.innerHTML = `<img alt="YTMS"/> Support me on
        <a href="https://www.youtube.com/c/mfcc64" target="_blank">YouTube</a>
        <a href="https://www.patreon.com/mfcc64" target="_blank">Patreon</a>
        <a href="https://github.com/mfcc64" target="_blank">GitHub</a>
        <a href="https://paypal.me/mfcc64" target="_blank">PayPal</a>
        <a href="https://saweria.co/mfcc64" target="_blank">Saweria</a>`;
    setTimeout(() => af_links.className = "__ytms_class_af_links", 15000);
    {
        const style = document.createElement("style");
        style.textContent = `
            .__ytms_class_af_links { opacity: 0; }
            .__ytms_class_af_links_at_the_beginning { opacity: 1; }
            .__ytms_class_af_links:hover { opacity: 1; }
            .__ytms_class_af_links img { vertical-align: middle; }
            .__ytms_class_af_links_at_the_beginning img { vertical-align: middle; }`;
        document.head.appendChild(style);
    }

    const cqt = document.createElement("showcqt-element");
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
        menu_img.src = new URL("icon-24.png", current_script);
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
            append_menu_table_tr(tr);
        }

        create_child_range_menu("Height", "height", (child) => cqt.style.height = child.value + "%");
        create_child_range_menu("Bar", "bar", (child) => cqt.dataset.bar = child.value);
        create_child_range_menu("Waterfall", "waterfall", (child) => cqt.dataset.waterfall = child.value);
        create_child_range_menu("Brightness", "brightness", (child) => cqt.dataset.brightness = child.value);
        create_child_range_menu("Bass", "bass", (child) => cqt.dataset.bass = child.value);
        create_child_range_menu("Speed", "speed", (child) => cqt.dataset.speed = child.value);
        create_child_range_menu("Interval", "interval", (child) => cqt.dataset.interval = child.value);

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
            append_menu_table_tr(tr);
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
            child.checked = get_opt(name) * 1;
            child.onchange = function() {
                if (callback)
                    callback(child);
            };
            child.onchange();
            td.appendChild(child);
            tr.appendChild(td);
            append_menu_table_tr(tr);
        }

        create_child_checkbox_menu("Transparent", "transparent", (child) => cqt.dataset.opacity = child.checked ? "transparent" : "opaque");

        create_child_checkbox_menu("Visible", "visible", (child) => af_links.style.display = cqt.style.display = child.checked ? "block" : "none");

        current_tr = null;

        function create_child_button_menu(title, callback) {
            var tr = get_menu_table_tr();
            //set_common_tr_style(tr);
            var td = document.createElement("td");
            set_common_left_td_style(td);
            td.colSpan = 3;
            var child = document.createElement("input");
            child.type = "button";
            child.value = title;
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
            for (const name in child_menu) {
                if (child_menu[name].type == "checkbox")
                    child_menu[name].checked = get_opt(name) * 1;
                else
                    child_menu[name].value = get_opt(name);
                child_menu[name].onchange();
            }
        });

        create_child_button_menu("Set as Default Settings", function(child) {
            child.value = "Saving...";
            for (const name in child_menu) {
                if (child_menu[name].type == "checkbox")
                    set_opt(name, child_menu[name].checked)
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
    af_links.querySelector("img").src = new URL("icon-16.png", current_script);
})();
