"use strict";
exports.__esModule = true;
var lodash = require("lodash");
function merge(object, source) {
    return lodash.mergeWith(object, source, function (objValue, srcValue) {
        if (objValue instanceof Array) {
            return objValue.concat(srcValue);
        }
    });
}
exports["default"] = merge;
