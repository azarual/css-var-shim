// rollup.config.js
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/index.js',
  format: 'umd',
  moduleName: 'cssVarShim',
  dest: 'index.js',
  plugins: [
    uglify()
  ]
};
