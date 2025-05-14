// rollup.config.mjs
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import copyWatch from 'rollup-plugin-copy-watch';
import serve from 'rollup-plugin-serve';

const isWatch = process.env.ROLLUP_WATCH === 'true';
const production = false;
const copyPlugin = isWatch ? copyWatch : copy;

export const extension = {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'es',
        sourcemap: true,
    },
    plugins: [
        resolve({ browser: true, preferBuiltins: false }),
        commonjs(),
        // css(),
        // json(),
        typescript({
            tsconfig: 'tsconfig.base.json',
            compilerOptions: {
                module: 'esnext',
                lib: ['ESNext', 'DOM', 'DOM.Iterable'],
                target: 'ES2020',
            },
            filterRoot: 'src',
            include: [
                'WebExtension/**/*.ts',
                'types/**/*.ts',
                'sd_parsers/**/*.ts',
                'services/**/*.ts',
                'lib/**/*.ts',
                '**/*.ts',
            ],
            exclude: ['node_modules', 'dist', 'release'],
        }),
        copyPlugin({
            flatten: false,
            targets: [
                {
                    src: 'src/**/*.{css,png,json,html}',
                    dest: 'dist',
                },
            ],
        }),
        isWatch && serve(),
    ],
    watch: {
        clearScreen: false,
    },
    external: [],
};

export default [extension];
