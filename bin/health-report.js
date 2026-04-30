#!/usr/bin/env node
'use strict';

const os = require('os');

function formatNumber(value) {
  return Number.parseFloat(value.toFixed(2));
}

function readMetric(reader, fallback) {
  try {
    return reader();
  } catch {
    return fallback;
  }
}

function readCpuCount() {
  return readMetric(() => os.cpus().length, 1);
}

function readLoadAverage() {
  return readMetric(() => os.loadavg(), [0, 0, 0]);
}

function calculateMemory() {
  const total = readMetric(() => os.totalmem(), 0);
  const free = readMetric(() => os.freemem(), 0);
  if (total <= 0) {
    return {
      totalMB: 0,
      freeMB: 0,
      utilization: 0
    };
  }

  return {
    totalMB: Math.round(total / 1024 / 1024),
    freeMB: Math.round(free / 1024 / 1024),
    utilization: formatNumber(((total - free) / total) * 100)
  };
}

function evaluateChecks(memory, loadAverage, cpuCount) {
  const freeRatio = memory.totalMB > 0 ? memory.freeMB / memory.totalMB : 0;

  return [
    {
      name: 'memory.freeRatio',
      status: freeRatio > 0.1 ? 'pass' : 'warn',
      detail: `Free ${(freeRatio * 100).toFixed(1)}%`
    },
    {
      name: 'cpu.load1',
      status: loadAverage[0] < cpuCount ? 'pass' : 'warn',
      detail: `${formatNumber(loadAverage[0])}`
    }
  ];
}

function buildHealthReport() {
  const memory = calculateMemory();
  const loadAverage = readLoadAverage();
  const cpuCount = readCpuCount();
  const uptimeSeconds = readMetric(() => Math.round(os.uptime()), 0);

  return {
    status: 'ok',
    generatedAt: new Date().toISOString(),
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      uptimeSeconds,
      cpuCount,
      loadAverage
    },
    memory,
    checks: evaluateChecks(memory, loadAverage, cpuCount)
  };
}

function buildJsonPayload(report) {
  return {
    generatedAt: report.generatedAt,
    platform: report.system.platform,
    uptimeSeconds: report.system.uptimeSeconds,
    loadAverage: report.system.loadAverage,
    memory: report.memory,
    cpuCount: report.system.cpuCount
  };
}

function formatTextReport(report) {
  const loadAvg = report.system.loadAverage
    .map(value => formatNumber(value))
    .join(', ');
  const lines = [
    `Health Report: ${report.status}`,
    `Generated At: ${report.generatedAt}`,
    `Hostname: ${report.system.hostname}`,
    `Platform: ${report.system.platform} ${report.system.release}`,
    `Uptime Seconds: ${report.system.uptimeSeconds}`,
    `CPU Count: ${report.system.cpuCount}`,
    `Load Average (1m,5m,15m): ${loadAvg}`,
    `Memory: total ${report.memory.totalMB} MB, free ${report.memory.freeMB} MB, utilization ${report.memory.utilization}%`,
    'Checks:'
  ];

  report.checks.forEach(check => {
    lines.push(`- ${check.name}: ${check.status} (${check.detail})`);
  });

  return `${lines.join('\n')}\n`;
}

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
    help: argv.includes('--help')
  };
}

function printHelp() {
  const lines = [
    'usage: node bin/health-report.js [--json] [--help]',
    '',
    '  Default: print a human-readable health summary (text) to stdout.',
    '',
    '  --json    Print the same metrics as JSON instead of text.',
    '',
    '  --help    Show this message and exit without collecting metrics.'
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);

  if (options.help) {
    printHelp();
    return;
  }

  const report = buildHealthReport();

  if (options.json) {
    const payload = buildJsonPayload(report);
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  process.stdout.write(formatTextReport(report));
}

if (require.main === module) {
  main();
}

module.exports = {
  buildHealthReport
};
