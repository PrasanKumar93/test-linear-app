#!/usr/bin/env node
'use strict';

const { BRANCH_POLICY_PREFIX } = require('../src/branchPolicy');

function printBranchPolicyPrefix(prefix = BRANCH_POLICY_PREFIX) {
  const safePrefix = (prefix && prefix.trim()) || BRANCH_POLICY_PREFIX;
  process.stdout.write(`${safePrefix}\n`);
}

if (require.main === module) {
  printBranchPolicyPrefix();
}

module.exports = {
  printBranchPolicyPrefix
};
