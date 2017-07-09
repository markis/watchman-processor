const typescript = require('rollup-plugin-typescript');

module.exports = {
  entry: './src/index.ts',
  dest: 'index.js',
  format: 'cjs',
  moduleName: 'watchmanProcessor',
  sourceMap: true,
  context: 'this',
  external: [
    'chai',
    'child_process',
    'fb-watchman',
    'fs',
    'inversify',
    'path',
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