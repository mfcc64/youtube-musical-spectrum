/*
 * Copyright (c) 2023 Muhammad Faiz <mfcc64@gmail.com>
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

class SendFrameProcessor extends AudioWorkletProcessor {
    process(inputs) {
        this.port.postMessage(inputs[0]);
        return true;
    }
}

class SendFrameDebugProcessor extends AudioWorkletProcessor {
    #size = 3 * 128;
    #buffer = [new Float32Array(this.#size), new Float32Array(this.#size)];
    #index = 0;

    process(inputs) {
        this.#buffer[0].set(inputs[0][0], this.#index);
        this.#buffer[1].set(inputs[0][1], this.#index);
        this.#index = (this.#index + inputs[0][0].length) % this.#size;
        if (!this.#index)
            this.port.postMessage(this.#buffer);
        return true;
    }
}

registerProcessor("send-frame", SendFrameProcessor);
registerProcessor("send-frame-debug", SendFrameDebugProcessor);
