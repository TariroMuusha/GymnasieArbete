import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default [
	{
		input: 'public/client.ts',
		output: {
			format: 'iife',
			sourcemap: true,
			dir: 'public/',
		},
		plugins: [
			resolve({
				browser: true,
			}),

			commonjs(),

			typescript({
				module: 'ES2015',
				sourceMap: !production,
				inlineSources: !production,
			}),

			production && terser({ format: { comments: false } }),
		],
	},
	{
		input: 'server/index.ts',
		output: {
			name: 'server',
			format: 'cjs',
			file: 'server/index.js',
		},
		plugins: [
			resolve({
				preferBuiltins: true,
				browser: false,
			}),

			commonjs(),

			typescript({
				sourceMap: !production,
				allowSyntheticDefaultImports: true,
				strictNullChecks: false,
				importHelpers: false,
			}),

			production && terser({ format: { comments: false } }),
		],
	},
];
