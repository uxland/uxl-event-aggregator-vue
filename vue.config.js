var webpack = require("webpack");
var path = require("path");
var glob = require("glob");

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js"
      }
    }
  }
};
