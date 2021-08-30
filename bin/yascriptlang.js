#!/usr/bin/env node

import run from '../src/index.js'

const args = process.argv.splice(process.execArgv.length + 2);

const code = `
let (mut a = 10) -> {
    println(a);
  }
`

run(code, result => {
  console.log('Result: ', result);
});
