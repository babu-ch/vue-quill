/* eslint-env node */
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { defineConfig } from 'rolldown'
import nodePolyfills from '@rolldown/plugin-node-polyfills'
import { dts } from 'rolldown-plugin-dts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}

const packagesDir = path.resolve(__dirname, 'packages')
const pkgDir = path.resolve(packagesDir, process.env.TARGET)
const name = path.basename(pkgDir)
const resolve = (file) => path.resolve(pkgDir, file)
const pkg = require(resolve(`package.json`))
const rootPkg = require(path.resolve(__dirname, 'package.json'))
const packageOptions = pkg.buildOptions || {}
const masterVersion = process.env.NEXT_VERSION || rootPkg.version

let banner = `/*!
 * ${pkg.buildOptions.name} ${pkg.name} v${masterVersion}
 * ${pkg.homepage || 'https://github.com/babu-ch/vue-quill'}
 * `

banner += pkg.dependencies?.quill?.match(/\d(.*)/)[0]
  ? `
 * Includes quill v${pkg.dependencies?.quill?.match(/\d(.*)/)[0]}
 * https://quilljs.com/
 * `
  : ''

banner += `
 * Copyright (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} license
 * Date: ${new Date().toISOString()}
 */`

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'esm',
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: 'esm',
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs',
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: 'umd',
  },
}

const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = process.env.PROD_ONLY
  ? []
  : packageFormats.map((format) => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach((format) => {
    if (packageOptions.prod === false) {
      return
    }
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format))
    }
    if (/^(global|esm-browser)?/.test(format)) {
      packageConfigs.push(createMinifiedConfig(format))
    }
  })
}

if (process.env.TYPES) {
  const entryFile = path.resolve(pkgDir, 'src/index.ts')
  const dtsExternalPrefixes = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]
  packageConfigs.push(
    defineConfig({
      input: entryFile,
      external: (id) =>
        dtsExternalPrefixes.some((ext) => id === ext || id.startsWith(ext + '/')),
      plugins: [dts({ tsconfig: path.resolve(__dirname, 'tsconfig.json'), eager: true })],
      output: {
        dir: resolve('dist'),
        format: 'esm',
        entryFileNames: `${name}.d.ts`,
      },
    })
  )
}

export default packageConfigs

function createConfig(format, output, minify = false) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  const isProductionBuild =
    process.env.__DEV__ === 'false' || /\.prod\.js$/.test(output.file)
  const isBundlerESMBuild = /esm-bundler/.test(format)
  const isBrowserESMBuild = /esm-browser/.test(format)
  const isNodeBuild = format === 'cjs'
  const isGlobalBuild = /global/.test(format)

  if (isGlobalBuild) output.name = packageOptions.name
  if (isGlobalBuild || isNodeBuild) output.exports = 'named'

  let external = []
  let globals = {}

  if (isGlobalBuild || isBrowserESMBuild) {
    external = ['vue']
    globals = { vue: 'Vue' }
  } else {
    // Node / esm-bundler builds. Externalize everything.
    external = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]
  }

  output.sourcemap = !!process.env.SOURCE_MAP
  output.banner = banner
  output.globals = globals

  // Define replacements (replaces @rollup/plugin-replace)
  const define = {
    __COMMIT__: JSON.stringify(process.env.COMMIT || ''),
    __VERSION__: JSON.stringify(masterVersion),
    __DEV__: isBundlerESMBuild
      ? `(process.env.NODE_ENV !== 'production')`
      : String(!isProductionBuild),
    __TEST__: 'false',
    __BROWSER__: String(isGlobalBuild || isBrowserESMBuild || isBundlerESMBuild),
    __GLOBAL__: String(isGlobalBuild),
    __ESM_BUNDLER__: String(isBundlerESMBuild),
    __ESM_BROWSER__: String(isBrowserESMBuild),
    __NODE_JS__: String(isNodeBuild),
    __FEATURE_SUSPENSE__: 'true',
    __FEATURE_OPTIONS_API__: isBundlerESMBuild ? '__VUE_OPTIONS_API__' : 'true',
    __FEATURE_PROD_DEVTOOLS__: isBundlerESMBuild
      ? '__VUE_PROD_DEVTOOLS__'
      : 'false',
  }

  const entryFile = path.resolve(pkgDir, 'src/index.ts')

  const plugins = []

  // Add node polyfills for browser builds
  if (isGlobalBuild || isBrowserESMBuild) {
    plugins.push(nodePolyfills())
  }

  return defineConfig({
    input: entryFile,
    external,
    plugins,
    // Built-in define via transform (replaces @rollup/plugin-replace)
    transform: {
      define,
    },
    output: {
      ...output,
      minify,
    },
    // Built-in TypeScript support via Oxc
    resolve: {
      tsconfigFilename: path.resolve(__dirname, 'tsconfig.json'),
    },
    onwarn: (warning) => {
      if (!/Circular/.test(warning.message)) {
        console.warn(warning.message)
      }
    },
    treeshake: true,
  })
}

function createProductionConfig(format) {
  return createConfig(
    format,
    {
      file: resolve(`dist/${name}.${format}.prod.js`),
      format: outputConfigs[format].format,
    },
    true
  )
}

function createMinifiedConfig(format) {
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format,
    },
    true
  )
}
