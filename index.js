'use strict'

const { promisify } = require('util')
const json = promisify(require('body/json'))
const fs = require('fs')
const tmpdir = require('os').tmpdir()
const mkdir = promisify(require('fs').mkdir)
const exec = promisify(require('child_process').exec)
const unlink = promisify(require('fs').unlink)
const writeFile = promisify(require('fs').writeFile)
const pipe = require('promisepipe')

module.exports = async (req, res) => {
  const pkg = await json(req, res)
  const cwd = `${tmpdir}/${Date.now()}${Math.random()
    .toString(16)
    .slice(2)}`
  await mkdir(cwd)
  await writeFile(`${cwd}/package.json`, JSON.stringify(pkg))
  await exec('npm install', { cwd })
  await unlink(`${cwd}/package.json`)
  await exec(`tar -zcf ${cwd}.zip .`, { cwd })
  await pipe(fs.createReadStream(`${cwd}.zip`), res)
}
