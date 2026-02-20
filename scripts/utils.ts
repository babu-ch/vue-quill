const fs = require('fs-extra')
const path = require('path')
const logger = require('./logger')
const { gzipSync } = require('zlib')
const { compress } = require('brotli')

const rootDir = path.resolve(__dirname, '..')
const packagesDir = path.resolve(rootDir, 'packages')

const targets: string[] = fs.readdirSync(packagesDir).filter((targetDir: string) => {
  const pkgDir = path.resolve(packagesDir, targetDir)
  if (!fs.statSync(pkgDir).isDirectory()) {
    return false
  }
  const pkgPath = path.resolve(pkgDir, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    return false
  }
  const pkg = require(pkgPath)
  if (pkg.private && !pkg.buildOptions) {
    return false
  }
  return true
})

function getPackageDir(target: string) {
  return path.resolve(packagesDir, target)
}

function getPackageJson(target = '') {
  const pkgPath =
    target === ''
      ? path.resolve(rootDir, 'package.json')
      : path.resolve(packagesDir, target, 'package.json')

  if (!fs.existsSync(pkgPath)) return null
  return require(pkgPath)
}

function getAssetsConfigJson(target = '') {
  const pkgPath = path.resolve(packagesDir, target, 'assets.config.json')
  if (!fs.existsSync(pkgPath)) return null
  return require(pkgPath)
}

function fuzzyMatchTarget(
  allTargets: string[],
  partialTargets: string[],
  includeAllMatching?: boolean
) {
  const matched: string[] = []
  partialTargets.forEach((partialTarget) => {
    if (!allTargets) return
    for (const target of allTargets) {
      if (target.match(partialTarget)) {
        matched.push(target)
        if (!includeAllMatching) {
          break
        }
      }
    }
  })
  if (matched.length) {
    return matched
  } else {
    console.log()
    const chalk = require('chalk')
    logger.error(partialTargets, `Target ${chalk.underline(partialTargets)} not found!`)
    process.exit(1)
  }
}

async function runParallel(
  maxConcurrency: number,
  source: string[],
  iteratorFn: (target: string) => Promise<void>
) {
  const ret: Promise<void>[] = []
  const executing: Promise<void>[] = []
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item))
    ret.push(p)

    if (maxConcurrency <= source.length) {
      const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1))
      executing.push(e)
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing)
      }
    }
  }
  return Promise.all(ret)
}

function checkBuildSize(target: string) {
  const pkgDir = getPackageDir(target)
  logger.table([getTableSize(`${pkgDir}/dist/${target}.global.prod.js`)])
}

function checkAssetsSize(target: string, ext = '.css') {
  const pkgDir = getPackageDir(target)
  const distDir = path.resolve(pkgDir, 'dist')
  const tableSizes: any[] = []
  fs.readdir(distDir, (err: string, files: string[]) => {
    if (err) logger.error(target, 'Unable to scan directory: ' + err)
    files.forEach((file: string) => {
      if (file.includes(`prod${ext}`) && path.extname(file) === ext) {
        tableSizes.push(getTableSize(path.resolve(distDir, file)))
      }
    })
    if (tableSizes.length) logger.table(tableSizes)
  })
}

function getTableSize(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return
  }
  const file = fs.readFileSync(filePath)
  const filename = path.basename(filePath)
  const minSize = (file.length / 1024).toFixed(2) + 'kb'
  const gzipped = gzipSync(file)
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb'
  const compressed = compress(file)
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb'
  return { filename: filename, min: minSize, gzip: gzippedSize, brotli: compressedSize }
}

module.exports = {
  rootDir,
  packagesDir,
  targets,
  getPackageDir,
  getPackageJson,
  getAssetsConfigJson,
  fuzzyMatchTarget,
  runParallel,
  checkBuildSize,
  checkAssetsSize,
  getTableSize,
}
