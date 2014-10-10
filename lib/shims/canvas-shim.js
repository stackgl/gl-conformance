'use strict'

module.exports = createCanvas

function CanvasShim(environment, width, height, id) {
  this.environment = environment
  this.width = width
  this.height = height
  this.id = id
}

var proto = CanvasShim.prototype

proto.toDataURL = function() {
  return ''
}

proto.addEventListener = function() {}

proto.getContext = function(type, options) {
  if(type === 'webgl' || type === 'experimental-webgl') {
    var gl = this.environment.createContext(
      this.width,
      this.height,
      options)
    gl.canvas = this
    return gl
  }
  return null
}

function createCanvas(environment, options) {
  options = options || {}
  return new CanvasShim(
    environment,
    options.width || 500,
    options.height || 500,
    options.id || '')
}