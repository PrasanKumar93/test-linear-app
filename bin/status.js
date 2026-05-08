#!/usr/bin/env node
const { getStatusMessage } = require('../src/status');

const [, , name] = process.argv;
const message = getStatusMessage(name);
console.log(message);
