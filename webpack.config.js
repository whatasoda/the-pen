const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const ip = require('ip');
const path = require('path');
const webpack = require('webpack');

const distRoot = path.resolve(__dirname, 'dist');
const srcRoot = path.resolve(__dirname, 'src');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = () => ({
  entry: [path.resolve(srcRoot, 'index.ts')],
  output: {
    path: distRoot,
  },
  devtool: 'source-map',
  devServer: {
    contentBase: distRoot,
    compress: false,
    host: ip.address() || 'localhost',
    port: 8080,
    https: true,
  },
  optimization: {
    minimizer: [new TerserJSPlugin({})],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(srcRoot, 'index.html'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
        },
      },
    ],
  },
});
