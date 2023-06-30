import { defineConfig } from 'tsup'
import pkg from './package.json'
import fs from 'fs'

fs.createReadStream('../README.md').pipe(fs.createWriteStream('./README.md'))
export default defineConfig(() => {
  return {
    entryPoints: ['src/index.ts'],
    format: ['esm', 'cjs'],
    skipNodeModulesBundle: true,
    platform: 'node',
    splitting: false,
    minify: true,
    sourcemap: false,
    clean: true,
    dts: false,
    define: {
      'process.env.NODE_ENV': '"production"',
      __TEST__: 'false',
    },
    banner: {
      js: `/**\n * name: ${pkg.name}\n * version: ${pkg.version}\n */`,
    },
  }
})
