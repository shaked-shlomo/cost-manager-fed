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

const vanillaSource = fs.readFileSync('vanilla-test/db.js', 'utf8');
const moduleSource = fs.readFileSync('src/db/db.js', 'utf8');

/*
  The two sentinel pairs are holes in this check: anything inside one is
  stripped before comparison, so logic hidden in a block would drift
  unnoticed and this tool would still report PASS. Contain them before
  comparing anything. Each file gets exactly one packaging block and it
  must sit in the header, and only the vanilla file may carry vanilla
  only blocks at all.
*/
const HEADER_LINE_LIMIT = 20;

function countOccurrences(source, needle) {
  return source.split(needle).length - 1;
}

function checkSentinels(label, source, allowVanillaOnly) {
  const problems = [];

  // One packaging block per file, no more and no fewer.
  const packagingStarts = countOccurrences(source, '// --- packaging: begin ---');
  const packagingEnds = countOccurrences(source, '// --- packaging: end ---');
  if (packagingStarts !== 1 || packagingEnds !== 1) {
    problems.push(label + ' has ' + packagingStarts + ' packaging begin and ' +
      packagingEnds + ' packaging end markers, expected exactly 1 of each');
  }

  // Packaging prose belongs in the header. Anywhere else it is a hiding place.
  const beforeMarker = source.split('// --- packaging: begin ---')[0];
  const markerLine = beforeMarker.split('\n').length;
  if (packagingStarts === 1 && markerLine > HEADER_LINE_LIMIT) {
    problems.push(label + ' opens its packaging block at line ' + markerLine +
      ', past the header limit of ' + HEADER_LINE_LIMIT);
  }

  // Only the vanilla file fetches, so only it may carry vanilla only blocks.
  const vanillaStarts = countOccurrences(source, '// --- vanilla only: begin ---');
  const vanillaEnds = countOccurrences(source, '// --- vanilla only: end ---');
  if (vanillaStarts !== vanillaEnds) {
    problems.push(label + ' has unbalanced vanilla only markers: ' +
      vanillaStarts + ' begin, ' + vanillaEnds + ' end');
  }
  if (allowVanillaOnly === false && vanillaStarts > 0) {
    problems.push(label + ' carries ' + vanillaStarts +
      ' vanilla only block(s); the module version must have none');
  }
  return problems;
}

const sentinelProblems = checkSentinels('vanilla-test/db.js', vanillaSource, true)
  .concat(checkSentinels('src/db/db.js', moduleSource, false));

if (sentinelProblems.length > 0) {
  console.log('FAIL  the parity sentinels are not contained');
  sentinelProblems.forEach((problem) => console.log('  ' + problem));
  process.exit(1);
}

const vanilla = normalise(vanillaSource);
const module_ = normalise(moduleSource);

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
