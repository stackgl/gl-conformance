var tape    = require('tape')
var runTest = require('./run-test')

function filter(caseName) {
  return caseName.indexOf('more') >= 0 && 
         caseName > 'more_functions_texSubImage2DHTML'
}

runTest({
  tape: tape,
  createContext: function(width, height, options) {
    var canvas    = document.createElement('canvas')
    canvas.width  = width
    canvas.height = height
    var context   = canvas.getContext('webgl', options)
    return context
  },
  filter: filter
})