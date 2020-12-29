const path = require('path');

module.exports = {
  entry: './js/index.jsx',
  output: {
    path: path.resolve(__dirname, 'static', 'bundles'),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },  
  resolve: {
    extensions: ['.js', '.jsx', '*']
  },
  devtool: 'source-map',
};

