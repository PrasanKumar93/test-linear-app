'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('node:child_process');

const {
  defaultItems,
  formatList,
  setItemDone,
  findItemIndex,
  statusLine,
  loadChecklist,
  saveChecklist,
} = require('../src/checklist.js');

const repoRoot = path.join(__dirname, '..');
const binPath = path.join(repoRoot, 'bin', 'checklist.js');

test('defaultItems has expected shape', () => {
  const items = defaultItems();
  assert.ok(items.length >= 4);
  for (const item of items) {
    assert.equal(typeof item.id, 'string');
    assert.equal(typeof item.text, 'string');
    assert.equal(typeof item.done, 'boolean');
  }
});

test('formatList marks done and shows index and id', () => {
  const items = [
    { id: 'a', text: 'First', done: false },
    { id: 'b', text: 'Second', done: true },
  ];
  const out = formatList(items);
  assert.match(out, /\[ \] 1\. First \(a\)/);
  assert.match(out, /\[x\] 2\. Second \(b\)/);
});

test('findItemIndex resolves 1-based index and id', () => {
  const items = [
    { id: 'x', text: 'one', done: false },
    { id: 'y', text: 'two', done: false },
  ];
  assert.equal(findItemIndex(items, '1'), 0);
  assert.equal(findItemIndex(items, '2'), 1);
  assert.equal(findItemIndex(items, 'y'), 1);
  assert.equal(findItemIndex(items, '99'), -1);
});

test('setItemDone toggles and preserves other fields', () => {
  const items = [
    { id: 'a', text: 'T', done: false },
    { id: 'b', text: 'U', done: false },
  ];
  const r = setItemDone(items, '2', true);
  assert.equal(r.ok, true);
  assert.equal(r.items[1].done, true);
  assert.equal(r.items[0].done, false);
});

test('loadChecklist rejects invalid JSON shape', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chk-'));
  const p = path.join(dir, 'bad.json');
  fs.writeFileSync(p, '{}', 'utf8');
  assert.throws(() => loadChecklist(p), /JSON array/);
});

test('round-trip save and load', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chk-'));
  const p = path.join(dir, 'c.json');
  const items = [{ id: 'z', text: 'Zed', done: true }];
  saveChecklist(p, items);
  const loaded = loadChecklist(p);
  assert.deepEqual(loaded, items);
});

test('statusLine counts done items', () => {
  assert.equal(
    statusLine([
      { id: '1', text: '', done: true },
      { id: '2', text: '', done: false },
    ]),
    '1/2 complete'
  );
});

test('CLI init and list with --file in temp dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chk-'));
  const file = path.join(dir, 'my-checklist.json');
  const r1 = spawnSync(process.execPath, [binPath, 'init', '--file', file], {
    encoding: 'utf8',
    cwd: dir,
  });
  assert.equal(r1.status, 0);
  assert.ok(fs.existsSync(file));
  const r2 = spawnSync(process.execPath, [binPath, 'list', '--file', file], {
    encoding: 'utf8',
    cwd: dir,
  });
  assert.equal(r2.status, 0);
  assert.match(r2.stdout, /tests-local/);
});

test('CLI bin exits 0 for help', () => {
  const r = spawnSync(process.execPath, [binPath, '--help'], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /init \[--file/);
});

test('CLI bin check updates file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chk-'));
  const file = path.join(dir, 'c.json');
  saveChecklist(file, [
    { id: 'a', text: 'A', done: false },
    { id: 'b', text: 'B', done: false },
  ]);
  const r = spawnSync(process.execPath, [binPath, 'check', '1', '--file', file], {
    encoding: 'utf8',
    cwd: dir,
  });
  assert.equal(r.status, 0);
  const loaded = loadChecklist(file);
  assert.equal(loaded[0].done, true);
  assert.equal(loaded[1].done, false);
});
