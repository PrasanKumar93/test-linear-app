# test-linear-app

This repository now ships a dependency-free **standup summary helper** implemented in Node.js. It provides a reusable module for generating human-readable updates plus a CLI (`standup-summary`) that can ingest JSON blobs and print a tidy recap of the team.

## Usage

1. Install dependencies (none to add, but this sets up `package-lock.json` when you first install):

   ```sh
   npm install
   ```

2. Craft a JSON file containing an array of standup entries. Each entry can have `name`, `yesterday`, `today`, and `blockers` fields. Example:

   ```json
   [
     {
       "name": "Avery",
       "yesterday": "finished feature QA",
       "today": "pair on rollout",
       "blockers": "waiting for the API to merge"
     },
     {
       "name": "Priya",
       "yesterday": "wrote smoke automation",
       "today": "monitoring deployment",
       "blockers": "none"
     }
   ]
   ```

3. Run the CLI:

   ```sh
   standup-summary --file path/to/updates.json
   ```

   You can also pipe JSON directly or pass it via `--json '<payload>'`. The tool will exit with a helpful message when the payload is missing or malformed.

4. To update or reuse the core logic programmatically, import the `summarizeStandup` function from `src/standup.js` and pass in an array of entries.

## Testing

- Run `npm test` to execute the `node:test` suite and validate the formatting helpers.

## CLI behavior

- Running `standup-summary --help` prints usage instructions.
- The CLI enforces a simple two-line header and formats each entry with labeled lanes for yesterday/today/blockers, substituting defaults when fields are omitted.
