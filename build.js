'use strict'

var rimraf = require('rimraf')
var mkdirp = require('mkdirp')

//Build conformance test suite
var scanFiles = require('./lib/scan-files')
var parseCase = require('./lib/parse-case')
var genCase   = require('./lib/compile-case')

function fail(err) {
  console.error(err)
  process.exit(-1)
}

function build() {
  scanFiles(function(err, files) {
    if(err) {
      fail(err)
    } else {
      files.forEach(function(file) {
        parseCase(file, function(err, result) {
          if(err) {
            fail(err)
          } else {
            console.log(genCase(result))
          }
        })
      })
    }
  })
}

//Clear directory and run build
rimraf('./node-test', function() {
  mkdirp('./node-test', build)
})