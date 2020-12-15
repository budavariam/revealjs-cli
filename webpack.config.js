/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

'use strict';

const path = require('path');
const { ContextReplacementPlugin, BannerPlugin } = require('webpack');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

  entry: './src/index.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: { // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'revealjs-cli-server.js',
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: 'source-map',
  externals: {
    // Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js'],
    alias: {
      // 'ejs': 'ejs/ejs.min.js' // would solve the build warning, BUT makes it unusable:  `TypeError: fs.existsSync is not a function`
    }
  },
  plugins: [
    new ContextReplacementPlugin(/any-promise/),
    new BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
  ],
  node: {
    __dirname: false, // necessary to be able to use as a cli tool in other projects, otherwise webpack strips the absolute path
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            "module": "es6" // override `tsconfig.json` so that TypeScript emits native JavaScript modules.
          }
        }
      }]
    }]
  },
}

module.exports = config;