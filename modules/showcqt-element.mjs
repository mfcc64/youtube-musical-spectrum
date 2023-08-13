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
import ShowCQT from "./showcqt.mjs";

const DEFAULT_AXIS_SRC      = `${new URL("axis-1920x32.png", import.meta.url)}`;
const DEFAULT_WATERFALL     = 33,   MIN_WATERFALL   = 0,    MAX_WATERFALL   = 100;
const DEFAULT_BRIGHTNESS    = 17,   MIN_BRIGHTNESS  = 1,    MAX_BRIGHTNESS  = 100;
const DEFAULT_BAR           = 17,   MIN_BAR         = 1,    MAX_BAR         = 100;
const DEFAULT_BASS          = -30,  MIN_BASS        = -50,  MAX_BASS        = 0;
const DEFAULT_INTERVAL      = 1,    MIN_INTERVAL    = 1,    MAX_INTERVAL    = 4;
const DEFAULT_SPEED         = 2,    MIN_SPEED       = 1,    MAX_SPEED       = 12;
const DEFAULT_OPACITY       = "opaque";

const OBSERVED_ATTRIBUTES = [
    "data-axis",
    "data-waterfall",
    "data-brightness",
    "data-bar",
    "data-bass",
    "data-interval",
    "data-speed",
    "data-opacity"
];

// HTMLElement, customElements.get, customElements.define are hijacked by youtube custom-elements-es5-adapter.js
// Hopefully nobody hijacks HTMLDivElement
const HTMLElement = Object.getPrototypeOf(HTMLDivElement);
class ShowCQTElement extends HTMLElement {
    static version = "1.1.0";

    static global_audio_context;

    static get observedAttributes() {
        return [...OBSERVED_ATTRIBUTES, "data-inputs"];
    }

    constructor() {
        super();
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

        (async () => { this.#cqt = await ShowCQT.instantiate(); })();
        this.#container = shadow.getElementById("container");
        this.#blocker   = shadow.getElementById("blocker");
        this.#canvas    = shadow.getElementById("canvas");
        this.#axis      = shadow.getElementById("axis");
        this.#canvas_ctx = this.#canvas.getContext("2d");


        this.#audio_ctx = ShowCQTElement.global_audio_context;
        if (!this.#audio_ctx) {
            this.#audio_ctx = new AudioContext();
            // FIXME
            var resume_audio = () => {
                if (this.#audio_ctx.state === "suspended") {
                    this.#audio_ctx.resume();
                    setTimeout(resume_audio, 100);
                }
            }
            resume_audio();
        }

        this.#iir = this.#audio_ctx.createBiquadFilter();
        this.#iir.type = "peaking";
        this.#iir.frequency.value = 10;
        this.#iir.Q.value = 0.33;
        this.#panner = this.#audio_ctx.createStereoPanner();
        this.#panner.connect(this.#iir);
        (async () => {
            await this.#audio_ctx.audioWorklet.addModule(new URL("audio-worklet.mjs", import.meta.url));
            const worklet = new AudioWorkletNode(this.#audio_ctx, "send-frame");
            this.#iir.connect(worklet);
            worklet.port.onmessage = (msg) => this.#ring_buffer ? this.#ring_buffer_write(msg.data) : 0;
        })().catch(e => console.error(e));

        for (const attr of OBSERVED_ATTRIBUTES)
            this.#update_attribute(attr);
    }

    attributeChangedCallback(name, old_val, val) {
        if (name == "data-inputs")
            return this.#update_input_elements(val);
        else
            return this.#update_attribute(name, val);
    }

    #showcqt_element_input_source = Symbol("showcqt_element_input_source");

    #update_input_elements(val) {
        const src = this.#showcqt_element_input_source;
        val = val ? val : "";
        const new_elems = [];
        try {
            for (const elem of document.querySelectorAll(val)) {
                try {
                    const k = this.#i_elems.indexOf(elem);
                    if (k >= 0) {
                        this.#i_elems[k] = null;
                        new_elems.push(elem);
                        continue;
                    }

                    if (elem[src]) {
                        if (elem[src].context == this.#audio_ctx) {
                            elem[src].connect(this.audio_input);
                            elem[src].connect(this.#audio_ctx.destination);
                            new_elems.push(elem);
                        }
                    } else {
                        elem[src] = this.#audio_ctx.createMediaElementSource(elem);
                        elem[src].connect(this.audio_input);
                        elem[src].connect(this.#audio_ctx.destination);
                        new_elems.push(elem);
                    }
                } catch { }
            }
        } catch { }

        for (const elem of this.#i_elems)
            if (elem)
                elem[src].disconnect();

        this.#i_elems = new_elems;
    }

    #update_attribute(name, val) {
        val = val ? val : undefined;
        switch (name) {
            case "data-axis":
                this.#axis.src = val ? val : DEFAULT_AXIS_SRC;
                break;
            case "data-waterfall":
                this.#waterfall = Math.max(MIN_WATERFALL, Math.min(MAX_WATERFALL, isNaN(val*1) ? DEFAULT_WATERFALL : val*1));
                this.#layout_changed = true;
                break;
            case "data-brightness":
                this.#brightness = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, isNaN(val*1) ? DEFAULT_BRIGHTNESS : val*1));
                break;
            case "data-bar":
                this.#bar = Math.max(MIN_BAR, Math.min(MAX_BAR, isNaN(val*1) ? DEFAULT_BAR : val*1));
                break;
            case "data-bass":
                this.#iir.gain.value = Math.max(MIN_BASS, Math.min(MAX_BASS, isNaN(val*1) ? DEFAULT_BASS : val*1));
                break;
            case "data-interval":
                this.#interval = Math.max(MIN_INTERVAL, Math.min(MAX_INTERVAL, isNaN(val*1) ? DEFAULT_INTERVAL : Math.round(val*1)));
                break;
            case "data-speed":
                this.#speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, isNaN(val*1) ? DEFAULT_SPEED : Math.round(val*1)));
                break;
            case "data-opacity":
                this.#opacity = (val == "transparent" || val == "opaque") ? val : DEFAULT_OPACITY;
                this.#canvas.style.pointerEvents = (this.#opacity == "opaque") ? "auto" : "none";
                this.#create_alpha_table();
                this.#clear_canvas();
                break;
            default:
                throw new Error("unreached");
        }
    }

    connectedCallback() {
        if (this.isConnected) {
            !this.#is_active_render ? requestAnimationFrame(this.#render.bind(this)) : 0;
            this.#is_active_render = true;
        } else {
            this.#is_active_render = false;
        }
    }

    disconnectedCallback() {
        this.connectedCallback();
    }

    get audio_context() {
        return this.#audio_ctx;
    }

    get audio_input() {
        return this.#panner;
    }

    get input_elements() {
        return this.#i_elems;
    }

    render_pause() {
        this.#is_paused = true;
    }

    render_play() {
        this.#is_paused = false;
    }

    get render_is_paused() {
        return this.#is_paused;
    }

    render_clear() {
        this.#clear_canvas();
    }

    // layout
    #width;
    #height;
    #waterfall;
    #axis_h;
    #sono_h;
    #bar_h;
    #opacity;
    #speed;
    #layout_changed;
    #brightness;
    #bar;
    #interval;

    // elements
    #container;
    #blocker;
    #canvas;
    #axis;
    #canvas_ctx;
    #canvas_buffer;

    // input elements
    #i_elems = [];

    // context
    #cqt;
    #audio_ctx;
    #iir;
    #panner;

    // render state
    #alpha_table;
    #is_active_render = false;
    #render_count = 0;
    #canvas_is_dirty = false;
    #is_paused = false;
    #sono_dirty_h = 0;

    #last_time = NaN;

    #render(time) {
        if (this.#is_active_render)
            requestAnimationFrame(this.#render.bind(this));

        if (!this.#cqt)
            return;

        this.#render_count++;
        this.#render_count = this.#render_count < this.#interval ? this.#render_count : 0;
        if (this.#render_count)
            return;

        this.render_callback?.();

        const width = this.#container.clientWidth;
        const height = this.#container.clientHeight;

        if (width <= 0 || height <= 0)
            return;

        if (width !== this.#width || height !== this.#height || this.#layout_changed) {
            if (width !== this.#width) {
                this.#cqt.init(this.#audio_ctx.sampleRate, width, height, 4, 4, 4, true);
                if (!this.#ring_buffer) {
                    this.#ring_size = 4 * this.#cqt.fft_size;
                    this.#ring_buffer = [
                        new Float32Array(this.#ring_size),
                        new Float32Array(this.#ring_size)
                    ];
                    this.#ring_read = 0;
                    this.#ring_write = this.#cqt.fft_size;
                    this.#ring_mask = this.#ring_size - 1;
                }
            }

            this.#layout_changed = false;
            this.#width = width;
            this.#height = height;

            this.#sono_h = Math.round(this.#waterfall * height / 100);
            this.#axis_h = Math.round(width * 32 / 1920);
            this.#bar_h = height - this.#axis_h - this.#sono_h;

            if (this.#bar_h < 1) {
                this.#sono_h += this.#bar_h -1;
                this.#bar_h = 1;
            }

            if (this.#sono_h < 0) {
                this.#axis_h += this.#sono_h;
                this.#sono_h = 0;
            }

            this.#axis.style.bottom = this.#sono_h + "px";
            this.#axis.style.width = width + "px";
            this.#axis.style.height = this.#axis_h + "px";
            this.#canvas.width = width;
            this.#canvas.height = height;
            this.#blocker.style.width = width + "px";
            this.#blocker.style.height = this.#sono_h + this.#axis_h + Math.round(0.1 * this.#bar_h) + "px";
            this.#canvas_buffer = this.#canvas_ctx.createImageData(width, height);
            this.#create_alpha_table();
            this.#clear_canvas();
        }

        if (!this.#is_paused) {
            this.#cqt_render(time - this.#last_time);
            this.#last_time = time;
        }

        if (this.#canvas_is_dirty)
            this.#canvas_ctx.putImageData(this.#canvas_buffer, 0, 0);

        this.#canvas_is_dirty = false;
    }

    #create_alpha_table() {
        if (this.#height > 0) {
            this.#alpha_table = new Uint8Array(this.#height);
            for (let y = 0; y < this.#height; y++)
                this.#alpha_table[y] = (this.#opacity == "opaque" || y >= this.#bar_h) ? 255 :
                    Math.round(255 * Math.sin(0.5 * Math.PI * y / this.#bar_h)**2);
        }
    }

    #clear_canvas() {
        if (!this.#canvas_buffer)
            return;

        const data = this.#canvas_buffer.data;
        for (let y = 0; y < this.#height; y++) {
            const alpha = this.#alpha_table[y];
            const line = 4 * y * this.#width;
            for (let x = 0; x < 4 * this.#width; x += 4) {
                data[line + x] = 0;
                data[line + x + 1] = 0;
                data[line + x + 2] = 0;
                data[line + x + 3] = alpha;
            }
        }

        this.#sono_dirty_h = 0;
        this.#canvas_is_dirty = true;
    }

    #calc_delta(buffer_delta, ideal_delta) {
        const ratio = buffer_delta / ideal_delta;
        const scale = (ratio < 1.5) ? 1 - 0.4 * (1.5 - ratio)**2 : 1 + 0.01 * (ratio - 1.5)**3;
        return Math.min(buffer_delta, Math.round(ideal_delta * scale));
    }

    #cqt_render(delta_time) {
        const buffer_delta = (this.#ring_write - this.#cqt.fft_size - this.#ring_read) & this.#ring_mask;
        const ideal_delta = delta_time !== delta_time ? buffer_delta : delta_time * this.#audio_ctx.sampleRate / 1000;
        const delta = this.#calc_delta(buffer_delta, ideal_delta);

        this.#ring_read = (this.#ring_read + delta) & this.#ring_mask;
        this.#ring_buffer_read(this.#ring_read);

        const is_silent = this.#cqt.detect_silence(1e-14);

        if (is_silent && this.#sono_dirty_h <= 0)
            return;

        this.#cqt.set_height(this.#bar_h);
        this.#cqt.set_volume(this.#bar, this.#brightness);
        this.#cqt.calc();
        this.actual_render_callback?.(this.#cqt.color);

        const data = this.#canvas_buffer.data;

        for (let y = 0; y < this.#bar_h + this.#axis_h; y++) {
            if (y <= this.#bar_h)
                this.#cqt.render_line_alpha(y, this.#alpha_table[y]);
            data.set(this.#cqt.output, 4 * y * this.#width);
        }

        if (this.#sono_h) {
            const line_start = this.#bar_h + this.#axis_h;
            const line_target = Math.min(this.#bar_h + this.#axis_h + this.#speed, this.#height - 1);
            if (line_target > line_start)
                data.copyWithin(line_target * 4 * this.#width, line_start * 4 * this.#width);
            data.set(this.#cqt.output, 4 * this.#width * line_start);
            for (let y = 1; y < this.#speed && line_start + y < this.#height; y++) {
                this.#ring_buffer_read(Math.round(this.#ring_read - y * delta / this.#speed) & this.#ring_mask);
                this.#cqt.calc();
                this.actual_render_callback?.(this.#cqt.color);
                this.#cqt.render_line_opaque(this.#bar_h);
                data.set(this.#cqt.output, 4 * this.#width * (line_start + y));
            }
        }

        this.#sono_dirty_h = is_silent ? this.#sono_dirty_h - this.#speed : this.#sono_h + 2 * this.#speed;
        this.#canvas_is_dirty = true;
    }

    // ring buffer
    #ring_buffer;
    #ring_size;
    #ring_write;
    #ring_read;
    #ring_mask;

    #ring_buffer_write(data) {
        const len = data[0].length, size = this.#ring_size;
        const w = this.#ring_write, mask = this.#ring_mask, buf = this.#ring_buffer;

        if (w + len <= size) {
            buf[0].set(data[0], w);
            buf[1].set(data[1], w);
        } else {
            for (let c = 0; c < 2; c++) {
                buf[c].set(data[c].subarray(0, size - w), w);
                buf[c].set(data[c].subarray(size - w), 0);
            }
        }

        this.#ring_write = (w + len) & mask;

    }

    #ring_buffer_read(idx) {
        const len = this.#cqt.fft_size, size = this.#ring_size;
        const mask = this.#ring_mask, buf = this.#ring_buffer, dst = this.#cqt.inputs;

        if (idx + len <= size) {
            dst[0].set(buf[0].subarray(idx, idx+len));
            dst[1].set(buf[1].subarray(idx, idx+len));
        } else {
            for (let c = 0; c < 2; c++) {
                dst[c].set(buf[c].subarray(idx, size));
                dst[c].set(buf[c].subarray(0, idx + len - size), size - idx);
            }
        }
    }
}

if (CustomElementRegistry.prototype.get.call(customElements, "showcqt-element"))
    console.warn("multiple definition of showcqt-element");
else
    CustomElementRegistry.prototype.define.call(customElements, "showcqt-element", ShowCQTElement);
