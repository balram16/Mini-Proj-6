
// This file will be used to define custom npm scripts
// since we can't modify package.json directly

const { series, concurrent, rimraf } = require('nps-utils');

module.exports = {
  scripts: {
    default: 'nps start',
    start: {
      default: 'vite',
      client: 'vite',
      server: 'nodemon src/server/index.js',
      dev: {
        default: concurrent.nps('start.client', 'start.server'),
      },
    },
    seed: 'node src/server/seed/seed.js',
    clean: {
      default: rimraf('node_modules'),
      build: rimraf('dist'),
    },
    build: 'vite build',
  },
};
