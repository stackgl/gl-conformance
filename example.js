var tape    = require('tape')
var runTest = require('./run-test')

function filter(caseName) {
  return caseName > "textures_tex-sub-image-2d-bad-args"
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