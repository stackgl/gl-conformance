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
    return this.environment.createContext(
      this.width,
      this.height,
      options)
  }
  return null
}

function createCanvas(environment, options) {
  options = options || {}
  return new CanvasShim(
    environment,
    options.width || 512,
    options.height || 512,
    options.id || '')
}