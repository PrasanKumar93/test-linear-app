#!/usr/bin/env node
const { getStatusMessage } = require('../src/status');

const args = process.argv.slice(2);
const name = args.length ? args.join(' ') : undefined;
const message = getStatusMessage(name);
console.log(message);
