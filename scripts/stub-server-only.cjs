const path = require('path');
const resolved = require.resolve('server-only');
require.cache[resolved] = {
  id: resolved, filename: resolved, loaded: true,
  parent: null, children: [], path: path.dirname(resolved), exports: {},
};
