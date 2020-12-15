"use strict";
const fs = require("fs");
const path = require("path")

fs.chmodSync(path.join('.', 'dist', 'revealjs-cli.js'), 0o755)
