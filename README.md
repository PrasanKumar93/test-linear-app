# test-linear-app

## Health Report CLI

This repository ships a minimal dependency-free CLI that surfaces a JSON health report for smoke validation.

### Usage

```bash
node bin/health-report.js
```

The command prints a pretty JSON payload that includes system metadata, memory readings, and a couple of simple health checks.

### Development

- `npm test` — runs the node-based test suite that validates the CLI output shape.
