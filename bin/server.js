'use strict'

const handle = require('..')
const http = require('http')

const port = process.env.PORT || 8000

http
  .createServer((req, res) => {
    handle(req, res).catch(err => {
      const log = err.stack || err.message
      console.error(log)
      res.statusCode = 500
      res.end(log)
    })
  })
  .listen(port, () => {
    console.log(`-> http://localhost:${port}`)
  })
