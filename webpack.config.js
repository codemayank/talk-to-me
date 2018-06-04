const webpack = require('webpack')
const merge = require('webpack-merge')
const HTMLWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const parts = require('./webpack.parts')
const glob = require('glob')
const path = require('path')
const PATHS = {
  app: path.join(__dirname, './client'),
  build: path.join(__dirname, 'dist')
}
const commonConfig = merge([
  {
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: { minimize: true }
            }
          ]
        }
      ]
    },
    plugins: [
      new HTMLWebPackPlugin({
        template: __dirname + '/client/index.html',
        filename: './index.html'
      })
    ]
  }
])
const productionConfig = merge([
  parts.clean(PATHS.build),
  parts.minifyJavaScript(),

  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor_app',
            chunks: 'all'
          }
        }
      }
    }
  },
  parts.extractCSS({
    use: ['css-loader', parts.autoprefix()]
  }),
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.html`, {
      nodir: true
    })
  }),
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[ext]'
    }
  })
])

const developmentConfig = merge([parts.loadCSS(), parts.loadImages()])
module.exports = mode => {
  if (mode === 'production') {
    return merge(commonConfig, productionConfig, { mode })
  }
  return merge(commonConfig, developmentConfig, { mode })
}
