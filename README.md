# kotatsu

**kotatsu** is a straightforward CLI tool aiming either at running node.js scripts or serving JavaScript web applications in a modern environment (modules, ES2015, [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement.html), etc.).

Its goal is to relieve developers from the really heavy stack that we now face on a daily basis when working with modern JavaScript.

The idea is to let developers new to the stack forget about it as long as they can while enabling seasoned developers to setup their environment very fast and to start customizing the stack progressively only when this is really needed.

Typical use cases for **kotatsu** are hot-reloaded [express](http://expressjs.com/) APIs written in ES2015, hot-reloaded [React](https://facebook.github.io/react/) or [deku](http://dekujs.github.io/deku/) applications etc. Check the [use cases](#use-cases) for a quick glance of what can be achieved.

Note that **kotatsu** currently uses [webpack](https://webpack.github.io/docs/) under the hood to perform its magic.

## Summary

* [Installation](#installation)
* [Usage](#usage)
* [Use Cases](#use-cases)
  * [Interval](#interval)
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

This example does not really serve a real-life purpose but merely shows you how to hot-reload a very simple node.js script.

The idea here is to create a script that will continuously print a required string into the console every 2 seconds:

**1. Creating the necessary files**

```js
// file: interval.js
var string = require('./string.js');

setInterval(function() {
  console.log(string);
}, 2000);

// Here is the twist, whenever the `string` dependency is updated, we will swap it:
if (module.hot) {
  module.hot.accept('./string.js', function() {
    string = require('./string.js');
  });
}
```

```js
// file: string.js
module.exports = 'ping';
```

**2. Using kotatsu to start the script**

```bash
kotatsu start interval.js
```

Now the script will start and you should see it logging `ping` into the console every two seconds.

Just try editing the `string.js` file and the script will automatically update to log the new exported value of the file.

**3. Let's use the same script in the browser**

You would rather run this script in the browser? As you wish:

```js
kotatsu serve interval.js
```

Now go to `localhost:3000` and you should be able to observe the same kind of results in the console.

**Remarks**

This example serves another purposes: showing you that **kotatsu** is meant to be used on long-running scripts such as servers or UIs. If what you need is to code a terminating script, check the `monitor` command instead.

If you need more information about `module.hot` and Hot Module Replacement (HMR), go check webpack's [docs](https://webpack.github.io/docs/hot-module-replacement.html) on the subject.

### Express

Let's setup a very simple hot-reloaded express app:

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
kotatsu start ./start.js
```

You can now edit the express app live and it will automatically update without having to reload the script.

### Deku

### React

For more information about this part, see webpack's [docs](https://webpack.github.io/docs/).

## Node API

```js
var kotatsu = require('kotatsu');
```

Every method of the lib handles the same configuration object (similar to the CLI arguments):

*required*

* **entry** *string*: Path towards the entry.

*optional*

* **cwd** *string* [`process.cwd()`]: current working directory.
* **config** *object* [`null`]: a webpack config object.
* **devtool** *string* [`null`]: a webpack devtool [spec](https://webpack.github.io/docs/configuration.html#devtool).
* **es2015** *boolean* [`false`]: should we handle ES2015 files?
* **index** *string* [`null`]: path of the HTML index file to serve.
* **jsx** *boolean* [`false`]: should we handle JSX?
* **mountNode** *string* [`'app'`]: id of the mount node in the generated HTML index file.
* **output** *string* [`.kotatsu`]: path of the directory where built should go.
* **port** *integer* [`3000`]: port that the server should listen to.
* **pragma** *string* [`null`]: custom JSX pragma.
* **progress** *boolean* [`false`]: should the compiler display a progress bar?
* **quiet** *boolean* [`false`]: if true, will disable all console logs.
* **sourceMaps** *boolean* [`false`]: should it compute source maps?

### start

```js
var watcher = kotatsu.start({
  entry: 'script.js',
  ...
})
```

### serve

```js
var watcher = kotatsu.serve({
  entry: 'script.js',
  ...
})
```

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
