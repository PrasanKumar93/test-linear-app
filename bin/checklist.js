#!/usr/bin/env node
'use strict';

const { run } = require('../src/checklist.js');

process.exitCode = run(process.argv.slice(2));
