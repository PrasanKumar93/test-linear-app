const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { getStatusMessage } = require('../src/status');

test('returns default status when no name provided', () => {
  assert.strictEqual(getStatusMessage(), 'Status: Codex systems nominal.');
});

test('uses the provided name when supplied', () => {
  assert.strictEqual(getStatusMessage('PRA-9'), 'Status: PRA-9 systems nominal.');
});

test('trims extra whitespace in the name input', () => {
  assert.strictEqual(getStatusMessage('  PRA-9  '), 'Status: PRA-9 systems nominal.');
});

test('CLI joins multi-word names into a single argument', () => {
  const binPath = path.resolve(__dirname, '..', 'bin', 'status.js');
  const result = spawnSync(process.execPath, [binPath, 'Agentic', 'PM'], {
    encoding: 'utf8'
  });
  assert.strictEqual(result.status, 0);
  assert.strictEqual(result.stdout.trim(), 'Status: Agentic PM systems nominal.');
});
