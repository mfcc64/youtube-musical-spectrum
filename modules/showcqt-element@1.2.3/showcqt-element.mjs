/*
 * Copyright (c) 2022 Muhammad Faiz <mfcc64@gmail.com>
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

// https://github.com/mfcc64/showcqt-element

// FIXME
import ShowCQT from "../showcqt@1.2.1/showcqt.mjs";

const OBSERVED_ATTRIBUTES = {
    "data-axis":        { def: String(new URL("axis-1920x32.png", import.meta.url)) },
    "data-waterfall":   { def:  33, min:   0, max: 100 },
    "data-brightness":  { def:  17, min:   1, max: 100 },
    "data-bar":         { def:  17, min:   1, max: 100 },
    "data-bass":        { def: -30, min: -50, max:   0 },
    "data-interval":    { def:   1, min:   1, max:   4 },
    "data-speed":       { def:   2, min:   1, max:  12 },
    "data-scale-x":     { def: 100, min:  30, max: 100 },
    "data-scale-y":     { def: 100, min:  30, max: 100 },
    "data-opacity":     { def: "opaque" }
};

// HTMLElement, customElements.get, customElements.define are hijacked by youtube custom-elements-es5-adapter.js
// Hopefully nobody hijacks HTMLDivElement
const HTMLElement = Object.getPrototypeOf(HTMLDivElement);
class ShowCQTElement extends HTMLElement {
    static version = "1.2.3";

    static global_audio_context;

    static get observedAttributes() {
        return [... Object.keys(OBSERVED_ATTRIBUTES), "data-inputs"];
    }

    constructor() {
        super();
        const p = Object.seal(this.#private);
        const shadow = this.attachShadow({mode: "open"});
        shadow.innerHTML =
            `<style>
                :host { display: block; width: 960px; height: 240px; pointer-events: none; }
                * {
                    margin: 0; padding: 0; border: 0;
                    pointer-events: none;
                    width: 0; height: 0;
                    position: absolute; left: 0; bottom: 0;
                }

                #container {
                    position: relative;
                    min-height: 32px; min-width: 256px;
                    width: 100%; height: 100%;
                }

                #axis, #blocker {
                    pointer-events: auto;
                }

                #canvas {
                    width: auto; height: auto;
                }
            </style>
            <div id="container">
                <div id="blocker"></div>
                <canvas id="canvas" width="0" height="0"></canvas>
                <img id="axis"/>
            </div>`;

        (async () => { p.cqt = await ShowCQT.instantiate(); })();
        for (const id of ["container", "blocker", "canvas", "axis"])
            p[id] = shadow.getElementById(id);
        p.canvas_ctx = p.canvas.getContext("2d");

        p.audio_ctx = ShowCQTElement.global_audio_context;
        if (!p.audio_ctx) {
            p.audio_ctx = new AudioContext();
            // FIXME
            var resume_audio = () => {
                if (p.audio_ctx.state === "suspended") {
                    p.audio_ctx.resume();
                    setTimeout(resume_audio, 100);
                }
            }
            resume_audio();
        }

        p.iir = p.audio_ctx.createBiquadFilter();
        p.iir.type = "peaking";
        p.iir.frequency.value = 10;
        p.iir.Q.value = 0.33;
        p.panner = p.audio_ctx.createStereoPanner();
        p.panner.connect(p.iir);
        (async () => {
            await p.audio_ctx.audioWorklet.addModule(new URL("audio-worklet.mjs", import.meta.url));
            const worklet = new AudioWorkletNode(p.audio_ctx, "send-frame");
            p.iir.connect(worklet);
            worklet.port.onmessage = (msg) => p.ring_buffer ? this.#ring_buffer_write(msg.data) : 0;
        })().catch(e => console.error(e));

        for (const attr of Object.keys(OBSERVED_ATTRIBUTES))
            this.#update_attribute(attr);
    }

    attributeChangedCallback(name, old_val, val) {
        if (name == "data-inputs")
            return this.#update_input_elements(val);
        else
            return this.#update_attribute(name, val);
    }

    #update_input_elements = (val) => {
        const p = this.#private;
        const src = p.showcqt_element_input_source;
        val = val ? val : "";
        const new_elems = [];
        try {
            for (const elem of document.querySelectorAll(val)) {
                try {
                    const k = p.i_elems.indexOf(elem);
                    if (k >= 0) {
                        p.i_elems[k] = null;
                        new_elems.push(elem);
                        continue;
                    }

                    if (elem[src]) {
                        if (elem[src].context == p.audio_ctx) {
                            elem[src].connect(this.audio_input);
                            elem[src].connect(p.audio_ctx.destination);
                            new_elems.push(elem);
                        }
                    } else {
                        elem[src] = p.audio_ctx.createMediaElementSource(elem);
                        elem[src].connect(this.audio_input);
                        elem[src].connect(p.audio_ctx.destination);
                        new_elems.push(elem);
                    }
                } catch { }
            }
        } catch { }

        for (const elem of p.i_elems)
            if (elem)
                elem[src].disconnect();

        p.i_elems = new_elems;
    };

    #update_attribute = (name, val) => {
        const p = this.#private;
        const attr = OBSERVED_ATTRIBUTES;
        val = val ? val : undefined;
        const prop = name.substring(5);
        switch (name) {
            case "data-axis":
                p.axis.src = val ? val : attr[name].def;
                break;
            case "data-waterfall":
            case "data-brightness":
            case "data-bar":
            case "data-bass":
            case "data-interval":
            case "data-speed":
            case "data-scale-x":
            case "data-scale-y":
                val = Math.max(attr[name].min, Math.min(attr[name].max, isNaN(val*1) ? attr[name].def : val*1));
                if (prop == "interval" || prop == "speed") val = Math.round(val);
                if (prop == "waterfall" || prop == "scale-x" || prop == "scale-y") p.layout_changed = p.layout_changed || (p[prop] !== val);
                (prop == "bass") ? p.iir.gain.value = val : p[prop] = val;
                break;
            case "data-opacity":
                val = (val == "transparent" || val == "opaque") ? val : attr[name].def;
                if (p.opacity === val)
                    break;
                p.opacity = val;
                p.canvas.style.pointerEvents = (p.opacity == "opaque") ? "auto" : "none";
                this.#create_alpha_table();
                this.#clear_bar();
                break;
            default:
                throw new Error("unreached");
        }
    };

    connectedCallback() {
        const p = this.#private;
        if (this.isConnected) {
            !p.is_active_render ? requestAnimationFrame(this.#render) : 0;
            p.is_active_render = true;
        } else {
            p.is_active_render = false;
        }
    }

    disconnectedCallback() {
        this.connectedCallback();
    }

    get audio_context() {
        return this.#private.audio_ctx;
    }

    get audio_input() {
        return this.#private.panner;
    }

    get input_elements() {
        return this.#private.i_elems;
    }

    render_pause() {
        this.#private.is_paused = true;
    }

    render_play() {
        this.#private.is_paused = false;
    }

    get render_is_paused() {
        return this.#private.is_paused;
    }

    render_clear() {
        this.#clear_canvas();
    }

    #render = (time) => {
        const p = this.#private;
        if (p.is_active_render)
            requestAnimationFrame(this.#render);

        if (!p.cqt)
            return;

        p.render_count++;
        p.render_count = p.render_count < p.interval ? p.render_count : 0;
        if (p.render_count)
            return;

        this.render_callback?.();

        const width = Math.round(p.container.clientWidth * p["scale-x"] / 100);
        const height = Math.round(p.container.clientHeight * p["scale-y"] / 100);
        const scale_y = height / p.container.clientHeight;

        if (width <= 0 || height <= 0)
            return;

        if (width !== p.width || height !== p.height || p.layout_changed) {
            let old_waterfall = null;
            if (width !== p.width) {
                p.cqt.init(p.audio_ctx.sampleRate, width, height, 4, 4, 4, true);
                if (!p.ring_buffer) {
                    p.ring_size = 4 * p.cqt.fft_size;
                    p.ring_buffer = [
                        new Float32Array(p.ring_size),
                        new Float32Array(p.ring_size)
                    ];
                    p.ring_read = 0;
                    p.ring_write = p.cqt.fft_size;
                    p.ring_mask = p.ring_size - 1;
                }
            } else if (p.sono_h) {
                old_waterfall = p.canvas_buffer.data.subarray(4 * p.width * (p.bar_h + p.axis_h));
            }

            p.layout_changed = false;
            p.width = width;
            p.height = height;

            p.sono_h = Math.round(p.waterfall * height / 100);
            p.axis_h = Math.round(p.container.clientWidth * 32 / 1920 * scale_y);
            p.bar_h = height - p.axis_h - p.sono_h;

            if (p.bar_h < 1) {
                p.sono_h += p.bar_h -1;
                p.bar_h = 1;
            }

            if (p.sono_h < 0) {
                p.axis_h += p.sono_h;
                p.sono_h = 0;
            }

            p.axis.style.bottom = p.sono_h / scale_y + "px";
            p.axis.style.width = p.container.clientWidth + "px";
            p.axis.style.height = p.axis_h / scale_y + "px";
            p.canvas.width = width;
            p.canvas.height = height;
            p.canvas.style.width = p.container.clientWidth + "px";
            p.canvas.style.height = p.container.clientHeight + "px";
            p.blocker.style.width = p.container.clientWidth + "px";
            p.blocker.style.height = (p.sono_h + p.axis_h + 0.1 * p.bar_h) / scale_y + "px";
            p.canvas_buffer = p.canvas_ctx.createImageData(width, height);
            this.#create_alpha_table();
            this.#clear_canvas();
            if (old_waterfall && p.sono_h)
                p.canvas_buffer.data.set(old_waterfall.subarray(0,
                                         Math.min(old_waterfall.length, 4 * p.width * p.sono_h)),
                                         4 * p.width * (p.bar_h + p.axis_h));
        }

        if (!p.is_paused) {
            this.#cqt_render(time - p.last_time);
            p.last_time = time;
        }

        if (p.canvas_is_dirty)
            p.canvas_ctx.putImageData(p.canvas_buffer, 0, 0);

        p.canvas_is_dirty = false;
    };

    #create_alpha_table = () => {
        const p = this.#private;
        if (p.height > 0) {
            p.alpha_table = new Uint8Array(p.height);
            for (let y = 0; y < p.height; y++)
                p.alpha_table[y] = (p.opacity == "opaque" || y >= p.bar_h) ? 255 :
                    Math.round(255 * Math.sin(0.5 * Math.PI * y / p.bar_h)**2);
        }
    };

    #clear_bar = () => {
        const p = this.#private;
        if (!p.canvas_buffer)
            return;

        for (let y = 0, data = p.canvas_buffer.data, addr = 3; y < p.bar_h; y++)
            for (let x = 0, alpha = p.alpha_table[y]; x < p.width; x++, addr += 4)
                data[addr] = alpha;

        p.canvas_is_dirty = true;
    };

    #clear_canvas = () => {
        const p = this.#private;
        if (!p.canvas_buffer)
            return;

        const data = new Uint32Array(p.canvas_buffer.data.buffer, p.canvas_buffer.data.byteOffset, p.width * p.height);
        for (let y = 0; y < p.height; y++)
            data.fill(p.alpha_table[y] << 24, y * p.width, (y + 1) * p.width);

        p.sono_dirty_h = 0;
        p.canvas_is_dirty = true;
    };

    #calc_delta = (buffer_delta, ideal_delta) => {
        const ratio = buffer_delta / ideal_delta;
        const scale = (ratio < 1.5) ? 1 - 0.4 * (1.5 - ratio)**2 : 1 + 0.01 * (ratio - 1.5)**3;
        return Math.min(buffer_delta, Math.round(ideal_delta * scale));
    };

    #cqt_render = (delta_time) => {
        const p = this.#private;
        const buffer_delta = (p.ring_write - p.cqt.fft_size - p.ring_read) & p.ring_mask;
        const ideal_delta = delta_time !== delta_time ? buffer_delta : delta_time * p.audio_ctx.sampleRate / 1000;
        const delta = this.#calc_delta(buffer_delta, ideal_delta);

        p.ring_read = (p.ring_read + delta) & p.ring_mask;
        this.#ring_buffer_read(p.ring_read);

        const is_silent = p.cqt.detect_silence(1e-14);

        if (is_silent && p.sono_dirty_h <= 0)
            return;

        p.cqt.set_height(p.bar_h);
        p.cqt.set_volume(p.bar, p.brightness);
        p.cqt.calc();
        this.actual_render_callback?.(p.cqt.color);

        const data = p.canvas_buffer.data;

        for (let y = 0; y < p.bar_h + p.axis_h; y++) {
            if (y <= p.bar_h)
                p.cqt.render_line_alpha(y, p.alpha_table[y]);
            data.set(p.cqt.output, 4 * y * p.width);
        }

        if (p.sono_h) {
            const line_start = p.bar_h + p.axis_h;
            const line_target = Math.min(p.bar_h + p.axis_h + p.speed, p.height - 1);
            if (line_target > line_start)
                data.copyWithin(line_target * 4 * p.width, line_start * 4 * p.width);
            data.set(p.cqt.output, 4 * p.width * line_start);
            for (let y = 1; y < p.speed && line_start + y < p.height; y++) {
                this.#ring_buffer_read(Math.round(p.ring_read - y * delta / p.speed) & p.ring_mask);
                p.cqt.calc();
                this.actual_render_callback?.(p.cqt.color);
                p.cqt.render_line_opaque(p.bar_h);
                data.set(p.cqt.output, 4 * p.width * (line_start + y));
            }
        }

        p.sono_dirty_h = is_silent ? p.sono_dirty_h - p.speed : p.sono_h + 2 * p.speed;
        p.canvas_is_dirty = true;
    };

    #ring_buffer_write = (data) => {
        const p = this.#private;
        const len = data[0].length, size = p.ring_size;
        const w = p.ring_write, mask = p.ring_mask, buf = p.ring_buffer;

        if (w + len <= size) {
            buf[0].set(data[0], w);
            buf[1].set(data[1], w);
        } else {
            for (let c = 0; c < 2; c++) {
                buf[c].set(data[c].subarray(0, size - w), w);
                buf[c].set(data[c].subarray(size - w), 0);
            }
        }

        p.ring_write = (w + len) & mask;

    };

    #ring_buffer_read = (idx) => {
        const p = this.#private;
        const len = p.cqt.fft_size, size = p.ring_size;
        const mask = p.ring_mask, buf = p.ring_buffer, dst = p.cqt.inputs;

        if (idx + len <= size) {
            dst[0].set(buf[0].subarray(idx, idx+len));
            dst[1].set(buf[1].subarray(idx, idx+len));
        } else {
            for (let c = 0; c < 2; c++) {
                dst[c].set(buf[c].subarray(idx, size));
                dst[c].set(buf[c].subarray(0, idx + len - size), size - idx);
            }
        }
    };

    #private = {
        showcqt_element_input_source: Symbol("showcqt_element_input_source"),

        // layout
        width: 0,
        height: 0,
        waterfall: 0,
        axis_h: 0,
        sono_h: 0,
        bar_h: 0,
        opacity: false,
        speed: 0,
        layout_changed: false,
        brightness: 0,
        bar: 0,
        interval: 0,
        "scale-x": 0,
        "scale-y": 0,

        // elements
        container: null,
        blocker: null,
        canvas: null,
        axis: null,
        canvas_ctx: null,
        canvas_buffer: null,

        // input elements
        i_elems: [],

        // context
        cqt: null,
        audio_ctx: null,
        iir: null,
        panner: null,

        // render state
        alpha_table: null,
        is_active_render: false,
        render_count: 0,
        canvas_is_dirty: false,
        is_paused: false,
        sono_dirty_h: 0,

        last_time: NaN,

        // ring buffer
        ring_buffer: null,
        ring_size: 0,
        ring_write: 0,
        ring_read: 0,
        ring_mask: 0
    };
}

if (CustomElementRegistry.prototype.get.call(customElements, "showcqt-element"))
    console.warn("multiple definition of showcqt-element");
else
    CustomElementRegistry.prototype.define.call(customElements, "showcqt-element", ShowCQTElement);
