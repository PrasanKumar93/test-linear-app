# test-linear-app

Small, dependency-free Node.js helper to track a release checklist stored as JSON on disk.

## Requirements

- Node.js 18 or newer (uses `node:test` and built-in modules only)

## Install (local)

From the repository root:

```bash
npm test
```

To run the CLI without a global install:

```bash
node bin/checklist.js --help
```

Optional: link the binary (npm creates a shim that invokes Node with this package’s `bin` entry):

```bash
npm link
checklist --help
```

## Usage

Default checklist file: `.release-checklist.json` in the current working directory. Override with `--file <path>` on any command.

| Command | Description |
|--------|-------------|
| `checklist init` | Write the default checklist items (fails if the file already exists; use `--force` to overwrite) |
| `checklist list` | Print every item with `[ ]` / `[x]`, numeric order, and id |
| `checklist status` | Print `done/total complete` |
| `checklist check <ref>` | Mark an item done (`ref` is 1-based index or item `id`) |
| `checklist uncheck <ref>` | Mark an item not done |

Examples:

```bash
checklist init
checklist list
checklist check 1
checklist check version
checklist status
checklist init --file ./tmp/checklist.json --force
```

Checklist JSON is an array of objects: `{ "id": string, "text": string, "done": boolean }`.
