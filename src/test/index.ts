import { Unit } from '..';
import * as path from 'path';

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
    publicPath: '/',
    devtoolModuleFilenameTemplate: "a://[namespace]/[resource-path]?[loaders]"
  }
});

UnitA.link(UnitB);

UnitA.build();
