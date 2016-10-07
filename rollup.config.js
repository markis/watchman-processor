var typescript = require('rollup-plugin-typescript');

module.exports = {
  entry: './src/index.ts',
  dest: 'index.js',
  format: 'cjs',
  moduleId: 'watchman-processor',
  moduleName: 'watchmanProcessor',
  external: [
    'chalk',
    'child_process',
    'fb-watchman',
    'fs',
    'inversify',
    'node-emoji',
    'reflect-metadata'
  ],
  globals: {
    'chalk': 'chalk',
    'child_process': 'proc',
    'fb-watchman': 'watchman',
    'fs': 'fs',
    'inversify': 'inversify',
    'node-emoji': 'emoji',
    'reflect-metadata': 'reflectMetadata'
  },
  plugins: [
    typescript({
      typescript: require('typescript')
    }),
  ]
};