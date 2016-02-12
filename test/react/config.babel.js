import path from 'path';

export default {
  entry: [path.join(__dirname, './main.jsx')],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react', 'react-hmre']
        }
      }
    ]
  }
};
