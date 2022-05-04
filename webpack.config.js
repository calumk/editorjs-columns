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
    ],
  },
  // node: { global: true, fs: 'empty' },
  // optimization: {
  //   minimize: false
  // },
};
