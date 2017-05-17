import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/bundle.js',
  format: 'cjs',
  plugins: [ 
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    uglify(),
    commonjs()
  ],
  dest: 'dist/bundle.js'
};