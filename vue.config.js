const { defineConfig } = require('@vue/cli-service')
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];
const isProduction = process.env.NODE_ENV === "production";


module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false, //打包不生成map
  devServer: {
    port: 8088,
    proxy: {
      "/api": {
        target: "http://localhost:8887/api/",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
  configureWebpack: (config) => {
    if (isProduction) {
      // 开启gzip压缩
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: "gzip",
          test: /\.js$|\.html$|\.json$|\.css/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    }
  },
})
