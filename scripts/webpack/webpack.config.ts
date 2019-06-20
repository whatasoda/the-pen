import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ip from 'ip';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import path from 'path';
import multi from 'multi-loader';
import { Configuration } from 'webpack';
import TerserJSPlugin from 'terser-webpack-plugin';

const __DEV__ = process.env.NODE_ENV !== 'production';
const __PROD__ = !__DEV__;
const srcRoot = path.resolve(__dirname, '../../entries');
const distRoot = path.resolve(__dirname, '../../dist');

export default (): Configuration => ({
  devtool: 'source-map',
  entry: {
    app: path.resolve(srcRoot, 'app.ts'),
  },
  output: {
    path: distRoot,
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.html', '.scss'],
  },
  devServer: {
    contentBase: distRoot,
    compress: true,
    host: ip.address() || 'localhost',
    port: 8080,
    https: true,
  },
  optimization: {
    minimizer: __PROD__ ? [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})] : [],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      memoryLimit: 4096,
      useTypescriptIncrementalApi: false,
      workers: ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [multi(['ts-loader?transpileOnly', 'thread-loader!eslint-loader'])],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              minimize: true,
            },
          },
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: __DEV__,
              importLoaders: 1,
              localIdentName: __DEV__ ? '[path]___[name]__[local]___[hash:base64:5]' : '[hash:base64:16]',
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
});
