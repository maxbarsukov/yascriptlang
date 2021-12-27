#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { compile } from '../src/index.js';

const [, , ...args] = process.argv;
const inputPath = args[0];
const outputPath = args[1];

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
