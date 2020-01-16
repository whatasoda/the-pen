const webpack = require('webpack');
const merge = require('webpack-merge');
const ip = require('ip');

module.exports = merge(require('./common.config'), {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
  devServer: {
    compress: false,
    host: ip.address() || 'localhost',
    port: 8080,
    https: true,
  },
});
