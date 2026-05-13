const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { BRANCH_POLICY_PREFIX, getBranchPolicyPrefix } = require('../src/branchPolicy');

test('exposes the expected branch policy prefix constant', () => {
  assert.strictEqual(BRANCH_POLICY_PREFIX, 'policy-smoke');
  assert.strictEqual(getBranchPolicyPrefix(), 'policy-smoke');
});

test('policy-smoke CLI prints the required prefix', () => {
  const binPath = path.resolve(__dirname, '..', 'bin', 'policy-smoke.js');
  const result = spawnSync(process.execPath, [binPath], { encoding: 'utf8' });
  assert.strictEqual(result.status, 0);
  assert.strictEqual(result.stdout.trim(), 'policy-smoke');
});
