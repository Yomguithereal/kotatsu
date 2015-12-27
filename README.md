# kotatsu

**kotatsu** is straightforward CLI tool aiming at running your server-side node.js code in a [HMR](https://webpack.github.io/docs/hot-module-replacement.html) (Hot Module Replacement) environment.

A typical use case for this tool would be to setup a comfortable environment to develop an [express](http://expressjs.com/) API, for instance.

It uses [webpack](https://webpack.github.io/docs/)'s HMR under the hood to perform its magic.

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
  -h, --help         Show help                                                             [boolean]
```

If this is your first time using **kotatsu**, you should really read the express part below to have a full example on how you might integrate this tool in your project.

*Examples*

```bash
kotatsu script.js

# Needing some more configuration e.g. for loaders
kotastu --config webpack.config.js script.js

# Source map support
kotatsu --source-maps script.js
```

## Express example

Let's setup a quick hot-reloaded express app:

**1. Installing necessary dependencies**

```bash
npm i --save express
npm i --save-dev kotatsu json-loader
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

**4. Creating a webpack config**

```js
// file: webpack.config.js

// express modules use .json files and we should tell webpack to load them
// note that this is where one should add a `babel` loader to use ES2015, for instance.
module.exports = {
  module: {
    loaders: {
      test: /\.json$/,
      loader: 'json'
    }
  }
}
```

For more information about this part, see webpack's [docs](https://webpack.github.io/docs/).

**5. Using kotatsu**

Launching our app with HMR so we can work comfortably.

```bash
kotatsu --source-maps --config webpack.config.js ./start.js
```

## What on earth is a kotatsu?

A [kotatsu](https://en.wikipedia.org/wiki/Kotatsu) is a low Japanase table covered by a heavy blanket with an underneath heat source that keeps you warm in the cold season.

## Inspiration

**kotatsu** is widely inspired by the following modules:

- [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) by [@glenjamin](https://github.com/glenjamin).
- [nodemon](https://github.com/remy/nodemon) by [@remy](https://github.com/remy).

## License

[MIT](LICENSE.txt)
