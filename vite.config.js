import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The exact two lines of the hand-written XHTML 1.0 Strict doctype, used
// both to detect it before Vite's parse step and to restore it after.
const XHTML_DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"\n'
  + '  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';

/*
  Vite's build:html plugin parses index.html with parse5 and hard-fails on
  any doctype it does not recognise as plain HTML5 (parse5 error code
  non-conforming-doctype is not in Vite's small allowlist of ignorable
  parse errors). Swap the XHTML 1.0 Strict doctype for the HTML5 one
  before Vite's own parse runs, so the build does not crash on a doctype
  that is perfectly valid XHTML but not valid HTML5.
*/
function preserveXhtmlDoctype() {
  return {
    name: 'preserve-xhtml-doctype',
    // Plugin hook runs before Vite's parse; swap XHTML for HTML5 so parse5 succeeds.
    transformIndexHtml: {
      // 'pre' order ensures this hook fires before Vite's parser, not after.
      order: 'pre',
      handler(html) {
        return html.replace(XHTML_DOCTYPE, '<!DOCTYPE html>');
      }
    }
  };
}

/*
  Vite injects crossorigin on the emitted module script and on every
  modulepreload link. The crossorigin attribute is not part of the
  XHTML 1.0 Strict DTD, so the built page would fail validation.
  This plugin removes it from the emitted HTML after Vite writes it, and
  restores the real doctype that preserveXhtmlDoctype swapped out above.
*/
function stripCrossOrigin() {
  return {
    name: 'strip-crossorigin',
    enforce: 'post',
    // Run after Vite's build to clean up injected attributes and restore the doctype.
    transformIndexHtml(html) {
      // remove the attribute whether or not it carries a value
      const withoutCrossOrigin = html.replace(/\scrossorigin(=["'][^"']*["'])?/g, '');
      // restore the XHTML 1.0 Strict doctype for the emitted file
      const restored = withoutCrossOrigin.replace(/^<!DOCTYPE html>/, XHTML_DOCTYPE);
      // Fail loudly if restore did not match; silent no-op would ship wrong doctype.
      if (restored === withoutCrossOrigin) {
        throw new Error(
          'XHTML doctype restore failed: dist/index.html would ship bare HTML5 doctype'
        );
      }
      // This returned string is what Vite writes to dist, so the XHTML doctype ships in the file W3C validates.
      return restored;
    }
  };
}

export default defineConfig({
  plugins: [react(), preserveXhtmlDoctype(), stripCrossOrigin()],
  build: {
    outDir: 'dist'
  }
});
