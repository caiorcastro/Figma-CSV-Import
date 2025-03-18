import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const production = !process.env.ROLLUP_WATCH;

export default [
  // Configuração para o código do plugin
  {
    input: 'src/code.ts',
    output: {
      file: 'dist/code.js',
      format: 'iife',
      name: 'app',
    },
    plugins: [
      typescript(),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
      production && terser(),
      
      // Gera o arquivo HTML para a UI
      {
        name: 'generate-html',
        writeBundle() {
          writeFileSync(
            'dist/ui.html',
            require('fs').readFileSync('src/ui/ui.html', 'utf8')
          );
        }
      }
    ]
  }
];
