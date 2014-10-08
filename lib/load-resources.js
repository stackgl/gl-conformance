'use strict'

module.exports = loadResources

var ls   = require('ls-stream')
var fs   = require('fs')
var path = require('path')

function loadResources(directory, cb) {
  var failed = false
  var result = {}
  var count  = 1

  function fail(err) {
    if(failed) {
      return
    }
    cb(err || new Error('error'))
    failed = true
  }

  function next() {
    if(failed) {
      return
    }
    if(--count === 0) {
      cb(null, result)
      return
    }
  }

  ls(directory)
    .on('data', function(file) {
      if(failed) {
        return
      }
      count += 1
      fs.readFile(file.path, function(err, data) {
        if(err) {
          fail(err)
          return
        }
        result[path.relative(directory, file.path)] = data.toString('base64')
        next()
      })
    })
    .on('error', function(err) {
      fail(err)
    })
    .on('end', function() {
      next()
    })
}