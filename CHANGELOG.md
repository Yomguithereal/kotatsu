# Changelog

## 0.20.0

* `--public` is now nargs=2 so you can specify a custom mounting point.
* Adding `package.json` configuration through the `kotatsu` key.

## 0.18.0

* Upgrading dependencies.

## 0.17.0

* Handling object rest spread and class properties by default.
* Fixing default build path for client.
* Upgrading dependencies.

## 0.16.0

* Upgrading all dependencies (latest babel & webpack).
* Transpiling `es2015` code by default.
* Adding callback to `build`.
* Changing `--minify` into `--production`.
* CSS support.
* SCSS support.

## 0.15.2

* Fixing `node_modules` handling for backend usage.

## 0.15.1

* Upgrading to `babel-loader` 7.0.0.

## 0.15.0

* Upgrading dependencies and switching to webpack 2.

## 0.14.0

* Adding unicode support for default HTML ([@bverjat](https://github.com/bverjat)).

## 0.13.0

* Adding the `cors` option ([@SeeThruHead](https://github.com/SeeThruHead)).

## 0.12.2

* Fixing issues concerning `require.resolve` on Windows.
* Exiting with the correct code when failing a build ([@SeeThruHead](https://github.com/SeeThruHead)).

## 0.12.1

* Fixing an issue related to child processes with Windows.

## 0.12.0

* Redirecting every route on the index.
* Adding the `server` option.
* Fixing an issue concerning default options.
* Updating `http-proxy-middleware`.

## 0.11.0

* Updating dependencies.
* Proxy is now copying headers correctly.
* Source maps are now default.
* Merging some specific entries to avoid collisions.

## 0.10.0

* Adding plugins merging.
* Fixing ES6 config support.

## 0.9.1

* Cleaner log for the `serve` command.
* Better log for the `build` command.
* Fixing config merging precedences.

## 0.9.0

* Handling `webpack.config.babel.js`.

## 0.8.3

* Attempting to resolve entry file rather than checking the file's existence.
* Better priorities when solving webpack config.
* Fixing update logs.

## 0.8.2

* Fixing single string as webpack entry.
* Fixing error display when failing to load webpack config.

## 0.8.1

* Fixing missing dependency.

## 0.8.0

* Adding `--proxy`.
* The `devServer` options of the webpack config are now passed to `webpack-dev-middleware`.
* Possibility to read the entry from a webpack config.
* Fixing an issue with the `run` command watching for changes.

## 0.7.0

* Adding the `run` command.
* Adding the `build` command.
* Adding the `monitor` command.
* Adding the `--minify` option.
* Better `--output` option.
* Improving UX.

## 0.6.0

* Adding `--public`.
* Back to lodash v3 for faster installation.

## 0.5.0

* Adding `--babel`.

## 0.4.2

* Using `--devtool` now implicitly enables `--source-maps`.

## 0.4.1

* Handling warnings correctly.

## 0.4.0

* Adding json support for client.
* Fixing a progress bar collision.

## 0.3.3

* Fixing a bug when using both `--es2015` and `--presets`.
* Adding `NoErrorsPlugin` back.

## 0.3.2

* Fixing `__dirname` and `__filename`.

## 0.3.1

* Fixing json support for node.

## 0.3.0

* Adding `--output`.
* Adding `--presets`.
* Better logs.
* Supporting script arguments through `--`.
* Fixing `--es2015` and `--jsx`.

## 0.2.0

* New tool covering client-side usage.

## 0.1.2

* Fixing yet another issue with JSON loader.

## 0.1.1

* Fixing an issue with the JSON loader.

## 0.1.0

* Handling compilation errors.
* Handling relative paths without `./` as entry.
* Handling JSON out of the box.

## 0.0.8

* Adding `--version`.
* Fixing and issue with `__dirname` and `__filename`.
