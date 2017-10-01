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
  const id = `${Date.now()}${Math.random()
    .toString(16)
    .slice(2)}`
  console.log(`[${id}] ${req.method.toUpperCase()} ${req.url}`)
  const pkg = await json(req, res)
  const type = pkg.lockfileVersion ? 'package-lock.json' : 'package.json'
  console.log(`[${id}] ${type} received`)
  const cwd = `${tmpdir}/${id}`
  await mkdir(cwd)
  await writeFile(`${cwd}/${type}`, JSON.stringify(pkg))
  await spawnAsync('npm', ['install'], { cwd, stdio: 'inherit' })
  console.log(`[${id}] dependencies installed`)
  await unlink(`${cwd}/${type}`)
  await pipe(cp.spawn('tar', ['-zc', '.'], { cwd }).stdout, res)
  console.log(`[${id}] response finished`)
}
