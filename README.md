# kotatsu

Kotatsu is straightforward CLI tool aiming at running your server-side node.js code in a [HMR](https://webpack.github.io/docs/hot-module-replacement.html) (Hot Module Replacement) environment.

A typical use case for this tool would be to setup a comfortable environment to develop an [express](http://expressjs.com/) API, for instance.

It uses [webpack](https://webpack.github.io/docs/)'s HMR under the hood to perform its magic.

## Installation

Kotatsu can be installed globally or within your node.js project using npm:

```bash
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

*Examples*

```bash
kotatsu script.js

# Needing some more configuration e.g. for loaders
kotastu --config webpack.config.js script.js

# Source map support
kotatsu --source-maps script.js
```

## Express example

## What on earth is a kotatsu?

A [kotatsu](https://en.wikipedia.org/wiki/Kotatsu) is a low Japanase table covered by a heavy blanket with an underneath heat source that keeps you warm in the cold season.

## Inspiration

Kotatsu is widely inspired by the following modules:

- [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware) by [@glenjamin](https://github.com/glenjamin).
- [nodemon](https://github.com/remy/nodemon) by [@remy](https://github.com/remy).

## License

[MIT](LICENSE.txt)
