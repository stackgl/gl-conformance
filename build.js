'use strict'

var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var fs     = require('fs')
var path   = require('path')

//Build conformance test suite
var scanFiles = require('./lib/scan-files')
var parseCase = require('./lib/parse-case')
var genCase   = require('./lib/compile-case')

function fail(err) {
  console.error(err)
  process.exit(-1)
}

function writeManifest(fileList) {
  var code = [ 'module.exports=[' ]
  for(var i=0; i<fileList.length; ++i) {
    if(i > 0) {
      code.push(',')
    }
    code.push('["', fileList[i], '",require("./', fileList[i], '")]')
  }
  code.push(']')
  var codeStr = code.join('')
  fs.writeFile('./node-test/index.js', codeStr)
  console.log('done!')
}

function build() {
  scanFiles(function(err, files) {
    if(err) {
      fail(err)
    } else {
      var count = files.length
      var fileList = []
      files.forEach(function(file) {
        parseCase(file, function(err, result) {
          if(err) {
            fail(err)
          } else {
            count -= 1
            var str = genCase(result)
            if(str) {
              var fileName = result.caseName
              fs.writeFile(path.join('./node-test', fileName) + '.js' , str) 
              fileList.push(fileName)
            }
            if(count === 0) {
              writeManifest(fileList)
            }
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