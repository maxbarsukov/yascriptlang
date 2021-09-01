#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { run } from '../src/index.js';

const [, , ...args] = process.argv;
const filePath = `${process.cwd()}${path.sep}${args}`;

fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  run(data, result => {
    console.log('Result: ', result);
  });
});
