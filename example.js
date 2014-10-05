'use strict'

var tape    = require('tape')
var runTest = require('./run-test')

runTest({
  tape: tape,
  createContext: function(width, height, options) {
    var canvas    = document.createElement('canvas')
    canvas.width  = width
    canvas.height = height
    var context   = canvas.getContext('webgl', options)
    return context
  }
})