#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { compile, runJS } from '../src/index.js';

const [, , ...args] = process.argv;
const filePath = args[0];

fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  runJS(compile(data));
});
