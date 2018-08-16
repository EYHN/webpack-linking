import * as webpack from 'webpack';

export default class webpackUnit {
  config: webpack.Configuration;
  exports: string[];
  children: webpackUnit[];
  parent: webpackUnit | undefined;

  constructor(webpackconfig: webpack.Configuration, children: webpackUnit[] = [], parent?: webpackUnit, exports: string[] = []) {
    this.config = webpackconfig;
    this.exports = exports;
    this.children = children;
    this.parent = parent;
  }

  getExports(): string[] {
    let parentExports = typeof this.parent !== 'undefined' ? this.parent.getExports() : [];
    return [...this.exports, ...parentExports]; 
  }

  build(handler: webpack.ICompiler.Handler) {
    return webpack(this.buildConfig()).run(handler);
  }

  buildConfig(): webpack.Configuration {
    return this.config
  }
  
}