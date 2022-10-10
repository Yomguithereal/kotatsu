# kotatsu

**kotatsu** is a straightforward CLI tool aiming either at running node.js scripts or serving JavaScript/TypeScript web applications in a modern environment (modules, ES2015, [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement.html), etc.).

Its goal is to relieve developers from the really heavy stack that we now face on a daily basis when working with modern JavaScript.

The idea is to let developers new to the stack forget about it as long as they can while enabling seasoned developers to setup their environment very fast and to start customizing the stack progressively only when this is really needed.

Typical use cases for **kotatsu** are hot-reloaded [express](http://expressjs.com/) APIs written in ES2015, hot-reloaded [React](https://facebook.github.io/react/) or [deku](http://dekujs.github.io/deku/) applications etc. Check the [use cases](#use-cases) for a quick glance of what can be achieved.

Note that **kotatsu** currently uses [webpack](https://webpack.github.io/docs/) under the hood to perform its magic.

## Summary

* [Installation](#installation)
* [Usage](#usage)
* [Package Config](#package-config)
* [Typescript](#typescript)
* [Style](#style)
* [JSON and YML](#json-and-yaml)
* [Use Cases](#use-cases)
  * [Interval](#interval)
  * [Express](#express)
  * [Deku](#deku)
  * [React](#react)
* [Node API](#node-api)
  * [start](#start)
  * [serve](#serve)
  * [monitor](#monitor)
  * [run](#run)
  * [build](#build)
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
  cli.js start    Start a node.js script.
  cli.js serve    Serve a client-side application.
  cli.js monitor  Monitor a terminating node.js script.
  cli.js run      Run the given node.js script.
  cli.js build    Build your code for client or server.

Options:
  -c, --config            Optional webpack config that will be merged with kotatsu's one (useful if
                          you need specific loaders).
  -d, --devtool           Webpack devtool spec to use to compute source maps.               [string]
  -m, --mount-node        Id of the mount node in the generated HMTL index.[string] [default: "app"]
  -o, --output            Output path (either directory or filename).                       [string]
  -p, --port              Port that the server should listen to.                     [default: 3000]
  -s, --source-maps       Should source maps be computed for easier debugging?
                                                                           [boolean] [default: true]
      --cors              Should the server allow CORS?                    [boolean] [default: true]
      --index             Path to a custom HMTL index file. Will default to `./index.html` if
                          present.                                                          [string]
      --jsx               Does your code uses JSX syntax?                 [boolean] [default: false]
      --pragma            JSX pragma.                                                       [string]
      --sass              Whether to transpile scss files (requires `sass` or `node-sass`).
                                                                          [boolean] [default: false]
      --typescript, --ts  Whether to support TypeScript (requires `typescript`). Enabled by default
                          if target entry has .ts or .tsx extension.      [boolean] [default: false]
      --open              Whether to open your browser on the served application.
                                                                          [boolean] [default: false]
      --presets           Babel presets separated by a comma (example:
                          @babel/preset-stage-2,@babel/preset-react).                       [string]
      --production        Whether to build for production (minify + define).
                                                                          [boolean] [default: false]
      --progress          Should it display the compilation's progress?   [boolean] [default: false]
      --proxy             Proxy information (example: --proxy /api http://localhost:4000)   [string]
      --public            Mounting a path to a public folder (example: --public /data ./src/data).
                          Can be used several times. Works with directories and single files.
                                                                                            [string]
  -r, --html5-routing     Whether to enable HTML5 routing, i.e. redirect every unknown url on the
                          index page to avoid reload issues.              [boolean] [default: false]
      --quiet             Disable logs.                                   [boolean] [default: false]
      --version           Show version number                                              [boolean]
  -h, --help              Show help                                                        [boolean]

Examples:
  kotatsu start script.js                           Launching the given script with HMR.
  kotatsu start -c webpack.config.js script.js      Using a specific webpack config.
  kotatsu start --no-source-maps script.js          Disabling source maps.
  kotatsu start script.js -- --path test.js         Passing arguments to the script.

  kotatsu serve entry.js                            Serving the given app.
  kotatsu serve --jsx entry.jsx                     Serving the given app with JSX code.
  kotatsu serve --port 8000 entry.jsx               Serving the app on a different port.
  kotatsu serve --proxy /api http://localhost:4000  Proxying an API.
  kotatsu serve --public /data ./src/data           Serving local static files.
  kotatsu serve --sass entry.js                     Supporting SASS stylesheets.
  kotatsu serve --typescript entry.ts               Serving a TypeScript app.

  kotatsu build server entry.js -o ./               Build the given server script.
  kotatsu build client --production entry.js -o ./  Build the given client app for production.
```

If this is your first time using **kotatsu**, you should really check the use cases below to see how it could fit your workflow.

## Package config

If you don't want to repeat yourself in your npm scripts know that you can use the `kotatsu` key of your project's `package.json` to keep a global configuration for the CLI:

```json
{
  "scripts": {
    "dev": "kotatsu serve ./entry.js"
  },
  "kotatsu": {
    "progress": true,
    "public": ["/data", "./src/data"]
  }
}
```

## TypeScript

**kotatsu** supports TypeScript out of the box. If you want to use TypeScript in your project, just ensure you have a valid `tsconfig.json` file and that you have installed the `typescript` dependencies.

If your entry does not have the `.ts` or `.tsx` extension you will need to use the `--typescript` flag else everything should work automatically.

## Style

**kotatsu** lets you import CSS files out of the box. If you need to import SCSS files, you can use the `--sass` flag but be sure to install `sass` (or `node-sass`) for it to work.

## JSON and YAML

JSON and YAML imports are automatically dealt with.

## Use cases

### Interval

This example does not really serve a real-life purpose but merely shows you how to hot-reload a very simple node.js script.

The idea here is to create a script that will continuously print a required string into the console every 2 seconds:

**1. Creating the necessary files**

```js
// file: interval.js
var string = require('./string.js');

setInterval(function() {
  console.log(string);
}, 2000);

// Here is the twist: whenever the `string` dependency is updated, we will swap it:
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

Now edit the `string.js` file and the script will automatically update and log the new exported value of the file.

**3. Let's use the same script in the browser**

You would rather run this script in the browser?

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

module.exports = app;
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

**1. Installing necessary dependencies**

```bash
npm i --save deku
npm i --save-dev kotatsu
```

**2. Creating our main component**

```jsx
// file: App.jsx
import {element} from 'deku';

export default function App() {
  return <div>Hello World!</div>;
}
```

**3. Creating our application's entry**

```jsx
// file: main.jsx
import {dom, element} from 'deku';
import InitalApp from './App.jsx';

const mountNode = document.getElementById('app'),
      render = dom.createRenderer(mountNode);

function refresh(Component) {
  render(<Component />);
}
refresh(InitalApp);

// Let's handle our code's updates
if (module.hot) {
  module.hot.accept('./App.jsx', function() {
    const NextApp = require('./App.jsx');
    refresh(NextApp);
  });
}
```

**4. Using kotatsu**

Now let's run a server to host our app:

```bash
kotatsu serve --jsx --pragma element main.jsx
```

Note that **kotatsu** will serve for you a HTML index file looking quite like this:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>kotatsu</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="text/javascript" src="/build/bundle.js"></script>
  </body>
</html>
```

If you need a custom one, just use the `--index` argument.

Now visit `localhost:3000` and you are ready to develop.

### React

React is a bit more tricky because we need to install a Babel 6 preset (`react-hmre`) to handle hot-loading.

**1. Installing necessary dependencies**

```bash
npm i --save react react-dom
npm i --save-dev kotatsu babel-preset-react babel-preset-react-hmre
```

**2. Creating our main component**

```jsx
// file: App.jsx
import React, {Component} from 'react';

export default class App extends Component {
  render() {
    return <div>Hello World!</div>;
  }
}
```

**3. Creating our application's entry**

```jsx
// file: main.jsx
import React from 'react';
import {render} from 'react-dom';
import App from './App.jsx';

const mountNode = document.getElementById('app');

render(<App />, mountNode);
```

**4. Using kotatsu**

Now let's run a server to host our app:

```bash
kotatsu serve --jsx ./main.jsx
```

Note that **kotatsu** will serve for you a HTML index file looking quite like this:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>kotatsu</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="text/javascript" src="/build/bundle.js"></script>
  </body>
</html>
```

If you need a custom one, just use the `--index` argument.

Now visit `localhost:3000` and you are ready to develop.

## Node API

```js
var kotatsu = require('kotatsu');
```

Every method of the library uses the same configuration object (similar to the CLI arguments):

*required*

* **entry** *string*: Path towards the entry.

*optional*

* **args** *array*: array of arguments to pass to the child script.
* **cwd** *string* [`process.cwd()`]: current working directory.
* **config** *object*: a webpack config object.
* **cors** *boolean* [`true`]: should the server allow CORS?
* **devtool** *string*: a webpack devtool [spec](https://webpack.github.io/docs/configuration.html#devtool).
* **index** *string*: path of the HTML index file to serve.
* **jsx** *boolean* [`false`]: should we handle JSX?
* **mountNode** *string* [`'app'`]: id of the mount node in the generated HTML index file.
* **open** *boolean* [`false`]: Whether to open the app in you web browser as soon as served.
* **output** *string* [`.kotatsu`]: path of the built file.
* **port** *integer* [`3000`]: port that the server should listen to.
* **pragma** *string*: custom JSX pragma.
* **presets** *array*: Babel 6 presets to apply.
* **production** *boolan*: Whether to build for production, i.e. minify output and define `NODE_ENV` as `production`.
* **progress** *boolean* [`false`]: should the compiler display a progress bar?
* **proxy** *array*: proxy information.
* **quiet** *boolean* [`false`]: if true, will disable all console logs.
* **server** *function*: function called with the express app in case you want to apply custom middlewares etc.
* **sourceMaps** *boolean* [`true`]: should it compute source maps?

### start

```js
var watcher = kotatsu.start({
  entry: 'script.js',
  ...
})
```

### serve

```js
var server = kotatsu.serve({
  entry: 'script.js',
  ...
})
```

### monitor

```js
var watcher = kotatsu.monitor({
  entry: 'script.js',
  ...
})
```

### run

```js
kotatsu.run({
  entry: 'script.js',
  ...
});
```

### build

```js
// side can be either 'front' or 'back'
kotatsu.build(side, {
  entry: 'script.js',
  ...
}, callback);
```

<h2 id="explanation">What on earth is a kotatsu?</h2>

A [kotatsu](https://en.wikipedia.org/wiki/Kotatsu) is a low Japanase table covered by a heavy blanket with an underneath heat source that keeps you warm in the cold season.

## Inspiration

**kotatsu** is widely inspired by the following modules:

- [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) by [@glenjamin](https://github.com/glenjamin).
- [nodemon](https://github.com/remy/nodemon) by [@remy](https://github.com/remy).

## License

[MIT](LICENSE.txt)
