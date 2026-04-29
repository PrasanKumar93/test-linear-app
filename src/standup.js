const DEFAULT_NAME = 'Unnamed teammate';
const DEFAULT_NOTE = 'Not specified';
const DEFAULT_BLOCKER = 'None';

export function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new TypeError('Each standup entry must be an object.');
  }

  const name = String(entry.name ?? DEFAULT_NAME).trim();
  const yesterday = String(entry.yesterday ?? DEFAULT_NOTE).trim();
  const today = String(entry.today ?? DEFAULT_NOTE).trim();
  const blockers = String(entry.blockers ?? DEFAULT_BLOCKER).trim();

  return {
    name: name || DEFAULT_NAME,
    yesterday: yesterday || DEFAULT_NOTE,
    today: today || DEFAULT_NOTE,
    blockers: blockers || DEFAULT_BLOCKER
  };
}

function formatEntry(entry, index) {
  return [
    `${index + 1}. ${entry.name}`,
    `   Yesterday: ${entry.yesterday}`,
    `   Today: ${entry.today}`,
    `   Blockers: ${entry.blockers}`
  ].join('\n');
}

export function summarizeStandup(entries) {
  if (!Array.isArray(entries)) {
    throw new TypeError('Standup summaries require an array of entries.');
  }

  if (entries.length === 0) {
    return 'Standup Summary (0 updates)\nNo standup entries were provided.';
  }

  const normalized = entries.map(normalizeEntry);
  const summaryLines = normalized.map(formatEntry);

  return [
    `Standup Summary (${normalized.length} updates)`,
    '----------------------------',
    summaryLines.join('\n\n')
  ].join('\n\n');
}
