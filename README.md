# kotatsu

**kotatsu** is a straightforward CLI tool aiming at running your server-side node.js code in a [HMR](https://webpack.github.io/docs/hot-module-replacement.html) (Hot Module Replacement) environment.

A typical use case for this tool would be to setup a comfortable environment to develop an [express](http://expressjs.com/) API, for instance.

It uses [webpack](https://webpack.github.io/docs/)'s HMR under the hood to perform its magic.

## Summary

* [Installation](#installation)
* [Usage](#usage)
* [Express example](#express-example)
* [Node API](#node-api)
* [What on earth is a kotatsu?](#explanation)
* [Inspiration](#inspiration)
* [License](#license)

## Installation

Kotatsu can be installed globally or within your node.js project using npm:

```bash
# For a local project
npm install --save-dev kotatsu

# Globally:
[sudo] npm install -g kotatsu
```

## Usage

```
Usage: kotatsu {options} [entry]

Options:
  -c, --config       Optional webpack config that will be merged with kotatsu's one (useful if you
                     need specific loaders).
  -o, --output       Optional output directory where built files should be written (DO NOT use an
                     existing directory because it will be erased).
  -s, --source-maps  Should source maps be computed for easier debugging? [boolean] [default: false]

  --version          Show version number                                                   [boolean]
  -h, --help         Show help                                                             [boolean]
```

*Examples*

```bash
kotatsu script.js

# Needing some more configuration e.g. for loaders
kotatsu --config webpack.config.js script.js

# Source map support
kotatsu --source-maps script.js
```

If this is your first time using **kotatsu**, you should really read the express part below to have a full example on how you might integrate this tool in your project.

## Express example

Let's setup a quick hot-reloaded express app:

**1. Installing necessary dependencies**

```bash
npm i --save express
npm i --save-dev kotatsu
```

**2. Creating our app**

```js
// file: app.js
var express = require('express');

var app = express();

app.get('/', function(req, res) {
  return res.send('Hello World!');
});
```

**3. Creating our startup script**

```js
// file: start.js
var app = require('./app.js'),
    http = require('http');

var server = http.createServer(app);

server.listen(3000);

if (module.hot) {

  // This will handle HMR and reload the server
  module.hot.accept('./app.js', function() {
    server.removeListener('request', app);
    app = require('./app.js');
    server.on('request', app);
    console.log('Server reloaded!');
  });
}
```

**4. Using kotatsu**

Launching our app with HMR so we can work comfortably.

```bash
kotatsu ./start.js
```

## ES2015 example

To compile your ES2015 code, you can optionally pass a webpack config to kotatsu to tweak its compiler and use any needed loaders.

```bash
npm install --save-dev babel-core babel-loader babel-preset-es2015
```

```js
// file: webpack.config.js
module.exports = {
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
}
```

```bash
kotatsu --source-maps --config webpack.config.js ./es2015-script.js
```

For more information about this part, see webpack's [docs](https://webpack.github.io/docs/).

## Node API

The kotatsu function takes a single parameter object having the following keys:

* **entry** [required] *string*: Path towards the entry.
* **cwd** *string*: current working directory.
* **config** *object*: a webpack config object.
* **output** *string*: path of the directory where built files will be written.
* **sourcemaps** *boolean* [`false`]: should it compute sourcemaps?

*Example*

```js
var kotatsu = require('kotatsu');

var watcher = kotatsu({
  entry: 'script.js',
  sourcemaps: true
})
```

<h2 id="explanation">What on earth is a kotatsu?</h2>

A [kotatsu](https://en.wikipedia.org/wiki/Kotatsu) is a low Japanase table covered by a heavy blanket with an underneath heat source that keeps you warm in the cold season.

## Inspiration

**kotatsu** is widely inspired by the following modules:

- [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) by [@glenjamin](https://github.com/glenjamin).
- [nodemon](https://github.com/remy/nodemon) by [@remy](https://github.com/remy).

## License

[MIT](LICENSE.txt)
