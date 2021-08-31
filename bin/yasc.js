#!/usr/bin/env node

import { compile, runJS } from '../src/index.js';
import fs from 'fs';
import path from 'path';

const [,, ...args] = process.argv;
const inputPath = `${process.cwd()}${path.sep}${args[0]}`
const outputPath = `${process.cwd()}${path.sep}${args[1]}`

fs.readFile(inputPath, { encoding: 'utf-8' }, (err, data) => {
  if (err) {
    console.error(err)
    return;
  }
  const compiled = compile(data);
  fs.writeFile(outputPath, compiled, (err) => {
    if(err) {
      return console.log(err);
    }
  });
});
