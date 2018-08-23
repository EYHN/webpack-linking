import * as webpack from 'webpack';
import merge from './utils/merge';
import randomString from './utils/randomString';
import * as path from 'path';
import * as url from 'url';
import wait from './utils/wait';

interface DevtoolModuleFilenameTemplateInfo {
  identifier: string;
  shortIdentifier: string;
  resource: any;
  resourcePath: string;
  absoluteResourcePath: string;
  allLoaders: any[];
  loaders: any[];
  query: string;
  moduleId: string;
  namespace: string;
  hash: string;
}

class Watching {
  webpackWatching: webpack.Watching;
  children: Watching[] = [];
  constructor(Watching: webpack.Watching, children: Watching[] = []) {
    this.webpackWatching = Watching;
    this.children = children;
  }
  close(): Promise<void> {
    return Promise.all([
      ...this.children.map(child => child.close()),
      new Promise<void>((resolve) => {
        this.webpackWatching.close(resolve);
      })
    ]).then(() => void 0);
  }
  invalidate() {
    this.children.forEach(child => child.invalidate());
  }
}

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

  get topUnit(): webpackUnit {
    if (!this.parent) {
      return this;
    } else {
      return this.parent.topUnit;
    }
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
    const stats = await new Promise<webpack.Stats>((resolve, reject) => {
      webpack(this.buildConfig(true, entry)).run((err, stats) => {
        if (err || stats.hasErrors()) {
          reject(stats.toJson());
        }
        resolve(stats);
      });
    });
    return stats;
  }

  async watch(watchOptions: webpack.ICompiler.WatchOptions, handler: webpack.ICompiler.Handler): Promise<Watching> {
    const entry: {[key: string]: string} = {};
    const childrenWatching = await Promise.all(this.children.map(child => child.watch(watchOptions, (err, stats) => {
      entry[child.name] = stats.compilation.outputOptions.path;
      handler(err,stats);
    })));
    await wait(1);
    let firstBuild = true;
    return new Promise<Watching>((resolve, reject) => {
      const watching = new Watching(webpack(this.buildConfig(true, entry)).watch(watchOptions, (err, stats) => {
        handler(err, stats);
        if (firstBuild) {
          firstBuild = false;
          if (err || stats.hasErrors()) {
            watching.close();
            reject(stats.toJson())
          }
          resolve(watching);
        }
      }), childrenWatching);
    });
  }

  link(target: webpackUnit) {
    target.parent = this;
    this.children.push(target);
  }

  buildConfig(injectChildren: boolean = false, childrenEntry?: {[key: string]: string}): webpack.Configuration {
    const configuration: webpack.Configuration = {
      module: {
        rules: [
          {
            test: /\.js$/,
            use: ['source-map-loader'],
            include: [...Object.values(childrenEntry || {})],
            enforce: 'pre'
          }
        ]
      },
      output: {
        devtoolModuleFilenameTemplate: (info: DevtoolModuleFilenameTemplateInfo) => {
          const resourcePath = info.resourcePath;
          if (url.parse(resourcePath).protocol) {
            return resourcePath;
          } else {
            return url.format({
              protocol: this.name,
              hostname: info.namespace,
              pathname: info.resourcePath,
              query: info.loaders,
              slashes: true
            });
          }
        }
      }
    };
    if (injectChildren) {
      configuration.resolve = {};
      configuration.resolve.alias = {
        ...childrenEntry
      };
      configuration.externals = [...this.exports]
    } else {
      configuration.externals = [...this.exports, ...(this.children.map(child => child.name))]
    }
    if (this.parent) {
      const topConfig = this.topUnit.buildConfig();
      let topOutputPath: string = '';
      let topOutputPublicPath: string = '';
      if (topConfig.output) {
        topOutputPath = topConfig.output.path || '';
        topOutputPublicPath = topConfig.output.publicPath || '';
      }
      if (!configuration.output) {configuration.output = {};}
      configuration.output.libraryTarget = 'commonjs2';
      configuration.output.filename = ((chunkData: any) => {
        return chunkData.chunk.name === 'main' ? 'index.js': '[name].js';
      }) as any;
      configuration.output.path = path.join(topOutputPath, `./modules/${this.name}/`);
      const relativePath = path.relative(topOutputPath, configuration.output.path);
      let publicPath = path.posix.join(topOutputPublicPath, relativePath);
      if (!publicPath.endsWith('/')) publicPath += '/';
      configuration.output.publicPath = publicPath;
    }
    return merge(this.config, configuration);
  }
}
