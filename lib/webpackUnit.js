"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");
class webpackUnit {
    constructor(webpackconfig, children = [], parent, exports = []) {
        this.config = webpackconfig;
        this.exports = exports;
        this.children = children;
        this.parent = parent;
    }
    getExports() {
        let parentExports = typeof this.parent !== 'undefined' ? this.parent.getExports() : [];
        return [...this.exports, ...parentExports];
    }
    build(handler) {
        return webpack(this.buildConfig()).run(handler);
    }
    buildConfig() {
        return this.config;
    }
}
exports.default = webpackUnit;
//# sourceMappingURL=webpackUnit.js.map