const test = require('node:test');
const assert = require('node:assert');
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
