'use strict'

const { promisify } = require('util')
const json = promisify(require('body/json'))
const tmpdir = require('os').tmpdir()
const mkdir = promisify(require('fs').mkdir)
const cp = require('child_process')
const unlink = promisify(require('fs').unlink)
const writeFile = promisify(require('fs').writeFile)
const pipe = require('promisepipe')

const spawnAsync = (...args) =>
  new Promise((resolve, reject) => {
    const ps = cp.spawn(...args)
    ps.on('error', reject)
    ps.on('exit', resolve)
  })

module.exports = async (req, res) => {
  console.error(`${req.method.toUpperCase()} ${req.url}`)
  const pkg = await json(req, res)
  const cwd = `${tmpdir}/${Date.now()}${Math.random()
    .toString(16)
    .slice(2)}`
  await mkdir(cwd)
  await writeFile(`${cwd}/package.json`, JSON.stringify(pkg))
  await spawnAsync('npm', ['install'], { cwd, stdio: 'inherit' })
  await unlink(`${cwd}/package.json`)
  await pipe(cp.spawn('tar', ['-zc', '.'], { cwd }).stdout, res)
}
