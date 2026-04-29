'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_FILENAME = '.release-checklist.json';

const defaultItems = () => [
  { id: 'tests-local', text: 'All tests pass locally', done: false },
  { id: 'version', text: 'Version bumped in package.json', done: false },
  { id: 'changelog', text: 'CHANGELOG or release notes updated', done: false },
  { id: 'ci', text: 'CI pipeline is green on the release branch', done: false },
  { id: 'review', text: 'Code review completed and feedback addressed', done: false },
  { id: 'tag', text: 'Release tag created and pushed', done: false },
];

function checklistPath(customPath) {
  if (customPath) return path.resolve(customPath);
  return path.join(process.cwd(), DEFAULT_FILENAME);
}

function loadChecklist(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('Checklist file must contain a JSON array of items');
  }
  for (const item of data) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.id !== 'string' ||
      typeof item.text !== 'string' ||
      typeof item.done !== 'boolean'
    ) {
      throw new Error('Each item must have string id, string text, and boolean done');
    }
  }
  return data;
}

function saveChecklist(filePath, items) {
  fs.writeFileSync(filePath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

function formatList(items) {
  const lines = items.map((item, index) => {
    const mark = item.done ? '[x]' : '[ ]';
    const n = index + 1;
    return `${mark} ${n}. ${item.text} (${item.id})`;
  });
  return lines.join('\n');
}

function findItemIndex(items, ref) {
  const trimmed = String(ref).trim();
  if (!trimmed) return -1;
  const asNum = parseInt(trimmed, 10);
  if (
    String(asNum) === trimmed &&
    asNum >= 1 &&
    asNum <= items.length
  ) {
    return asNum - 1;
  }
  const byId = items.findIndex((i) => i.id === trimmed);
  return byId;
}

function setItemDone(items, ref, done) {
  const idx = findItemIndex(items, ref);
  if (idx < 0) return { ok: false, message: `Unknown item: ${ref}` };
  const next = items.map((item, i) =>
    i === idx ? { ...item, done: Boolean(done) } : item
  );
  return { ok: true, items: next, index: idx };
}

function statusLine(items) {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  return `${done}/${total} complete`;
}

function printHelp() {
  const text = `release-checklist — track a small JSON checklist in the repo root

Usage:
  checklist [options] <command>

Commands:
  init [--file <path>] [--force]   Write default checklist (refuses if file exists)
  list [--file <path>]             Print all items
  check <ref> [--file <path>]      Mark item done (ref: 1-based index or item id)
  uncheck <ref> [--file <path>]    Mark item not done
  status [--file <path>]           Print completion summary

Options:
  --help, -h                       Show this help

Default file: ${DEFAULT_FILENAME} in the current working directory.
`;
  process.stdout.write(text);
}

function parseArgs(argv) {
  const args = [...argv];
  const opts = { file: null, force: false };
  const positional = [];

  while (args.length) {
    const a = args.shift();
    if (a === '--help' || a === '-h') {
      opts.help = true;
      continue;
    }
    if (a === '--file') {
      const v = args.shift();
      if (!v) throw new Error('--file requires a path');
      opts.file = v;
      continue;
    }
    if (a === '--force') {
      opts.force = true;
      continue;
    }
    if (a.startsWith('--file=')) {
      opts.file = a.slice('--file='.length);
      continue;
    }
    positional.push(a);
  }

  return { opts, positional };
}

function run(argv) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`${e.message}\n`);
    return 1;
  }

  const { opts, positional } = parsed;
  if (opts.help || positional.length === 0) {
    printHelp();
    return positional.length === 0 && !opts.help ? 1 : 0;
  }

  const cmd = positional[0];
  const filePath = checklistPath(opts.file);

  try {
    if (cmd === 'init') {
      if (fs.existsSync(filePath) && !opts.force) {
        process.stderr.write(
          `Refusing to overwrite existing file: ${filePath} (use --force)\n`
        );
        return 1;
      }
      saveChecklist(filePath, defaultItems());
      process.stdout.write(`Wrote ${filePath}\n`);
      return 0;
    }

    if (!fs.existsSync(filePath)) {
      process.stderr.write(
        `No checklist file at ${filePath}. Run: checklist init\n`
      );
      return 1;
    }

    let items = loadChecklist(filePath);

    if (cmd === 'list') {
      process.stdout.write(`${formatList(items)}\n`);
      return 0;
    }

    if (cmd === 'status') {
      process.stdout.write(`${statusLine(items)}\n`);
      return 0;
    }

    if (cmd === 'check' || cmd === 'uncheck') {
      const ref = positional[1];
      if (!ref) {
        process.stderr.write(`Usage: checklist ${cmd} <index-or-id>\n`);
        return 1;
      }
      const wantDone = cmd === 'check';
      const result = setItemDone(items, ref, wantDone);
      if (!result.ok) {
        process.stderr.write(`${result.message}\n`);
        return 1;
      }
      items = result.items;
      saveChecklist(filePath, items);
      process.stdout.write(`${formatList(items)}\n`);
      return 0;
    }

    process.stderr.write(`Unknown command: ${cmd}\n`);
    printHelp();
    return 1;
  } catch (e) {
    process.stderr.write(`${e.message}\n`);
    return 1;
  }
}

module.exports = {
  defaultItems,
  checklistPath,
  loadChecklist,
  saveChecklist,
  formatList,
  findItemIndex,
  setItemDone,
  statusLine,
  run,
  DEFAULT_FILENAME,
};
