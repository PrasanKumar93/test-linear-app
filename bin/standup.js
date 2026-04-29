#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { summarizeStandup } from '../src/standup.js';

const HELP_TEXT = `Usage: standup-summary [options]

Options:
  --file, -f <path>   Read standup entries from a JSON file (array of objects)
  --json <string>     Provide a JSON string containing the entries
  --help, -h          Show this help message and exit

Example JSON entry:
{
  "name": "Avery",
  "yesterday": "wrapped up the API",
  "today": "triaging documentation",
  "blockers": "none"
}

Piped input is also supported when no --file/--json flag is supplied.
`;

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file' || arg === '-f') {
      options.file = argv[++i];
      continue;
    }
    if (arg === '--json') {
      options.inlineJson = argv[++i];
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function readFromStdin() {
  const { stdin } = process;
  if (stdin.isTTY) {
    return '';
  }
  let data = '';
  for await (const chunk of stdin) {
    data += chunk;
  }
  return data;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.log(HELP_TEXT);
    process.exit(1);
  }

  if (options.help) {
    console.log(HELP_TEXT);
    return;
  }

  let rawPayload = options.inlineJson ?? '';
  if (!rawPayload && options.file) {
    try {
      rawPayload = await readFile(options.file, 'utf8');
    } catch (error) {
      console.error(`Failed to read file ${options.file}: ${error.message}`);
      process.exit(1);
    }
  }

  if (!rawPayload) {
    rawPayload = await readFromStdin();
  }

  if (!rawPayload.trim()) {
    console.error('No standup data was provided.');
    console.log(HELP_TEXT);
    process.exit(1);
  }

  let entries;
  try {
    entries = JSON.parse(rawPayload);
  } catch (error) {
    console.error('Could not parse standup JSON:', error.message);
    process.exit(1);
  }

  try {
    const summary = summarizeStandup(entries);
    console.log(summary);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

await main();
