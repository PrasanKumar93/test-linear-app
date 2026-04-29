#!/usr/bin/env node
'use strict';

const os = require('os');

function formatNumber(value) {
  return Number.parseFloat(value.toFixed(2));
}

function calculateMemory() {
  const total = os.totalmem();
  const free = os.freemem();
  return {
    totalMB: Math.round(total / 1024 / 1024),
    freeMB: Math.round(free / 1024 / 1024),
    utilization: formatNumber(((total - free) / total) * 100)
  };
}

function evaluateChecks(memory) {
  const freeRatio = memory.freeMB / memory.totalMB;
  const loadAverage = os.loadavg();

  return [
    {
      name: 'memory.freeRatio',
      status: freeRatio > 0.1 ? 'pass' : 'warn',
      detail: `Free ${(freeRatio * 100).toFixed(1)}%`
    },
    {
      name: 'cpu.load1',
      status: loadAverage[0] < os.cpus().length ? 'pass' : 'warn',
      detail: `${formatNumber(loadAverage[0])}`
    }
  ];
}

function buildHealthReport() {
  const memory = calculateMemory();
  return {
    status: 'ok',
    generatedAt: new Date().toISOString(),
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      uptimeSeconds: Math.round(os.uptime()),
      cpuCount: os.cpus().length
    },
    memory,
    checks: evaluateChecks(memory)
  };
}

function main() {
  const report = buildHealthReport();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildHealthReport
};
