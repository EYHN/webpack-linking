import * as webpack from 'webpack';
export default class webpackUnit {
    config: webpack.Configuration;
    exports: string[];
    children: webpackUnit[];
    parent: webpackUnit | undefined;
    constructor(webpackconfig: webpack.Configuration, children?: webpackUnit[], parent?: webpackUnit, exports?: string[]);
    getExports(): string[];
    build(handler: webpack.ICompiler.Handler): void;
    buildConfig(): webpack.Configuration;
}
