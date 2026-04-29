'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');

const run = promisify(execFile);
const cliPath = path.resolve(__dirname, '..', 'bin', 'health-report.js');
const { buildHealthReport } = require('../bin/health-report');

function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

test('buildHealthReport returns expected sections', () => {
  const report = buildHealthReport();

  assert.equal(report.status, 'ok');
  assert(isIsoDate(report.generatedAt));
  assert.ok(report.system);
  assert.equal(typeof report.system.hostname, 'string');
  assert.ok(Number.isInteger(report.system.uptimeSeconds));
  assert.ok(Array.isArray(report.checks));
  assert.ok(report.checks.length >= 1);
});

test('CLI prints JSON health report', async () => {
  const { stdout } = await run('node', [cliPath]);
  const data = JSON.parse(stdout);

  assert.equal(data.status, 'ok');
  assert(isIsoDate(data.generatedAt));
  assert.ok(Array.isArray(data.checks));
});
