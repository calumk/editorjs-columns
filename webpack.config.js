const path = require('path');

module.exports = {
  entry: './src/editorjs-columns.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'editorjs-columns.bundle.js',
    library: 'editorjsColumns',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.svg$/,
        use : [{
            loader  : 'svg-inline-loader',
            options : {
                removeSVGTagAttrs : false
            }
        }]
      }
    ],
  },
  // node: { global: true, fs: 'empty' },
  // optimization: {
  //   minimize: false
  // },
};
