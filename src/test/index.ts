import { Unit } from '..';
import * as path from 'path';

const UnitD = new Unit('d', {
  mode: "development",
  entry: path.join(__dirname,'./examples/d.js'),
  target: 'web',
  devtool: "source-map"
});

const UnitB = new Unit('b', {
  mode: "development",
  entry: path.join(__dirname,'./examples/b.js'),
  target: 'web',
  devtool: "source-map"
});

const UnitA = new Unit('a', {
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

UnitB.link(UnitD);

UnitA.link(UnitB);

UnitA.build();
