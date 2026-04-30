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
  assert.ok(Array.isArray(report.system.loadAverage));
  assert.equal(report.system.loadAverage.length, 3);
  assert.ok(Array.isArray(report.checks));
  assert.ok(report.checks.length >= 1);
});

test('CLI prints text health report by default', async () => {
  const { stdout } = await run('node', [cliPath]);

  assert.ok(stdout.includes('Health Report:'));
  assert.ok(stdout.includes('Checks:'));
  assert.throws(() => JSON.parse(stdout));
});

test('CLI prints JSON health report when --json flag is set', async () => {
  const { stdout } = await run('node', [cliPath, '--json']);
  const data = JSON.parse(stdout);
  const expectedKeys = ['generatedAt', 'platform', 'uptimeSeconds', 'loadAverage', 'memory', 'cpuCount'];

  assert.deepEqual(Object.keys(data).sort(), expectedKeys.sort());
  assert(isIsoDate(data.generatedAt));
  assert.equal(typeof data.platform, 'string');
  assert.ok(Number.isInteger(data.uptimeSeconds));
  assert.ok(Array.isArray(data.loadAverage));
  assert.equal(data.loadAverage.length, 3);
  assert.equal(typeof data.cpuCount, 'number');
  assert.equal(typeof data.memory.totalMB, 'number');
});
