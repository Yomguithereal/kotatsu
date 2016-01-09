# kotatsu

**kotatsu** is a straightforward CLI tool aiming either at running node.js scripts or serving JavaScript web applications in a modern environment (modules, ES2015, [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement.html), etc.).

Its goal is to relieve developers from the really heavy stack that we now face on a daily basis when working with modern JavaScript.

The idea is to let developers new to the stack forget about it as long as they can and to enable seasoned developers to setup their environment very fast and to start customizing the stack only progressively when this is really needed.

Typical use cases for **kotatsu** are hot-reloaded [express](http://expressjs.com/) APIs written in ES2015, hot-reloaded [React](https://facebook.github.io/react/) or [deku](http://dekujs.github.io/deku/) applications etc. Check the [examples](#examples) for a quick glance of what can be achieved.

Note that **kotatsu** currently uses [webpack](https://webpack.github.io/docs/) under the hood to perform its magic.

## Summary

* [Installation](#installation)
* [Usage](#usage)
* [Use Cases](#use-cases)
  * [Ping](#ping)
  * [Express](#express)
  * [Deku](#deku)
  * [React](#react)
* [Node API](#node-api)
  * [start](#start)
  * [serve](#serve)
  * [monitor](#monitor)
* [What on earth is a kotatsu?](#explanation)
* [Inspiration](#inspiration)
* [License](#license)

## Installation

Kotatsu can be installed globally (you should avoid this!) or within your node.js project using npm:

```bash
# Within your project
npm install --save-dev kotatsu

# Globally:
[sudo] npm install -g kotatsu
```

## Usage

```
Usage: kotatsu <command> {options} [entry]

Commands:
  start    Starts a node.js script.
  serve    Serves a client-side application.
  monitor  Monitors a terminating node.js script. [not implemented yet]

Options:
  -c, --config       Optional webpack config that will be merged with kotatsu's one (useful if you
                     need specific loaders).
  -d, --devtool      Webpack devtool spec to use to compute source maps.    [string] [default: null]
  -m, --mount-node   Id of the mount node in the generated HMTL index.      [string] [default: null]
  -p, --port         Port that the server should listen to.                          [default: 3000]
  -s, --source-maps  Should source maps be computed for easier debugging? [boolean] [default: false]
  --es2015           Is your code written in ES2015?                      [boolean] [default: false]
  --index            Path to a custom HMTL index file.                      [string] [default: null]
  --jsx              Does your code uses JSX syntax?                      [boolean] [default: false]
  --pragma           JSX pragma.                                            [string] [default: null]
  --progress         Should it display the compilation's progress?        [boolean] [default: false]
  --quiet            Disable logs.                                        [boolean] [default: false]
  --version          Show version number                                                   [boolean]
  -h, --help         Show help                                                             [boolean]

Examples:
  kotatsu start ./script.js                       Launching the given script with HMR.
  kotatsu start --es2015 ./scripts.js             Launching a ES2015 script.
  kotatsu start -c webpack.config.js ./script.js  Using a specific webpack config.
  kotatsu start --source-maps ./script.js         Computing source maps.

  kotatsu serve ./entry.js                        Serving the given app.
  kotatsu serve --es2015 --jsx ./entry.jsx        Serving the given ES2015 & JSX app.
  kotatsu serve --port 8000 ./entry.jsx           Serving the app on a different port.
```

If this is your first time using **kotatsu**, you should really check the use cases below to see how it could fit your workflow.

## Use cases

### Ping

### Express

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

### Deku

### React

For more information about this part, see webpack's [docs](https://webpack.github.io/docs/).

## Node API

```js
var kotatsu = require('kotatsu');
```

### start

The kotatsu function takes a single parameter object having the following keys:

* **entry** [required] *string*: Path towards the entry.
* **cwd** *string*: current working directory.
* **config** *object*: a webpack config object.
* **output** *string*: path of the directory where built files will be written.
* **sourceMaps** *boolean* [`false`]: should it compute source maps?

*Example*

```js
var kotatsu = require('kotatsu');

var watcher = kotatsu({
  entry: 'script.js',
  sourceMaps: true
})
```

### serve

### monitor

Not yet implemented.

<h2 id="explanation">What on earth is a kotatsu?</h2>

A [kotatsu](https://en.wikipedia.org/wiki/Kotatsu) is a low Japanase table covered by a heavy blanket with an underneath heat source that keeps you warm in the cold season.

## Inspiration

**kotatsu** is widely inspired by the following modules:

- [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) by [@glenjamin](https://github.com/glenjamin).
- [nodemon](https://github.com/remy/nodemon) by [@remy](https://github.com/remy).

## License

[MIT](LICENSE.txt)
