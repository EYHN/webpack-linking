import * as webpack from 'webpack';
import merge from './utils/merge';
import randomString from './utils/randomString';

export default class webpackUnit {
  name: string = 'unit-' + randomString(12);
  config: webpack.Configuration;
  children: webpackUnit[] = [];
  parent: webpackUnit | undefined = undefined;
  _exports: string[];

  get depth(): number {
    if (typeof this.parent === 'undefined') {
      return 1;
    }
    return this.parent.depth + 1;
  }

  get exports(): string[] {
    let parentExports = typeof this.parent !== 'undefined' ? this.parent.exports : [];
    return [...this._exports, ...parentExports];
  }

  set exports(e: string[]) {
    this._exports = e;
  }

  constructor(name: string, webpackconfig: webpack.Configuration, exports: string[] = []) {
    this.name = name;
    this.config = webpackconfig;
    this._exports = exports;
  }

  async build() {
    const entrypoints = await Promise.all(this.children.map(async child => {
      const stats = await child.build();
      return {
        [child.name]: stats.compilation.outputOptions.path as string
      };
    }));
    const entry = Object.assign({}, ...entrypoints);
    return new Promise<webpack.Stats>((resolve, reject) => {
      console.log(this.buildConfig(true, entry))
      webpack(this.buildConfig(true, entry)).run((err, stats) => {
        if (err || stats.hasErrors()) {
          reject(stats.toJson());
        }
        resolve(stats);
      });
    });
  }

  link(target: webpackUnit) {
    target.parent = this;
    this.children.push(target);
  }

  buildConfig(injectChildren: boolean = false, childrenEntry?: {[key: string]: string}): webpack.Configuration {
    const configuration: webpack.Configuration = {}
    if (injectChildren) {
      configuration.resolve = {};
      configuration.resolve.alias = {
        ...childrenEntry
      };
      configuration.externals = [...this.exports]
    } else {
      configuration.externals = [...this.exports, ...(this.children.map(child => child.name))]
    }
    if (this.depth !== 1) {
      configuration.output = {};
      configuration.output.libraryTarget = 'commonjs2';
      configuration.output.filename = ((chunkData: any) => {
        return chunkData.chunk.name === 'main' ? 'index.js': '[name].js';
      }) as any;
      configuration.output.devtoolModuleFilenameTemplate = `unit${this.depth}://[namespace]/[resource-path]?[loaders]`
    }
    return merge(this.config, configuration);
  }
}
