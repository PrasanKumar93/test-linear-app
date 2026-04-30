# test-linear-app

## Health Report CLI

This repository ships a minimal dependency-free CLI that surfaces a JSON health report for smoke validation.

### Usage

```bash
# Text summary (default)
node bin/health-report.js

# Machine-readable JSON payload
node bin/health-report.js --json
```

The default text report summarizes key system metrics and health checks. Passing `--json` emits a compact object with timestamp, platform, uptime, CPU and memory data for easy ingestion.

### Development

- `npm test` — runs the node-based test suite that validates the CLI output shape.
