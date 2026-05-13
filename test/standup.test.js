import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeStandup } from '../src/standup.js';

const sampleEntries = [
  {
    name: 'Alex',
    yesterday: 'finished the UI polish',
    today: 'start writing smoke tests',
    blockers: 'awaiting API review'
  },
  {
    name: 'Devi',
    yesterday: 'documented the rollout steps',
    today: 'work on the smoke automation',
    blockers: ''
  }
];

test('summarizeStandup formats multiple entries and fills defaults', () => {
  const summary = summarizeStandup(sampleEntries);
  assert(summary.startsWith('Standup Summary (2 updates)'));
  assert(summary.includes('1. Alex'));
  assert(summary.includes('   Yesterday: finished the UI polish'));
  assert(summary.includes('   Blockers: awaiting API review'));
  assert(summary.includes('2. Devi'));
  assert(summary.includes('   Blockers: None'));
});

test('summarizeStandup handles empty arrays without error', () => {
  const summary = summarizeStandup([]);
  assert.equal(summary, 'Standup Summary (0 updates)\nNo standup entries were provided.');
});

test('summarizeStandup rejects invalid entries', () => {
  assert.throws(
    () => summarizeStandup([null]),
    { name: 'TypeError' }
  );
});
