var typescript = require('rollup-plugin-typescript');

module.exports = {
  entry: './src/index.ts',
  dest: 'index.js',
  format: 'cjs',
  moduleId: 'watchman-processor',
  moduleName: 'watchmanProcessor',
  sourceMap: true,
  context: 'this',
  external: [
    'chai',
    'chalk',
    'child_process',
    'fb-watchman',
    'fs',
    'inversify',
    'path',
    'node-emoji',
    'sinon',
    'reflect-metadata',
    'ts-helpers',
    'tslib'
  ],
  plugins: [
    typescript({
      typescript: require('typescript')
    }),
  ]
};