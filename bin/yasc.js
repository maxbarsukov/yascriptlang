#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { compile } from '../src/index.js';

const [, , ...args] = process.argv;
const inputPath = `${process.cwd()}${path.sep}${args[0]}`;
const outputPath = `${process.cwd()}${path.sep}${args[1]}`;

fs.readFile(inputPath, { encoding: 'utf-8' }, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const compiled = compile(data);
  fs.writeFile(outputPath, compiled, outputErr => {
    if (outputErr) {
      console.log(outputErr);
    }
    return outputErr;
  });
});
