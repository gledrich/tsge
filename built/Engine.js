var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Engine_canvas, _Engine_ctx, _Engine_window, _Engine_title;
import Canvas from "./Canvas.js";
export default class Engine {
    constructor(opts = { width: '100%', height: '100%', title: 'Example' }) {
        _Engine_canvas.set(this, void 0);
        _Engine_ctx.set(this, void 0);
        _Engine_window.set(this, void 0);
        _Engine_title.set(this, void 0);
        __classPrivateFieldSet(this, _Engine_title, document.createElement('title'), "f");
        __classPrivateFieldGet(this, _Engine_title, "f").innerHTML = opts.title;
        document.getElementsByTagName('head')[0].appendChild(__classPrivateFieldGet(this, _Engine_title, "f"));
        __classPrivateFieldSet(this, _Engine_canvas, new Canvas(), "f");
        __classPrivateFieldSet(this, _Engine_ctx, __classPrivateFieldGet(this, _Engine_canvas, "f").canvas.getContext('2d'), "f");
        __classPrivateFieldSet(this, _Engine_window, document.createElement('div'), "f");
        __classPrivateFieldGet(this, _Engine_window, "f").style.width = opts.width;
        __classPrivateFieldGet(this, _Engine_window, "f").style.height = opts.height;
        document.getElementsByTagName('body')[0].appendChild(__classPrivateFieldGet(this, _Engine_window, "f"));
        __classPrivateFieldGet(this, _Engine_window, "f").appendChild(__classPrivateFieldGet(this, _Engine_canvas, "f").canvas);
    }
}
_Engine_canvas = new WeakMap(), _Engine_ctx = new WeakMap(), _Engine_window = new WeakMap(), _Engine_title = new WeakMap();
