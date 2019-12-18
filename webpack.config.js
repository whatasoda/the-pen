const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ip = require('ip');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const distRoot = path.resolve(__dirname, 'dist');
const srcRoot = path.resolve(__dirname, 'src');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = merge({
  entry: [path.resolve(srcRoot, 'index.ts')],
  output: {
    path: distRoot,
    chunkFilename: '[name].[hash].bundle.js',
  },
  devServer: {
    contentBase: distRoot,
    compress: false,
    host: ip.address() || 'localhost',
    port: 8080,
    https: true,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
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
        include: [path.resolve(__dirname, './src')],
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, './tsconfig.app.json'),
              getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
            },
          },
        ],
      },
      {
        test: /\.m4a$/,
        use: ['file-loader'],
      },
    ],
  },
});
