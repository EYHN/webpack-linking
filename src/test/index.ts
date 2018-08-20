import { Unit } from '..';
import * as path from 'path';

const UnitB = new Unit('B', {
  mode: "development",
  entry: {b: path.join(__dirname,'./examples/b.js'), d: path.join(__dirname,'./examples/d.js')},
  target: 'web',
  devtool: "source-map"
});

const UnitA = new Unit('A', {
  mode: "development",
  entry: path.join(__dirname,'./examples/a.js'),
  target: 'web',
  devtool: "source-map",
  output: {
    filename: "[name].js",
    libraryTarget: "umd",
    path: path.join(__dirname,'dist'),
    devtoolModuleFilenameTemplate: "a://[namespace]/[resource-path]?[loaders]"
  }
});

UnitA.link(UnitB);

UnitA.build().catch(console.error);
