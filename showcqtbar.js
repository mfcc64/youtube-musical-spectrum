/*
 * Copyright (c) 2017 Muhammad Faiz <mfcc64@gmail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
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

/* Audio visualization based on showcqtbar mpv/ffmpeg audio visualization */
/* See https://github.com/mfcc64/html5-showcqtbar/blob/master/showcqtbar.js */
/* See https://github.com/FFmpeg/FFmpeg/blob/master/libavfilter/avf_showcqt.c */
/* See common.js for usage example */

function ShowCQTBar(rate, width, height, bar_v, sono_v, supersampling) {
    // constaints:
    // 0 < rate <= 96000 (actually slightly above 96000)
    // 0 < width <= 7680
    // 0 < height <= 4320
    // 1.0 <= bar_v <= 100.0
    // 1.0 <= sono_v <= 100.0

    this.rate = rate;
    this.width = width;
    this.height = height;
    this.buffer = new ArrayBuffer(8*1024*1024);
    this.asm = this.emscripten(window, null, this.buffer);
    this.fft_size = this.asm._init(rate, width, height, bar_v, sono_v, supersampling);
    if (!this.fft_size)
        throw ("Error initializing asm module");
    /* idx=0 : left, idx=1 : right */
    this.get_input_array = function(idx) {
        return new Float32Array(this.buffer, this.asm._get_input_array(idx), this.fft_size);
    }
    this.get_output_array = function() {
        return new Uint8ClampedArray(this.buffer, this.asm._get_output_array(), this.width*4);
    }
    /* calculate cqt from input_array */
    this.calc = function() { this.asm._calc(); }
    /* render showcqtbar at line y to output_array */
    this.render_line = function(y, alpha) {
        if (alpha == undefined)
            alpha = 255;
        this.asm._render_line(y, alpha);
    }
    /* set volume at runtime */
    this.set_volume = function(bar_v, sono_v) { this.asm._set_volume(bar_v, sono_v); }
    /* set height at runtime */
    this.set_height = function(height) { this.asm._set_height(height); }
}


ShowCQTBar.prototype.emscripten = function(global, env, buffer) {
'use asm';


  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntS = 0, tempValue = 0, tempDouble = 0.0;
  var tempRet0 = 0;

  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_max=global.Math.max;
  var Math_clz32=global.Math.clz32;
  var Math_fround=global.Math.fround;
  var tempFloat = Math_fround(0);
  const f0 = Math_fround(0);

// EMSCRIPTEN_START_FUNCS

function _calc() {
 var i1 = 0, i2 = 0, i3 = 0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, f8 = f0, i9 = 0, i10 = 0, i11 = 0, i12 = 0, i13 = 0, f14 = f0, f15 = f0, f16 = f0, f17 = f0, f18 = f0, f19 = f0, f20 = f0;
 i9 = HEAP32[298370] | 0;
 i2 = i9 >> 1;
 i9 = i9 >> 2;
 i1 = HEAP32[298372] | 0;
 i10 = i2 - i1 | 0;
 if ((i1 | 0) > 0) {
  i3 = i10 + i2 | 0;
  i4 = i10 + i9 | 0;
  i2 = 0;
  do {
   i1 = HEAP16[621056 + (i2 << 1) >> 1] << 2;
   i13 = i2 + i10 | 0;
   i12 = HEAP32[131584 + (i13 << 2) >> 2] | 0;
   HEAP32[654848 + (i1 << 3) >> 2] = HEAP32[512 + (i13 << 2) >> 2];
   HEAP32[654848 + (i1 << 3) + 4 >> 2] = i12;
   i12 = 637440 + (i2 << 2) | 0;
   f8 = Math_fround(HEAPF32[i12 >> 2]);
   i13 = i3 + i2 | 0;
   i11 = i1 | 1;
   HEAPF32[654848 + (i11 << 3) >> 2] = Math_fround(f8 * Math_fround(HEAPF32[512 + (i13 << 2) >> 2]));
   f8 = Math_fround(HEAPF32[i12 >> 2]);
   HEAPF32[654848 + (i11 << 3) + 4 >> 2] = Math_fround(f8 * Math_fround(HEAPF32[131584 + (i13 << 2) >> 2]));
   i11 = i1 | 2;
   i13 = i4 + i2 | 0;
   i12 = HEAP32[131584 + (i13 << 2) >> 2] | 0;
   HEAP32[654848 + (i11 << 3) >> 2] = HEAP32[512 + (i13 << 2) >> 2];
   HEAP32[654848 + (i11 << 3) + 4 >> 2] = i12;
   i1 = i1 | 3;
   HEAPF32[654848 + (i1 << 3) >> 2] = Math_fround(0.0);
   HEAPF32[654848 + (i1 << 3) + 4 >> 2] = Math_fround(0.0);
   i2 = i2 + 1 | 0;
   i1 = HEAP32[298372] | 0;
  } while ((i2 | 0) < (i1 | 0));
 }
 if ((i1 | 0) < (i9 | 0)) {
  i2 = i10 + i9 | 0;
  do {
   i13 = HEAP16[621056 + (i1 << 1) >> 1] << 2;
   i4 = i1 + i10 | 0;
   i12 = HEAP32[131584 + (i4 << 2) >> 2] | 0;
   HEAP32[654848 + (i13 << 3) >> 2] = HEAP32[512 + (i4 << 2) >> 2];
   HEAP32[654848 + (i13 << 3) + 4 >> 2] = i12;
   i12 = i13 | 1;
   HEAPF32[654848 + (i12 << 3) >> 2] = Math_fround(0.0);
   HEAPF32[654848 + (i12 << 3) + 4 >> 2] = Math_fround(0.0);
   i12 = i13 | 2;
   i4 = i2 + i1 | 0;
   i11 = HEAP32[131584 + (i4 << 2) >> 2] | 0;
   HEAP32[654848 + (i12 << 3) >> 2] = HEAP32[512 + (i4 << 2) >> 2];
   HEAP32[654848 + (i12 << 3) + 4 >> 2] = i11;
   i13 = i13 | 3;
   HEAPF32[654848 + (i13 << 3) >> 2] = Math_fround(0.0);
   HEAPF32[654848 + (i13 << 3) + 4 >> 2] = Math_fround(0.0);
   i1 = i1 + 1 | 0;
  } while ((i1 | 0) != (i9 | 0));
 }
 i1 = HEAP32[298370] | 0;
 L11 : do if ((i1 | 0) < 8192) switch (i1 | 0) {
 case 1024:
  {
   _fft_calc_1024(654848);
   break L11;
  }
 case 2048:
  {
   _fft_calc_2048(654848);
   break L11;
  }
 case 4096:
  {
   _fft_calc_4096(654848);
   break L11;
  }
 default:
  break L11;
 } else {
  if ((i1 | 0) < 16384) {
   switch (i1 | 0) {
   case 8192:
    break;
   default:
    break L11;
   }
   _fft_calc_8192(654848);
   break;
  }
  if ((i1 | 0) < 32768) {
   switch (i1 | 0) {
   case 16384:
    break;
   default:
    break L11;
   }
   _fft_calc_4096(654848);
   _fft_calc_4096(687616);
   _fft_calc_4096(720384);
   _fft_calc_4096(753152);
   f14 = Math_fround(HEAPF32[163712]);
   f15 = Math_fround(HEAPF32[163713]);
   f6 = Math_fround(HEAPF32[171904]);
   f5 = Math_fround(HEAPF32[171905]);
   f19 = Math_fround(HEAPF32[180096]);
   f18 = Math_fround(HEAPF32[180097]);
   f8 = Math_fround(HEAPF32[188288]);
   f7 = Math_fround(HEAPF32[188289]);
   f16 = Math_fround(f14 + f6);
   f17 = Math_fround(f15 + f5);
   f6 = Math_fround(f14 - f6);
   f5 = Math_fround(f15 - f5);
   f15 = Math_fround(f19 + f8);
   f14 = Math_fround(f18 + f7);
   f8 = Math_fround(f19 - f8);
   f7 = Math_fround(f18 - f7);
   f18 = Math_fround(f17 + f14);
   HEAPF32[163712] = Math_fround(f16 + f15);
   HEAPF32[163713] = f18;
   f18 = Math_fround(f5 - f8);
   HEAPF32[171904] = Math_fround(f6 + f7);
   HEAPF32[171905] = f18;
   f14 = Math_fround(f17 - f14);
   HEAPF32[180096] = Math_fround(f16 - f15);
   HEAPF32[180097] = f14;
   f8 = Math_fround(f5 + f8);
   HEAPF32[188288] = Math_fround(f6 - f7);
   HEAPF32[188289] = f8;
   i1 = 1;
   do {
    i2 = 654848 + (i1 << 3) | 0;
    f15 = Math_fround(HEAPF32[i2 >> 2]);
    i3 = 654848 + (i1 << 3) + 4 | 0;
    f14 = Math_fround(HEAPF32[i3 >> 2]);
    f8 = Math_fround(HEAPF32[358912 + (i1 << 3) >> 2]);
    i9 = i1 + 4096 | 0;
    i4 = 654848 + (i9 << 3) | 0;
    f5 = Math_fround(HEAPF32[i4 >> 2]);
    f17 = Math_fround(f8 * f5);
    f19 = Math_fround(HEAPF32[358912 + (i1 << 3) + 4 >> 2]);
    i9 = 654848 + (i9 << 3) + 4 | 0;
    f16 = Math_fround(HEAPF32[i9 >> 2]);
    f17 = Math_fround(f17 - Math_fround(f19 * f16));
    f16 = Math_fround(Math_fround(f5 * f19) + Math_fround(f8 * f16));
    f8 = Math_fround(HEAPF32[424448 + (i1 << 3) >> 2]);
    i11 = i1 + 8192 | 0;
    i10 = 654848 + (i11 << 3) | 0;
    f19 = Math_fround(HEAPF32[i10 >> 2]);
    f5 = Math_fround(f8 * f19);
    f20 = Math_fround(HEAPF32[424448 + (i1 << 3) + 4 >> 2]);
    i11 = 654848 + (i11 << 3) + 4 | 0;
    f6 = Math_fround(HEAPF32[i11 >> 2]);
    f5 = Math_fround(f5 - Math_fround(f20 * f6));
    f6 = Math_fround(Math_fround(f19 * f20) + Math_fround(f8 * f6));
    f8 = Math_fround(HEAPF32[391680 + (i1 << 3) >> 2]);
    i13 = i1 + 12288 | 0;
    i12 = 654848 + (i13 << 3) | 0;
    f20 = Math_fround(HEAPF32[i12 >> 2]);
    f19 = Math_fround(f8 * f20);
    f7 = Math_fround(HEAPF32[391680 + (i1 << 3) + 4 >> 2]);
    i13 = 654848 + (i13 << 3) + 4 | 0;
    f18 = Math_fround(HEAPF32[i13 >> 2]);
    f19 = Math_fround(f19 - Math_fround(f7 * f18));
    f18 = Math_fround(Math_fround(f20 * f7) + Math_fround(f8 * f18));
    f8 = Math_fround(f15 + f17);
    f7 = Math_fround(f14 + f16);
    f17 = Math_fround(f15 - f17);
    f16 = Math_fround(f14 - f16);
    f14 = Math_fround(f5 + f19);
    f15 = Math_fround(f6 + f18);
    f19 = Math_fround(f5 - f19);
    f18 = Math_fround(f6 - f18);
    f6 = Math_fround(f7 + f15);
    HEAPF32[i2 >> 2] = Math_fround(f8 + f14);
    HEAPF32[i3 >> 2] = f6;
    f6 = Math_fround(f16 - f19);
    HEAPF32[i4 >> 2] = Math_fround(f17 + f18);
    HEAPF32[i9 >> 2] = f6;
    f15 = Math_fround(f7 - f15);
    HEAPF32[i10 >> 2] = Math_fround(f8 - f14);
    HEAPF32[i11 >> 2] = f15;
    f19 = Math_fround(f16 + f19);
    HEAPF32[i12 >> 2] = Math_fround(f17 - f18);
    HEAPF32[i13 >> 2] = f19;
    i1 = i1 + 1 | 0;
   } while ((i1 | 0) != 4096);
  } else {
   switch (i1 | 0) {
   case 32768:
    break;
   default:
    break L11;
   }
   _fft_calc_8192(654848);
   _fft_calc_8192(720384);
   _fft_calc_8192(785920);
   _fft_calc_8192(851456);
   f16 = Math_fround(HEAPF32[163712]);
   f15 = Math_fround(HEAPF32[163713]);
   f18 = Math_fround(HEAPF32[180096]);
   f17 = Math_fround(HEAPF32[180097]);
   f6 = Math_fround(HEAPF32[196480]);
   f7 = Math_fround(HEAPF32[196481]);
   f20 = Math_fround(HEAPF32[212864]);
   f19 = Math_fround(HEAPF32[212865]);
   f14 = Math_fround(f16 + f18);
   f8 = Math_fround(f15 + f17);
   f18 = Math_fround(f16 - f18);
   f17 = Math_fround(f15 - f17);
   f15 = Math_fround(f6 + f20);
   f16 = Math_fround(f7 + f19);
   f20 = Math_fround(f6 - f20);
   f19 = Math_fround(f7 - f19);
   f7 = Math_fround(f8 + f16);
   HEAPF32[163712] = Math_fround(f14 + f15);
   HEAPF32[163713] = f7;
   f7 = Math_fround(f17 - f20);
   HEAPF32[180096] = Math_fround(f18 + f19);
   HEAPF32[180097] = f7;
   f16 = Math_fround(f8 - f16);
   HEAPF32[196480] = Math_fround(f14 - f15);
   HEAPF32[196481] = f16;
   f20 = Math_fround(f17 + f20);
   HEAPF32[212864] = Math_fround(f18 - f19);
   HEAPF32[212865] = f20;
   i1 = 1;
   do {
    i2 = 654848 + (i1 << 3) | 0;
    f16 = Math_fround(HEAPF32[i2 >> 2]);
    i3 = 654848 + (i1 << 3) + 4 | 0;
    f15 = Math_fround(HEAPF32[i3 >> 2]);
    f14 = Math_fround(HEAPF32[424448 + (i1 << 3) >> 2]);
    i9 = i1 + 8192 | 0;
    i4 = 654848 + (i9 << 3) | 0;
    f6 = Math_fround(HEAPF32[i4 >> 2]);
    f18 = Math_fround(f14 * f6);
    f20 = Math_fround(HEAPF32[424448 + (i1 << 3) + 4 >> 2]);
    i9 = 654848 + (i9 << 3) + 4 | 0;
    f17 = Math_fround(HEAPF32[i9 >> 2]);
    f18 = Math_fround(f18 - Math_fround(f20 * f17));
    f17 = Math_fround(Math_fround(f6 * f20) + Math_fround(f14 * f17));
    f14 = Math_fround(HEAPF32[555520 + (i1 << 3) >> 2]);
    i11 = i1 + 16384 | 0;
    i10 = 654848 + (i11 << 3) | 0;
    f20 = Math_fround(HEAPF32[i10 >> 2]);
    f6 = Math_fround(f14 * f20);
    f5 = Math_fround(HEAPF32[555520 + (i1 << 3) + 4 >> 2]);
    i11 = 654848 + (i11 << 3) + 4 | 0;
    f7 = Math_fround(HEAPF32[i11 >> 2]);
    f6 = Math_fround(f6 - Math_fround(f5 * f7));
    f7 = Math_fround(Math_fround(f20 * f5) + Math_fround(f14 * f7));
    f14 = Math_fround(HEAPF32[489984 + (i1 << 3) >> 2]);
    i13 = i1 + 24576 | 0;
    i12 = 654848 + (i13 << 3) | 0;
    f5 = Math_fround(HEAPF32[i12 >> 2]);
    f20 = Math_fround(f14 * f5);
    f8 = Math_fround(HEAPF32[489984 + (i1 << 3) + 4 >> 2]);
    i13 = 654848 + (i13 << 3) + 4 | 0;
    f19 = Math_fround(HEAPF32[i13 >> 2]);
    f20 = Math_fround(f20 - Math_fround(f8 * f19));
    f19 = Math_fround(Math_fround(f5 * f8) + Math_fround(f14 * f19));
    f14 = Math_fround(f16 + f18);
    f8 = Math_fround(f15 + f17);
    f18 = Math_fround(f16 - f18);
    f17 = Math_fround(f15 - f17);
    f15 = Math_fround(f6 + f20);
    f16 = Math_fround(f7 + f19);
    f20 = Math_fround(f6 - f20);
    f19 = Math_fround(f7 - f19);
    f7 = Math_fround(f8 + f16);
    HEAPF32[i2 >> 2] = Math_fround(f14 + f15);
    HEAPF32[i3 >> 2] = f7;
    f7 = Math_fround(f17 - f20);
    HEAPF32[i4 >> 2] = Math_fround(f18 + f19);
    HEAPF32[i9 >> 2] = f7;
    f16 = Math_fround(f8 - f16);
    HEAPF32[i10 >> 2] = Math_fround(f14 - f15);
    HEAPF32[i11 >> 2] = f16;
    f20 = Math_fround(f17 + f20);
    HEAPF32[i12 >> 2] = Math_fround(f18 - f19);
    HEAPF32[i13 >> 2] = f20;
    i1 = i1 + 1 | 0;
   } while ((i1 | 0) != 8192);
  }
 } while (0);
 i1 = HEAP32[298371] | 0;
 if ((i1 | 0) > 0) {
  i10 = 0;
  i2 = 0;
  do {
   i9 = HEAP32[1193500 + (i2 << 2) >> 2] | 0;
   i3 = HEAP32[1193500 + (i2 + 1 << 2) >> 2] | 0;
   if (!i9) {
    i13 = 916992 + (i10 << 4) | 0;
    HEAP32[i13 >> 2] = 0;
    HEAP32[i13 + 4 >> 2] = 0;
    HEAP32[i13 + 8 >> 2] = 0;
    HEAP32[i13 + 12 >> 2] = 0;
   } else {
    if ((i9 | 0) > 0) {
     i4 = HEAP32[298370] | 0;
     i1 = i2 + 2 | 0;
     i2 = 0;
     f8 = Math_fround(0.0);
     f7 = Math_fround(0.0);
     f6 = Math_fround(0.0);
     f5 = Math_fround(0.0);
     do {
      i12 = i2 + i3 | 0;
      i13 = i4 - i12 | 0;
      f20 = Math_fround(HEAPF32[1193500 + (i1 + i2 << 2) >> 2]);
      f7 = Math_fround(f7 + Math_fround(f20 * Math_fround(HEAPF32[654848 + (i12 << 3) >> 2])));
      f5 = Math_fround(f5 + Math_fround(f20 * Math_fround(HEAPF32[654848 + (i12 << 3) + 4 >> 2])));
      f8 = Math_fround(f8 + Math_fround(f20 * Math_fround(HEAPF32[654848 + (i13 << 3) >> 2])));
      f6 = Math_fround(f6 + Math_fround(f20 * Math_fround(HEAPF32[654848 + (i13 << 3) + 4 >> 2])));
      i2 = i2 + 1 | 0;
     } while ((i2 | 0) != (i9 | 0));
    } else {
     i1 = i2 + 2 | 0;
     f8 = Math_fround(0.0);
     f7 = Math_fround(0.0);
     f6 = Math_fround(0.0);
     f5 = Math_fround(0.0);
    }
    f17 = Math_fround(f8 + f7);
    f20 = Math_fround(f5 - f6);
    f19 = Math_fround(f6 + f5);
    f18 = Math_fround(f8 - f7);
    f20 = Math_fround(Math_fround(f17 * f17) + Math_fround(f20 * f20));
    f19 = Math_fround(Math_fround(f18 * f18) + Math_fround(f19 * f19));
    f18 = Math_fround(HEAPF32[298373]);
    f17 = Math_fround(Math_fround(Math_sqrt(Math_fround(f18 * Math_fround(Math_sqrt(Math_fround(f20)))))) * Math_fround(255.0));
    i2 = f17 < Math_fround(255.0);
    HEAPF32[916992 + (i10 << 4) >> 2] = i2 ? f17 : Math_fround(255.0);
    f20 = Math_fround(Math_sqrt(Math_fround(Math_fround(f20 + f19) * Math_fround(.5))));
    f18 = Math_fround(Math_fround(Math_sqrt(Math_fround(f18 * f20))) * Math_fround(255.0));
    i2 = f18 < Math_fround(255.0);
    HEAPF32[916992 + (i10 << 4) + 4 >> 2] = i2 ? f18 : Math_fround(255.0);
    f19 = Math_fround(Math_fround(Math_sqrt(Math_fround(Math_fround(HEAPF32[298373]) * Math_fround(Math_sqrt(Math_fround(f19)))))) * Math_fround(255.0));
    i2 = f19 < Math_fround(255.0);
    HEAPF32[916992 + (i10 << 4) + 8 >> 2] = i2 ? f19 : Math_fround(255.0);
    HEAPF32[916992 + (i10 << 4) + 12 >> 2] = Math_fround(f20 * Math_fround(HEAPF32[298374]));
    i2 = i1 + i9 | 0;
   }
   i10 = i10 + 1 | 0;
   i1 = HEAP32[298371] | 0;
  } while ((i10 | 0) < (i1 | 0));
 }
 i2 = HEAP32[298368] | 0;
 if ((i1 | 0) != (i2 | 0) & (i2 | 0) > 0) {
  i2 = 0;
  do {
   i13 = i2 << 1;
   f20 = Math_fround(HEAPF32[916992 + (i13 << 4) >> 2]);
   i1 = i13 | 1;
   HEAPF32[916992 + (i2 << 4) >> 2] = Math_fround(Math_fround(f20 + Math_fround(HEAPF32[916992 + (i1 << 4) >> 2])) * Math_fround(.5));
   f20 = Math_fround(HEAPF32[916992 + (i13 << 4) + 4 >> 2]);
   HEAPF32[916992 + (i2 << 4) + 4 >> 2] = Math_fround(Math_fround(f20 + Math_fround(HEAPF32[916992 + (i1 << 4) + 4 >> 2])) * Math_fround(.5));
   f20 = Math_fround(HEAPF32[916992 + (i13 << 4) + 8 >> 2]);
   HEAPF32[916992 + (i2 << 4) + 8 >> 2] = Math_fround(Math_fround(f20 + Math_fround(HEAPF32[916992 + (i1 << 4) + 8 >> 2])) * Math_fround(.5));
   f20 = Math_fround(HEAPF32[916992 + (i13 << 4) + 12 >> 2]);
   HEAPF32[916992 + (i2 << 4) + 12 >> 2] = Math_fround(Math_fround(f20 + Math_fround(HEAPF32[916992 + (i1 << 4) + 12 >> 2])) * Math_fround(.5));
   i2 = i2 + 1 | 0;
   i1 = HEAP32[298368] | 0;
  } while ((i2 | 0) < (i1 | 0));
 } else i1 = i2;
 if ((i1 | 0) > 0) i1 = 0; else return;
 do {
  HEAPF32[1162752 + (i1 << 2) >> 2] = Math_fround(Math_fround(1.0) / Math_fround(Math_fround(HEAPF32[916992 + (i1 << 4) + 12 >> 2]) + Math_fround(.0000999999974)));
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) < (HEAP32[298368] | 0));
 return;
}

function _fft_calc_16(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, i21 = 0, f22 = f0, i23 = 0, f24 = f0, f25 = f0, f26 = f0, i27 = 0, f28 = f0, i29 = 0;
 f7 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f6 = Math_fround(HEAPF32[i17 >> 2]);
 i21 = i2 + 8 | 0;
 f12 = Math_fround(HEAPF32[i21 >> 2]);
 i23 = i2 + 12 | 0;
 f13 = Math_fround(HEAPF32[i23 >> 2]);
 i27 = i2 + 16 | 0;
 f24 = Math_fround(HEAPF32[i27 >> 2]);
 i29 = i2 + 20 | 0;
 f22 = Math_fround(HEAPF32[i29 >> 2]);
 i14 = i2 + 24 | 0;
 f15 = Math_fround(HEAPF32[i14 >> 2]);
 i16 = i2 + 28 | 0;
 f18 = Math_fround(HEAPF32[i16 >> 2]);
 f5 = Math_fround(f7 + f12);
 f3 = Math_fround(f6 + f13);
 f12 = Math_fround(f7 - f12);
 f13 = Math_fround(f6 - f13);
 f6 = Math_fround(f24 + f15);
 f7 = Math_fround(f22 + f18);
 f15 = Math_fround(f24 - f15);
 f18 = Math_fround(f22 - f18);
 f22 = Math_fround(f3 + f7);
 HEAPF32[i2 >> 2] = Math_fround(f5 + f6);
 HEAPF32[i17 >> 2] = f22;
 f22 = Math_fround(f13 - f15);
 HEAPF32[i21 >> 2] = Math_fround(f12 + f18);
 HEAPF32[i23 >> 2] = f22;
 f7 = Math_fround(f3 - f7);
 HEAPF32[i27 >> 2] = Math_fround(f5 - f6);
 HEAPF32[i29 >> 2] = f7;
 f15 = Math_fround(f13 + f15);
 HEAPF32[i14 >> 2] = Math_fround(f12 - f18);
 HEAPF32[i16 >> 2] = f15;
 i16 = i2 + 32 | 0;
 f15 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 36 | 0;
 f18 = Math_fround(HEAPF32[i14 >> 2]);
 i29 = i2 + 40 | 0;
 f12 = Math_fround(HEAPF32[i29 >> 2]);
 i27 = i2 + 44 | 0;
 f13 = Math_fround(HEAPF32[i27 >> 2]);
 i23 = i2 + 48 | 0;
 f7 = Math_fround(HEAPF32[i23 >> 2]);
 i21 = i2 + 52 | 0;
 f6 = Math_fround(HEAPF32[i21 >> 2]);
 i8 = i2 + 56 | 0;
 f5 = Math_fround(HEAPF32[i8 >> 2]);
 i10 = i2 + 60 | 0;
 f3 = Math_fround(HEAPF32[i10 >> 2]);
 f22 = Math_fround(f15 + f12);
 f24 = Math_fround(f18 + f13);
 f12 = Math_fround(f15 - f12);
 f13 = Math_fround(f18 - f13);
 f18 = Math_fround(f7 + f5);
 f15 = Math_fround(f6 + f3);
 f5 = Math_fround(f7 - f5);
 f3 = Math_fround(f6 - f3);
 f6 = Math_fround(f22 + f18);
 f7 = Math_fround(f24 + f15);
 HEAPF32[i16 >> 2] = f6;
 HEAPF32[i14 >> 2] = f7;
 f9 = Math_fround(f13 - f5);
 HEAPF32[i29 >> 2] = Math_fround(f12 + f3);
 HEAPF32[i27 >> 2] = f9;
 f15 = Math_fround(f24 - f15);
 HEAPF32[i23 >> 2] = Math_fround(f22 - f18);
 HEAPF32[i21 >> 2] = f15;
 f5 = Math_fround(f13 + f5);
 HEAPF32[i8 >> 2] = Math_fround(f12 - f3);
 HEAPF32[i10 >> 2] = f5;
 i10 = i2 + 64 | 0;
 f5 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 68 | 0;
 f3 = Math_fround(HEAPF32[i8 >> 2]);
 i21 = i2 + 72 | 0;
 f12 = Math_fround(HEAPF32[i21 >> 2]);
 i23 = i2 + 76 | 0;
 f13 = Math_fround(HEAPF32[i23 >> 2]);
 i27 = i2 + 80 | 0;
 f15 = Math_fround(HEAPF32[i27 >> 2]);
 i29 = i2 + 84 | 0;
 f18 = Math_fround(HEAPF32[i29 >> 2]);
 i1 = i2 + 88 | 0;
 f22 = Math_fround(HEAPF32[i1 >> 2]);
 i4 = i2 + 92 | 0;
 f24 = Math_fround(HEAPF32[i4 >> 2]);
 f9 = Math_fround(f5 + f12);
 f11 = Math_fround(f3 + f13);
 f12 = Math_fround(f5 - f12);
 f13 = Math_fround(f3 - f13);
 f3 = Math_fround(f15 + f22);
 f5 = Math_fround(f18 + f24);
 f22 = Math_fround(f15 - f22);
 f24 = Math_fround(f18 - f24);
 f18 = Math_fround(f9 + f3);
 f15 = Math_fround(f11 + f5);
 f25 = Math_fround(f13 - f22);
 HEAPF32[i21 >> 2] = Math_fround(f12 + f24);
 HEAPF32[i23 >> 2] = f25;
 f5 = Math_fround(f11 - f5);
 HEAPF32[i27 >> 2] = Math_fround(f9 - f3);
 HEAPF32[i29 >> 2] = f5;
 f22 = Math_fround(f13 + f22);
 HEAPF32[i1 >> 2] = Math_fround(f12 - f24);
 HEAPF32[i4 >> 2] = f22;
 i4 = i2 + 96 | 0;
 f22 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 100 | 0;
 f24 = Math_fround(HEAPF32[i1 >> 2]);
 i29 = i2 + 104 | 0;
 f12 = Math_fround(HEAPF32[i29 >> 2]);
 i27 = i2 + 108 | 0;
 f13 = Math_fround(HEAPF32[i27 >> 2]);
 i23 = i2 + 112 | 0;
 f5 = Math_fround(HEAPF32[i23 >> 2]);
 i21 = i2 + 116 | 0;
 f3 = Math_fround(HEAPF32[i21 >> 2]);
 i20 = i2 + 120 | 0;
 f9 = Math_fround(HEAPF32[i20 >> 2]);
 i19 = i2 + 124 | 0;
 f11 = Math_fround(HEAPF32[i19 >> 2]);
 f25 = Math_fround(f22 + f12);
 f26 = Math_fround(f24 + f13);
 f12 = Math_fround(f22 - f12);
 f13 = Math_fround(f24 - f13);
 f24 = Math_fround(f5 + f9);
 f22 = Math_fround(f3 + f11);
 f9 = Math_fround(f5 - f9);
 f11 = Math_fround(f3 - f11);
 f3 = Math_fround(f25 + f24);
 f5 = Math_fround(f26 + f22);
 f28 = Math_fround(f13 - f9);
 HEAPF32[i29 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i27 >> 2] = f28;
 f22 = Math_fround(f26 - f22);
 HEAPF32[i23 >> 2] = Math_fround(f25 - f24);
 HEAPF32[i21 >> 2] = f22;
 f9 = Math_fround(f13 + f9);
 HEAPF32[i20 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i19 >> 2] = f9;
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i16 = i2 + (i1 << 3) | 0;
  f22 = Math_fround(HEAPF32[i16 >> 2]);
  i17 = i2 + (i1 << 3) + 4 | 0;
  f18 = Math_fround(HEAPF32[i17 >> 2]);
  f15 = Math_fround(HEAPF32[293440 + (i1 << 3) >> 2]);
  i20 = i1 + 4 | 0;
  i19 = i2 + (i20 << 3) | 0;
  f11 = Math_fround(HEAPF32[i19 >> 2]);
  f25 = Math_fround(f15 * f11);
  f28 = Math_fround(HEAPF32[293440 + (i1 << 3) + 4 >> 2]);
  i20 = i2 + (i20 << 3) + 4 | 0;
  f24 = Math_fround(HEAPF32[i20 >> 2]);
  f25 = Math_fround(f25 - Math_fround(f28 * f24));
  f24 = Math_fround(Math_fround(f11 * f28) + Math_fround(f15 * f24));
  f15 = Math_fround(HEAPF32[293504 + (i1 << 3) >> 2]);
  i23 = i1 + 8 | 0;
  i21 = i2 + (i23 << 3) | 0;
  f28 = Math_fround(HEAPF32[i21 >> 2]);
  f11 = Math_fround(f15 * f28);
  f9 = Math_fround(HEAPF32[293504 + (i1 << 3) + 4 >> 2]);
  i23 = i2 + (i23 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i23 >> 2]);
  f11 = Math_fround(f11 - Math_fround(f9 * f12));
  f12 = Math_fround(Math_fround(f28 * f9) + Math_fround(f15 * f12));
  f15 = Math_fround(HEAPF32[293472 + (i1 << 3) >> 2]);
  i29 = i1 + 12 | 0;
  i27 = i2 + (i29 << 3) | 0;
  f9 = Math_fround(HEAPF32[i27 >> 2]);
  f28 = Math_fround(f15 * f9);
  f13 = Math_fround(HEAPF32[293472 + (i1 << 3) + 4 >> 2]);
  i29 = i2 + (i29 << 3) + 4 | 0;
  f26 = Math_fround(HEAPF32[i29 >> 2]);
  f28 = Math_fround(f28 - Math_fround(f13 * f26));
  f26 = Math_fround(Math_fround(f9 * f13) + Math_fround(f15 * f26));
  f15 = Math_fround(f22 + f25);
  f13 = Math_fround(f18 + f24);
  f25 = Math_fround(f22 - f25);
  f24 = Math_fround(f18 - f24);
  f18 = Math_fround(f11 + f28);
  f22 = Math_fround(f12 + f26);
  f28 = Math_fround(f11 - f28);
  f26 = Math_fround(f12 - f26);
  f12 = Math_fround(f13 + f22);
  HEAPF32[i16 >> 2] = Math_fround(f15 + f18);
  HEAPF32[i17 >> 2] = f12;
  f12 = Math_fround(f24 - f28);
  HEAPF32[i19 >> 2] = Math_fround(f25 + f26);
  HEAPF32[i20 >> 2] = f12;
  f22 = Math_fround(f13 - f22);
  HEAPF32[i21 >> 2] = Math_fround(f15 - f18);
  HEAPF32[i23 >> 2] = f22;
  f28 = Math_fround(f24 + f28);
  HEAPF32[i27 >> 2] = Math_fround(f25 - f26);
  HEAPF32[i29 >> 2] = f28;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 4);
 return;
}

function _init(i1, i3, i4, f5, f6, i11) {
 i1 = i1 | 0;
 i3 = i3 | 0;
 i4 = i4 | 0;
 f5 = Math_fround(f5);
 f6 = Math_fround(f6);
 i11 = i11 | 0;
 var d2 = 0.0, i7 = 0, d8 = 0.0, i9 = 0, d10 = 0.0, i12 = 0, d13 = 0.0, d14 = 0.0, d15 = 0.0, d16 = 0.0, d17 = 0.0, i18 = 0, d19 = 0.0;
 if ((i3 + -1 | 0) >>> 0 > 7679 | (i4 + -1 | 0) >>> 0 > 4319) {
  i18 = 0;
  return i18 | 0;
 }
 HEAP32[298368] = i3;
 HEAP32[298369] = i4;
 i18 = f5 > Math_fround(100.0);
 i12 = f5 > Math_fround(1.0);
 f5 = i12 ? f5 : Math_fround(1.0);
 HEAPF32[298374] = i18 ? Math_fround(100.0) : f5;
 i18 = f6 > Math_fround(100.0);
 i12 = f6 > Math_fround(1.0);
 f6 = i12 ? f6 : Math_fround(1.0);
 HEAPF32[298373] = i18 ? Math_fround(100.0) : f6;
 if ((i1 + -8e3 | 0) >>> 0 > 92e3) {
  i18 = 0;
  return i18 | 0;
 }
 d19 = +(i1 | 0);
 i1 = ~~+Math_ceil(+(+Math_log(+(d19 * .33)) / .6931471805599453));
 if ((i1 + -10 | 0) >>> 0 > 10) {
  i18 = 0;
  return i18 | 0;
 }
 i3 = 1 << i1;
 HEAP32[298370] = i3;
 if ((i3 | 0) > 32768) {
  i18 = 0;
  return i18 | 0;
 }
 i18 = i1 + -2 | 0;
 i7 = 1 << i18;
 if ((i18 | 0) != 31) {
  i3 = 34 - i1 | 0;
  i4 = i7 + 65535 | 0;
  i1 = 0;
  do {
   i18 = i1 << 1 & -1431655766 | i1 >>> 1 & 1431655765;
   i18 = i18 << 2 & -858993460 | i18 >>> 2 & 858993459;
   i18 = i18 << 4 & -252645136 | i18 >>> 4 & 252645135;
   i18 = i18 << 8 & -16711936 | i18 >>> 8 & 16711935;
   HEAP16[621056 + (i1 << 1) >> 1] = (i18 << 16 | i18 >>> 16) >>> i3 & i4;
   i1 = i1 + 1 | 0;
  } while ((i1 | 0) < (i7 | 0));
  i3 = HEAP32[298370] | 0;
 }
 if ((i3 | 0) > 2) {
  i7 = 2;
  do {
   d2 = +(i7 | 0);
   d8 = 6.283185307179586 / d2;
   i9 = (i7 | 0) / 2 | 0;
   if ((i7 | 0) > 1) {
    i1 = 0;
    do {
     i18 = i1 + i7 | 0;
     d17 = d8 * +(i1 | 0);
     f6 = Math_fround(-Math_fround(+Math_sin(+d17)));
     HEAPF32[293376 + (i18 << 3) >> 2] = Math_fround(+Math_cos(+d17));
     HEAPF32[293376 + (i18 << 3) + 4 >> 2] = f6;
     i1 = i1 + 1 | 0;
    } while ((i1 | 0) < (i9 | 0));
    d2 = 9.42477796076938 / d2;
    i4 = i9 + i7 | 0;
    i1 = 0;
    do {
     i18 = i4 + i1 | 0;
     d17 = d2 * +(i1 | 0);
     f6 = Math_fround(-Math_fround(+Math_sin(+d17)));
     HEAPF32[293376 + (i18 << 3) >> 2] = Math_fround(+Math_cos(+d17));
     HEAPF32[293376 + (i18 << 3) + 4 >> 2] = f6;
     i1 = i1 + 1 | 0;
    } while ((i1 | 0) < (i9 | 0));
   }
   i7 = i7 << 1;
  } while ((i7 | 0) < (i3 | 0));
  d2 = 6.283185307179586 / +(i3 | 0);
  i4 = (i3 | 0) / 4 | 0;
  if ((i3 | 0) > 3) {
   i1 = 0;
   do {
    i18 = i1 + i3 | 0;
    d17 = d2 * +(i1 | 0);
    f6 = Math_fround(-Math_fround(+Math_sin(+d17)));
    HEAPF32[293376 + (i18 << 3) >> 2] = Math_fround(+Math_cos(+d17));
    HEAPF32[293376 + (i18 << 3) + 4 >> 2] = f6;
    i1 = i1 + 1 | 0;
   } while ((i1 | 0) < (i4 | 0));
  }
 }
 d2 = d19 * .033;
 i18 = ~~+Math_ceil(+d2);
 HEAP32[298372] = i18;
 if ((i18 | 0) > 0) {
  i1 = 0;
  do {
   d17 = +(i1 | 0) * 3.141592653589793 / d2;
   HEAPF32[637440 + (i1 << 2) >> 2] = Math_fround(+Math_cos(+d17) * .487396 + .355768 + +Math_cos(+(d17 * 2.0)) * .144232 + +Math_cos(+(d17 * 3.0)) * .012604);
   i1 = i1 + 1 | 0;
  } while ((i1 | 0) < (HEAP32[298372] | 0));
 }
 i12 = Math_imul(HEAP32[298368] | 0, i11 | 0 ? 2 : 1) | 0;
 HEAP32[298371] = i12;
 if ((i12 | 0) <= 0) {
  i18 = HEAP32[298370] | 0;
  return i18 | 0;
 }
 d13 = d19 * .5;
 i1 = HEAP32[298370] | 0;
 d14 = +(i1 | 0);
 d15 = d14 * 8.0;
 d16 = 1.0 / d14;
 d17 = 1.0 / +(i12 | 0);
 i11 = 0;
 i18 = 0;
 while (1) {
  d2 = +Math_exp(+((+(i11 | 0) + .5) * 6.931471805599452 * d17 + 2.9964935469158838));
  if (d2 >= d13) {
   i3 = 23;
   break;
  }
  d8 = d2 * .33;
  d8 = d15 / (d19 * (126.72 / (d8 / .83 + 2258.8235294117644) + 126.72 / (d8 / .17 + 462.65060240963857)));
  d10 = d2 * d14 / d19;
  d2 = d8 * .5;
  i3 = ~~+Math_ceil(+(d10 - d2));
  i7 = ~~+Math_floor(+(d10 + d2));
  i9 = i7 - i3 | 0;
  i4 = i9 + 1 | 0;
  if ((i18 + 1e3 + i4 | 0) > 1572864) {
   i1 = 0;
   i3 = 29;
   break;
  }
  HEAP32[1193500 + (i18 << 2) >> 2] = i4;
  HEAP32[1193500 + (i18 + 1 << 2) >> 2] = i3;
  if ((i7 | 0) >= (i3 | 0)) {
   d2 = 1.0 / d8;
   i4 = i18 + 2 - i3 | 0;
   while (1) {
    d8 = d2 * ((+(i3 | 0) - d10) * 6.283185307179586);
    HEAPF32[1193500 + (i4 + i3 << 2) >> 2] = Math_fround(d16 * +((i3 << 1 & 2 ^ 2) + -1 | 0) * (+Math_cos(+d8) * .487396 + .355768 + +Math_cos(+(d8 * 2.0)) * .144232 + +Math_cos(+(d8 * 3.0)) * .012604));
    if ((i3 | 0) < (i7 | 0)) i3 = i3 + 1 | 0; else break;
   }
  }
  i11 = i11 + 1 | 0;
  if ((i11 | 0) >= (i12 | 0)) {
   i3 = 29;
   break;
  } else i18 = i18 + 3 + i9 | 0;
 }
 if ((i3 | 0) == 23) {
  HEAP32[1193500 + (i18 << 2) >> 2] = 0;
  i18 = i1;
  return i18 | 0;
 } else if ((i3 | 0) == 29) return i1 | 0;
 return 0;
}

function _fft_calc_8(i1) {
 i1 = i1 | 0;
 var i2 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, i18 = 0, f19 = f0, f20 = f0, i21 = 0, i22 = 0, f23 = f0, i24 = 0, f25 = f0, i26 = 0, f27 = f0, f28 = f0, f29 = f0, i30 = 0, f31 = f0, i32 = 0, i33 = 0, f34 = f0;
 f28 = Math_fround(HEAPF32[i1 >> 2]);
 i33 = i1 + 4 | 0;
 f29 = Math_fround(HEAPF32[i33 >> 2]);
 i18 = i1 + 8 | 0;
 f9 = Math_fround(HEAPF32[i18 >> 2]);
 i17 = i1 + 12 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 f25 = Math_fround(f28 + f9);
 f27 = Math_fround(f29 + f11);
 f9 = Math_fround(f28 - f9);
 f11 = Math_fround(f29 - f11);
 HEAPF32[i18 >> 2] = f9;
 HEAPF32[i17 >> 2] = f11;
 i32 = i1 + 16 | 0;
 f29 = Math_fround(HEAPF32[i32 >> 2]);
 i30 = i1 + 20 | 0;
 f28 = Math_fround(HEAPF32[i30 >> 2]);
 i16 = i1 + 24 | 0;
 f3 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i1 + 28 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 f19 = Math_fround(f29 + f3);
 f23 = Math_fround(f28 + f7);
 f3 = Math_fround(f29 - f3);
 f7 = Math_fround(f28 - f7);
 i26 = i1 + 32 | 0;
 f28 = Math_fround(HEAPF32[i26 >> 2]);
 i24 = i1 + 36 | 0;
 f29 = Math_fround(HEAPF32[i24 >> 2]);
 i10 = i1 + 40 | 0;
 f13 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i1 + 44 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 f34 = Math_fround(f28 + f13);
 f31 = Math_fround(f29 + f15);
 f13 = Math_fround(f28 - f13);
 f15 = Math_fround(f29 - f15);
 i22 = i1 + 48 | 0;
 f29 = Math_fround(HEAPF32[i22 >> 2]);
 i21 = i1 + 52 | 0;
 f28 = Math_fround(HEAPF32[i21 >> 2]);
 i4 = i1 + 56 | 0;
 f20 = Math_fround(HEAPF32[i4 >> 2]);
 i2 = i1 + 60 | 0;
 f5 = Math_fround(HEAPF32[i2 >> 2]);
 f12 = Math_fround(f29 + f20);
 f6 = Math_fround(f28 + f5);
 f20 = Math_fround(f29 - f20);
 f5 = Math_fround(f28 - f5);
 f28 = Math_fround(f25 + f19);
 f29 = Math_fround(f27 + f23);
 f19 = Math_fround(f25 - f19);
 f23 = Math_fround(f27 - f23);
 f27 = Math_fround(f34 + f12);
 f25 = Math_fround(f31 + f6);
 f12 = Math_fround(f34 - f12);
 f6 = Math_fround(f31 - f6);
 f31 = Math_fround(f29 + f25);
 HEAPF32[i1 >> 2] = Math_fround(f28 + f27);
 HEAPF32[i33 >> 2] = f31;
 f31 = Math_fround(f23 - f12);
 HEAPF32[i32 >> 2] = Math_fround(f19 + f6);
 HEAPF32[i30 >> 2] = f31;
 f25 = Math_fround(f29 - f25);
 HEAPF32[i26 >> 2] = Math_fround(f28 - f27);
 HEAPF32[i24 >> 2] = f25;
 f12 = Math_fround(f23 + f12);
 HEAPF32[i22 >> 2] = Math_fround(f19 - f6);
 HEAPF32[i21 >> 2] = f12;
 f12 = Math_fround(HEAPF32[73354]);
 f6 = Math_fround(f12 * f3);
 f19 = Math_fround(HEAPF32[73355]);
 f6 = Math_fround(f6 - Math_fround(f19 * f7));
 f7 = Math_fround(Math_fround(f3 * f19) + Math_fround(f12 * f7));
 f12 = Math_fround(HEAPF32[73362]);
 f19 = Math_fround(f12 * f13);
 f3 = Math_fround(HEAPF32[73363]);
 f19 = Math_fround(f19 - Math_fround(f3 * f15));
 f15 = Math_fround(Math_fround(f13 * f3) + Math_fround(f12 * f15));
 f12 = Math_fround(HEAPF32[73358]);
 f3 = Math_fround(f12 * f20);
 f13 = Math_fround(HEAPF32[73359]);
 f3 = Math_fround(f3 - Math_fround(f13 * f5));
 f5 = Math_fround(Math_fround(f20 * f13) + Math_fround(f12 * f5));
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f19 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f19 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i18 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i2 >> 2] = f3;
 return;
}

function _fft_calc_8192(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_2048(i2);
 _fft_calc_2048(i2 + 16384 | 0);
 _fft_calc_2048(i2 + 32768 | 0);
 _fft_calc_2048(i2 + 49152 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 16384 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 16388 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 32768 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 32772 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 49152 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 49156 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[326144 + (i1 << 3) >> 2]);
  i8 = i1 + 2048 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[326144 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[358912 + (i1 << 3) >> 2]);
  i14 = i1 + 4096 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[358912 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[342528 + (i1 << 3) >> 2]);
  i17 = i1 + 6144 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[342528 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 2048);
 return;
}

function _fft_calc_4096(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_1024(i2);
 _fft_calc_1024(i2 + 8192 | 0);
 _fft_calc_1024(i2 + 16384 | 0);
 _fft_calc_1024(i2 + 24576 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 8192 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 8196 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 16384 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 16388 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 24576 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 24580 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[309760 + (i1 << 3) >> 2]);
  i8 = i1 + 1024 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[309760 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[326144 + (i1 << 3) >> 2]);
  i14 = i1 + 2048 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[326144 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[317952 + (i1 << 3) >> 2]);
  i17 = i1 + 3072 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[317952 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 1024);
 return;
}

function _fft_calc_2048(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_512(i2);
 _fft_calc_512(i2 + 4096 | 0);
 _fft_calc_512(i2 + 8192 | 0);
 _fft_calc_512(i2 + 12288 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 4096 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 4100 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 8192 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 8196 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 12288 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 12292 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[301568 + (i1 << 3) >> 2]);
  i8 = i1 + 512 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[301568 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[309760 + (i1 << 3) >> 2]);
  i14 = i1 + 1024 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[309760 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[305664 + (i1 << 3) >> 2]);
  i17 = i1 + 1536 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[305664 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 512);
 return;
}

function _fft_calc_1024(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_256(i2);
 _fft_calc_256(i2 + 2048 | 0);
 _fft_calc_256(i2 + 4096 | 0);
 _fft_calc_256(i2 + 6144 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 2048 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 2052 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 4096 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 4100 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 6144 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 6148 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[297472 + (i1 << 3) >> 2]);
  i8 = i1 + 256 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[297472 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[301568 + (i1 << 3) >> 2]);
  i14 = i1 + 512 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[301568 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[299520 + (i1 << 3) >> 2]);
  i17 = i1 + 768 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[299520 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 256);
 return;
}

function _fft_calc_512(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_128(i2);
 _fft_calc_128(i2 + 1024 | 0);
 _fft_calc_128(i2 + 2048 | 0);
 _fft_calc_128(i2 + 3072 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 1024 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 1028 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 2048 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 2052 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 3072 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 3076 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[295424 + (i1 << 3) >> 2]);
  i8 = i1 + 128 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[295424 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[297472 + (i1 << 3) >> 2]);
  i14 = i1 + 256 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[297472 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[296448 + (i1 << 3) >> 2]);
  i17 = i1 + 384 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[296448 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 128);
 return;
}

function _fft_calc_256(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_64(i2);
 _fft_calc_64(i2 + 512 | 0);
 _fft_calc_64(i2 + 1024 | 0);
 _fft_calc_64(i2 + 1536 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 512 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 516 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 1024 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 1028 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 1536 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 1540 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[294400 + (i1 << 3) >> 2]);
  i8 = i1 + 64 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[294400 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[295424 + (i1 << 3) >> 2]);
  i14 = i1 + 128 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[295424 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[294912 + (i1 << 3) >> 2]);
  i17 = i1 + 192 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[294912 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 64);
 return;
}

function _fft_calc_128(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_32(i2);
 _fft_calc_32(i2 + 256 | 0);
 _fft_calc_32(i2 + 512 | 0);
 _fft_calc_32(i2 + 768 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 256 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 260 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 512 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 516 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 768 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 772 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[293888 + (i1 << 3) >> 2]);
  i8 = i1 + 32 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[293888 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[294400 + (i1 << 3) >> 2]);
  i14 = i1 + 64 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[294400 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[294144 + (i1 << 3) >> 2]);
  i17 = i1 + 96 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[294144 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 32);
 return;
}

function _fft_calc_64(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_16(i2);
 _fft_calc_16(i2 + 128 | 0);
 _fft_calc_16(i2 + 256 | 0);
 _fft_calc_16(i2 + 384 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 128 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 132 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 256 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 260 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 384 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 388 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[293632 + (i1 << 3) >> 2]);
  i8 = i1 + 16 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[293632 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[293888 + (i1 << 3) >> 2]);
  i14 = i1 + 32 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[293888 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[293760 + (i1 << 3) >> 2]);
  i17 = i1 + 48 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[293760 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 16);
 return;
}

function _fft_calc_32(i2) {
 i2 = i2 | 0;
 var i1 = 0, f3 = f0, i4 = 0, f5 = f0, f6 = f0, f7 = f0, i8 = 0, f9 = f0, i10 = 0, f11 = f0, f12 = f0, f13 = f0, i14 = 0, f15 = f0, i16 = 0, i17 = 0, f18 = f0, i19 = 0, i20 = 0, f21 = f0;
 _fft_calc_8(i2);
 _fft_calc_8(i2 + 64 | 0);
 _fft_calc_8(i2 + 128 | 0);
 _fft_calc_8(i2 + 192 | 0);
 f9 = Math_fround(HEAPF32[i2 >> 2]);
 i17 = i2 + 4 | 0;
 f11 = Math_fround(HEAPF32[i17 >> 2]);
 i16 = i2 + 64 | 0;
 f6 = Math_fround(HEAPF32[i16 >> 2]);
 i14 = i2 + 68 | 0;
 f7 = Math_fround(HEAPF32[i14 >> 2]);
 i10 = i2 + 128 | 0;
 f18 = Math_fround(HEAPF32[i10 >> 2]);
 i8 = i2 + 132 | 0;
 f15 = Math_fround(HEAPF32[i8 >> 2]);
 i4 = i2 + 192 | 0;
 f3 = Math_fround(HEAPF32[i4 >> 2]);
 i1 = i2 + 196 | 0;
 f5 = Math_fround(HEAPF32[i1 >> 2]);
 f12 = Math_fround(f9 + f6);
 f13 = Math_fround(f11 + f7);
 f6 = Math_fround(f9 - f6);
 f7 = Math_fround(f11 - f7);
 f11 = Math_fround(f18 + f3);
 f9 = Math_fround(f15 + f5);
 f3 = Math_fround(f18 - f3);
 f5 = Math_fround(f15 - f5);
 f15 = Math_fround(f13 + f9);
 HEAPF32[i2 >> 2] = Math_fround(f12 + f11);
 HEAPF32[i17 >> 2] = f15;
 f15 = Math_fround(f7 - f3);
 HEAPF32[i16 >> 2] = Math_fround(f6 + f5);
 HEAPF32[i14 >> 2] = f15;
 f9 = Math_fround(f13 - f9);
 HEAPF32[i10 >> 2] = Math_fround(f12 - f11);
 HEAPF32[i8 >> 2] = f9;
 f3 = Math_fround(f7 + f3);
 HEAPF32[i4 >> 2] = Math_fround(f6 - f5);
 HEAPF32[i1 >> 2] = f3;
 i1 = 1;
 do {
  i20 = i2 + (i1 << 3) | 0;
  f11 = Math_fround(HEAPF32[i20 >> 2]);
  i19 = i2 + (i1 << 3) + 4 | 0;
  f9 = Math_fround(HEAPF32[i19 >> 2]);
  f7 = Math_fround(HEAPF32[293504 + (i1 << 3) >> 2]);
  i8 = i1 + 8 | 0;
  i4 = i2 + (i8 << 3) | 0;
  f3 = Math_fround(HEAPF32[i4 >> 2]);
  f13 = Math_fround(f7 * f3);
  f18 = Math_fround(HEAPF32[293504 + (i1 << 3) + 4 >> 2]);
  i8 = i2 + (i8 << 3) + 4 | 0;
  f12 = Math_fround(HEAPF32[i8 >> 2]);
  f13 = Math_fround(f13 - Math_fround(f18 * f12));
  f12 = Math_fround(Math_fround(f3 * f18) + Math_fround(f7 * f12));
  f7 = Math_fround(HEAPF32[293632 + (i1 << 3) >> 2]);
  i14 = i1 + 16 | 0;
  i10 = i2 + (i14 << 3) | 0;
  f18 = Math_fround(HEAPF32[i10 >> 2]);
  f3 = Math_fround(f7 * f18);
  f21 = Math_fround(HEAPF32[293632 + (i1 << 3) + 4 >> 2]);
  i14 = i2 + (i14 << 3) + 4 | 0;
  f5 = Math_fround(HEAPF32[i14 >> 2]);
  f3 = Math_fround(f3 - Math_fround(f21 * f5));
  f5 = Math_fround(Math_fround(f18 * f21) + Math_fround(f7 * f5));
  f7 = Math_fround(HEAPF32[293568 + (i1 << 3) >> 2]);
  i17 = i1 + 24 | 0;
  i16 = i2 + (i17 << 3) | 0;
  f21 = Math_fround(HEAPF32[i16 >> 2]);
  f18 = Math_fround(f7 * f21);
  f6 = Math_fround(HEAPF32[293568 + (i1 << 3) + 4 >> 2]);
  i17 = i2 + (i17 << 3) + 4 | 0;
  f15 = Math_fround(HEAPF32[i17 >> 2]);
  f18 = Math_fround(f18 - Math_fround(f6 * f15));
  f15 = Math_fround(Math_fround(f21 * f6) + Math_fround(f7 * f15));
  f7 = Math_fround(f11 + f13);
  f6 = Math_fround(f9 + f12);
  f13 = Math_fround(f11 - f13);
  f12 = Math_fround(f9 - f12);
  f9 = Math_fround(f3 + f18);
  f11 = Math_fround(f5 + f15);
  f18 = Math_fround(f3 - f18);
  f15 = Math_fround(f5 - f15);
  f5 = Math_fround(f6 + f11);
  HEAPF32[i20 >> 2] = Math_fround(f7 + f9);
  HEAPF32[i19 >> 2] = f5;
  f5 = Math_fround(f12 - f18);
  HEAPF32[i4 >> 2] = Math_fround(f13 + f15);
  HEAPF32[i8 >> 2] = f5;
  f11 = Math_fround(f6 - f11);
  HEAPF32[i10 >> 2] = Math_fround(f7 - f9);
  HEAPF32[i14 >> 2] = f11;
  f18 = Math_fround(f12 + f18);
  HEAPF32[i16 >> 2] = Math_fround(f13 - f15);
  HEAPF32[i17 >> 2] = f18;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) != 8);
 return;
}

function _render_line(i2, i1) {
 i2 = i2 | 0;
 i1 = i1 | 0;
 var f3 = f0, i4 = 0, i5 = 0, f6 = f0, i7 = 0;
 i7 = (i1 | 0) < 0 ? 0 : ((i1 | 0) < 255 ? i1 : 255) & 255;
 if ((i2 | 0) > -1) {
  i1 = HEAP32[298369] | 0;
  if ((i1 | 0) > (i2 | 0)) {
   f6 = Math_fround(Math_fround(i1 - i2 | 0) / Math_fround(i1 | 0));
   if ((HEAP32[298368] | 0) > 0) i5 = 0; else return;
   do {
    f3 = Math_fround(HEAPF32[916992 + (i5 << 4) + 12 >> 2]);
    if (!(f3 <= f6)) {
     f3 = Math_fround(f3 - f6);
     f3 = Math_fround(f3 * Math_fround(HEAPF32[1162752 + (i5 << 2) >> 2]));
     i4 = ~~Math_fround(Math_fround(f3 * Math_fround(HEAPF32[916992 + (i5 << 4) >> 2])) + Math_fround(.5)) & 255;
     i2 = ~~Math_fround(Math_fround(f3 * Math_fround(HEAPF32[916992 + (i5 << 4) + 4 >> 2])) + Math_fround(.5)) & 255;
     i1 = ~~Math_fround(Math_fround(f3 * Math_fround(HEAPF32[916992 + (i5 << 4) + 8 >> 2])) + Math_fround(.5)) & 255;
    } else {
     i1 = 0;
     i2 = 0;
     i4 = 0;
    }
    HEAP8[262656 + (i5 << 2) >> 0] = i4;
    HEAP8[262656 + (i5 << 2) + 1 >> 0] = i2;
    HEAP8[262656 + (i5 << 2) + 2 >> 0] = i1;
    HEAP8[262656 + (i5 << 2) + 3 >> 0] = i7;
    i5 = i5 + 1 | 0;
   } while ((i5 | 0) < (HEAP32[298368] | 0));
   return;
  }
 }
 if ((HEAP32[298368] | 0) > 0) i1 = 0; else return;
 do {
  i2 = ~~Math_fround(Math_fround(HEAPF32[916992 + (i1 << 4) >> 2]) + Math_fround(.5)) & 255;
  i4 = ~~Math_fround(Math_fround(HEAPF32[916992 + (i1 << 4) + 4 >> 2]) + Math_fround(.5)) & 255;
  i5 = ~~Math_fround(Math_fround(HEAPF32[916992 + (i1 << 4) + 8 >> 2]) + Math_fround(.5)) & 255;
  HEAP8[262656 + (i1 << 2) >> 0] = i2;
  HEAP8[262656 + (i1 << 2) + 1 >> 0] = i4;
  HEAP8[262656 + (i1 << 2) + 2 >> 0] = i5;
  HEAP8[262656 + (i1 << 2) + 3 >> 0] = i7;
  i1 = i1 + 1 | 0;
 } while ((i1 | 0) < (HEAP32[298368] | 0));
 return;
}

function _set_volume(f1, f2) {
 f1 = Math_fround(f1);
 f2 = Math_fround(f2);
 var i3 = 0, i4 = 0;
 i3 = f1 > Math_fround(100.0);
 i4 = f1 > Math_fround(1.0);
 f1 = i4 ? f1 : Math_fround(1.0);
 HEAPF32[298374] = i3 ? Math_fround(100.0) : f1;
 i3 = f2 > Math_fround(100.0);
 i4 = f2 > Math_fround(1.0);
 f2 = i4 ? f2 : Math_fround(1.0);
 HEAPF32[298373] = i3 ? Math_fround(100.0) : f2;
 return;
}

function _set_height(i1) {
 i1 = i1 | 0;
 HEAP32[298369] = (i1 | 0) > 4320 ? 4320 : (i1 | 0) > 1 ? i1 : 1;
 return;
}

function _get_input_array(i1) {
 i1 = i1 | 0;
 return 512 + (((i1 | 0) != 0 & 1) << 17) | 0;
}

function _get_output_array() {
 return 262656;
}

// EMSCRIPTEN_END_FUNCS
  return { _render_line: _render_line, _init: _init, _get_input_array: _get_input_array, _calc: _calc, _get_output_array: _get_output_array, _set_height: _set_height, _set_volume: _set_volume };
}
