"use strict";
exports.__esModule = true;
function randomString(length, charSet) {
    if (length === void 0) { length = 16; }
    if (charSet === void 0) { charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; }
    var result = [];
    while (length--) {
        result.push(charSet[Math.floor(Math.random() * charSet.length)]);
    }
    return result.join('');
}
exports["default"] = randomString;
;
