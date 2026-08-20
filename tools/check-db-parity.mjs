/*
  Guards against the two db.js versions drifting apart. It strips the
  packaging lines from each file and compares what remains, so a fix
  applied to one and forgotten in the other fails loudly.
*/
import fs from 'node:fs';

// Reduce a file to its logic by removing wrapper and export lines and
// normalising the global reference and indentation.
function normalise(source) {
  return source
    // Drop the blocks that legitimately exist in one version only.
    .replace(/\/\/ --- vanilla only: begin ---[\s\S]*?\/\/ --- vanilla only: end ---/g, '')
    /*
      Packaging blocks hold the prose that HAS to differ between the two
      files: each one describes how it is loaded and what it exposes. They
      carry no logic, so stripping them keeps the comparison honest while
      letting each file describe itself truthfully in the submission PDF.
    */
    .replace(/\/\/ --- packaging: begin ---[\s\S]*?\/\/ --- packaging: end ---/g, '')
    .replace(/^\(function \(root\) \{$/m, '')
    .replace(/^\}\(typeof window === 'undefined' \? globalThis : window\)\);$/m, '')
    .replace(/^\s*root\.db = \{[\s\S]*?\};$/m, '')
    .replace(/^export \{[^}]*\};$/m, '')
    .replace(/\broot\./g, 'window.')
    // Trim and drop blank lines so packaging-only whitespace differences
    // between the two files never register as a logic difference.
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

const vanilla = normalise(fs.readFileSync('vanilla-test/db.js', 'utf8'));
const module_ = normalise(fs.readFileSync('src/db/db.js', 'utf8'));

if (vanilla === module_) {
  console.log('PASS  the two db.js versions carry identical logic');
  process.exit(0);
}

// No exact match: point at exactly where the two files diverge instead of
// just failing, so the fix does not require a manual diff.
console.log('FAIL  the two db.js versions have drifted apart');
const a = vanilla.split('\n');
const b = module_.split('\n');
let index = 0;
// Walk both normalised outputs together until a differing line turns up
// or one file runs out first.
while (index < Math.max(a.length, b.length)) {
  if (a[index] !== b[index]) {
    // Report using 1-based line numbers, matching how editors count lines.
    console.log('first difference at logical line ' + (index + 1));
    console.log('  vanilla: ' + a[index]);
    console.log('  module : ' + b[index]);
    break;
  }
  // No mismatch yet at this position, so advance to the next line pair.
  index = index + 1;
}
process.exit(1);
