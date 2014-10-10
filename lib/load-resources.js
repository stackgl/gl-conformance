'use strict'

module.exports = loadResources

var glob = require('glob')
var fs   = require('fs')
var path = require('path')

var RESOURCES = require('./resources.json')

function loadResourcesDir(baseDir, pattern, result, cb) {
  var failed = false
  var count  = 0

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

  console.log('loading resources in:', baseDir + '/' + pattern)

  glob(pattern, { cwd: baseDir }, function(err, files) {
    if(err) {
      fail(err)
      return
    }
    count = files.length
    files.forEach(function(file) {
      var filePath = path.join(baseDir, file)
      console.log("reading resource:", filePath)
      fs.readFile(filePath, function(err, data) {
        if(err) {
          fail(err)
          return
        }
        if(failed) {
          return
        }
        result[file] = data.toString('base64')
        next()
      })
    })
  })
}

function loadResources(suiteDir, cb) {
  var count = RESOURCES.length
  var failed = false
  var result = {}
  RESOURCES.forEach(function(pattern) {
    loadResourcesDir(suiteDir, pattern, result, function(err, files) {
      if(failed) {
        return
      }
      if(err) {
        failed = true
        cb(err)
        return
      }
      if(--count === 0) {
        cb(null, result)
        return
      }
    })
  })
}