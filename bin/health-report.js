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

function evaluateChecks(memory) {
  const freeRatio = memory.totalMB > 0 ? memory.freeMB / memory.totalMB : 0;
  const loadAverage = readMetric(() => os.loadavg(), [0, 0, 0]);
  const cpuCount = readCpuCount();

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
  return {
    status: 'ok',
    generatedAt: new Date().toISOString(),
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      uptimeSeconds: readMetric(() => Math.round(os.uptime()), 0),
      cpuCount: readCpuCount()
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
