/*
  Runs the browser assertion suite under Node by supplying the two browser
  globals db.js depends on. Development tool only. It is excluded from the
  submission PDF because it is not part of the delivered application.
*/
import fs from 'node:fs';
import path from 'node:path';

// Minimal in-memory stand-in for the Web Storage API.
class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

globalThis.window = globalThis;
globalThis.localStorage = new MemoryStorage();

// Load the vanilla library and the suite the same way a browser would.
const root = process.cwd();
const files = ['vanilla/db.js', 'vanilla/self-test.js'];
files.forEach((relative) => {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  // eslint-disable-next-line no-new-func
  new Function(source).call(globalThis);
});

const result = globalThis.runSelfTest(globalThis.db);
result.lines.forEach((line) => console.log(line));
console.log('passed=' + result.passed + ' failed=' + result.failed);
process.exit(result.failed === 0 ? 0 : 1);
