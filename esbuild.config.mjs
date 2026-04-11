import esbuild from 'esbuild';
import sveltePlugin from 'esbuild-svelte';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = process.argv.includes('production');

/** @type {esbuild.BuildOptions} */
const options = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: production,
  sourcemap: !production,
  format: 'cjs',
  target: 'es2016',
  external: ['obsidian', 'electron'],
  logLevel: 'info',
  outfile: 'main.js',
  plugins: [
    sveltePlugin()
  ],
  loader: {
    '.ttf': 'file'
  }
};

esbuild.build(options).catch((e) => {
  console.error(e);
  process.exit(1);
});

