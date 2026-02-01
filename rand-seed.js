/*!
MIT License

Copyright (c) 2025 Michael Dzjaparidze

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
{ var RandSeed = function (e) { "use strict"; class t { static _xfnv1a(e) { let t = 2166136261; for (let i = 0; i < e.length; i++)t = Math.imul(t ^ e.charCodeAt(i), 16777619); return () => (t += t << 13, t ^= t >>> 7, t += t << 3, t ^= t >>> 17, (t += t << 5) >>> 0) } } class i extends t { constructor(e) { super(), Object.defineProperty(this, "a", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), this.a = i._xfnv1a(e)() } next() { let e = this.a += 1831565813; return e = Math.imul(e ^ e >>> 15, 1 | e), e ^= e + Math.imul(e ^ e >>> 7, 61 | e), ((e ^ e >>> 14) >>> 0) / 4294967296 } } class r extends t { constructor(e) { super(), Object.defineProperty(this, "a", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "b", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "c", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "d", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }); const t = r._xfnv1a(e); this.a = t(), this.b = t(), this.c = t(), this.d = t() } next() { this.a >>>= 0, this.b >>>= 0, this.c >>>= 0, this.d >>>= 0; let e = this.a + this.b | 0; return this.a = this.b ^ this.b >>> 9, this.b = this.c + (this.c << 3) | 0, this.c = this.c << 21 | this.c >>> 11, this.d = this.d + 1 | 0, e = e + this.d | 0, this.c = this.c + e | 0, (e >>> 0) / 4294967296 } } class s extends t { constructor(e) { super(), Object.defineProperty(this, "a", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "b", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "c", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "d", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }); const t = s._xfnv1a(e); this.a = t(), this.b = t(), this.c = t(), this.d = t() } next() { const e = this.b << 9; let t = 5 * this.b; return t = 9 * (t << 7 | t >>> 25), this.c ^= this.a, this.d ^= this.b, this.b ^= this.c, this.a ^= this.d, this.c ^= e, this.d = this.d << 11 | this.d >>> 21, (t >>> 0) / 4294967296 } } var a; e.PRNG = void 0, (a = e.PRNG || (e.PRNG = {})).sfc32 = "sfc32", a.mulberry32 = "mulberry32", a.xoshiro128ss = "xoshiro128ss"; return e.default = class { constructor(t, i = e.PRNG.sfc32) { Object.defineProperty(this, "str", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "prng", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), Object.defineProperty(this, "generator", { enumerable: !0, configurable: !0, writable: !0, value: void 0 }), this.str = t, this.prng = i, this.generator = this._initializeGenerator() } next() { return this.generator.next() } _initializeGenerator() { if ((e => null === e)(e = this.str) || (e => void 0 === e)(e)) return this.wrap(); var e; switch (this.prng) { case "sfc32": return new r(this.str); case "mulberry32": return new i(this.str); case "xoshiro128ss": return new s(this.str); default: return this.wrap() } } wrap() { return { next: () => Math.random() } } }, Object.defineProperty(e, "__esModule", { value: !0 }), e }({}); Math.random_org = Math.random; Math.seedRandom = function (seed) { Math.random = (function (rnd) { return () => rnd.next(); })(new RandSeed.default(seed)); } }
