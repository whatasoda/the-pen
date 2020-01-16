const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const merge = require('webpack-merge');

const __rootdir = path.resolve(__dirname, '../../');

const styledComponentsTransformer = createStyledComponentsTransformer();

module.exports = merge({
  entry: [path.resolve(__rootdir, 'src/index.ts')],
  output: {
    path: path.resolve(__rootdir, 'dist'),
    chunkFilename: '[name].[hash].bundle.js',
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
    new HtmlWebpackPlugin({
      template: path.resolve(__rootdir, 'src/index.html'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__rootdir, 'tsconfig.app.json'),
              getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
            },
          },
        ],
      },
      {
        test: /\.(m4a|svg|jpg|png)$/i,
        use: ['file-loader'],
      },
    ],
  },
});
