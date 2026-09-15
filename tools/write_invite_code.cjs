'use strict';

// Writes the derived, shareable invitation to an ignored private file without
// printing either it or the signing secret to logs.
const fs = require('node:fs');
const path = require('node:path');
const {loadConfig} = require('../server/reading-service.cjs');

const output = path.resolve(__dirname, '..', 'server', 'invite-code.txt');
const config = loadConfig(process.env);
if (!/^[A-HJ-NP-Z2-9]{8}$/.test(config.inviteCode)) {
  process.stderr.write('A valid server signing secret is required. The private invitation file was not changed.\n');
  process.exit(1);
}
fs.writeFileSync(output, `${config.inviteCode}\n`, {encoding: 'utf8', mode: 0o600});
fs.chmodSync(output, 0o600);
process.stdout.write('Private 8-character invitation written to server/invite-code.txt.\n');
