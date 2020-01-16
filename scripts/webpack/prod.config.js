const webpack = require('webpack');
const merge = require('webpack-merge');

module.exports = merge(require('./common.config'), {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      },
    }),
  ],
});
