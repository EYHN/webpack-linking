"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const path = require("path");
const UnitB = new __1.Unit({
    mode: "production",
    entry: path.join(__dirname, './examples/b.js'),
    target: 'node',
    devtool: "source-map",
    output: {
        filename: "[name].js",
        libraryTarget: "commonjs2",
        path: path.join(__dirname, 'dist'),
        devtoolModuleFilenameTemplate: "b://[namespace]/[resource-path]?[loaders]"
    }
});
const UnitA = new __1.Unit({
    mode: "production",
    entry: path.join(__dirname, './examples/a.js'),
    target: 'node',
    devtool: "source-map",
    output: {
        filename: "[name].js",
        libraryTarget: "commonjs2",
        path: path.join(__dirname, 'dist'),
        devtoolModuleFilenameTemplate: "a://[namespace]/[resource-path]?[loaders]"
    },
    externals: [
        "playerunknowns"
    ]
}, [UnitB]);
UnitA.build((err, stats) => {
    console.error(err);
    console.log(stats.toString());
});
//# sourceMappingURL=index.js.map