import { Unit } from '../';
import * as path from 'path';

const UnitB = new Unit({
  mode: "production",
  entry: path.join(__dirname,'./examples/b.js'),
  target: 'node',
  devtool: "source-map",
  output: {
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.join(__dirname,'dist'),
    devtoolModuleFilenameTemplate: "b://[namespace]/[resource-path]?[loaders]"
  }
})

const UnitA = new Unit({
  mode: "production",
  entry: path.join(__dirname,'./examples/a.js'),
  target: 'node',
  devtool: "source-map",
  output: {
    filename: "[name].js",
    libraryTarget: "commonjs2",
    path: path.join(__dirname,'dist'),
    devtoolModuleFilenameTemplate: "a://[namespace]/[resource-path]?[loaders]"
  },
  externals: [
    "playerunknowns"
  ]
}, [UnitB])

UnitA.build((err, stats) => {
  console.error(err);
  console.log(stats.toString());
});