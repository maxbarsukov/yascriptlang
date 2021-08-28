#!/usr/bin/env node

import say from '../src/index.js'

const args = process.argv.splice(process.execArgv.length + 2);
const name = args[0];

say('Hello ' + name);