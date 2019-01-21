/* global __dirname, require, module*/
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
      phog: './index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].min.js',
      library:['phog']
      //libraryTarget: 'umd',
    },
    target:'web',
    resolve: {
      extensions: ['.js']
    },
    optimization: {
      minimizer: [new TerserPlugin()],
    },
}


