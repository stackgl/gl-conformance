'use strict'

module.exports = createCanvas

var Context2D = require('./context2d-shim')

function CanvasShim(environment, width, height, id) {
  this.environment = environment
  this._width  = width
  this._height = height
  this.id = id
  this._has2d = false
}

var proto = CanvasShim.prototype

proto.toDataURL = function() {
  return ''
}

proto.addEventListener = function() {}

proto.getContext = function(type, options) {
  if(!this._gl) {
    var gl = this.environment.createContext(
      this._width,
      this._height,
      options)
    gl.canvas = this
    this._gl = gl
  }
  if(type === 'webgl' || type === 'experimental-webgl') {
    if(this._has2d) {
      return null
    }
    return this._gl
  }
  if(type === '2d') {
    this._has2d = true
    if(this._2d) {
      return this._2d
    }
    return this._2d = new Context2D(this)
  }
  return null
}

Object.defineProperties(proto, {
  width: {
    get: function() {
      return ((this._gl && this._gl.drawingBufferWidth) || this._width)|0
    },
    set: function(w) {
      if(this._gl) {
        if(this._gl.resize) {
          this._gl.resize(w, this._gl.drawingBufferHeight)
        }
        return this._gl.drawingBufferWidth
      } else {
        return this._width = w
      }
    }
  },
  height: {
    get: function() {
      return ((this._gl && this._gl.drawingBufferHeight) || this._height)|0
    },
    set: function(h) {
      if(this._gl) {
        if(this._gl.resize) {
          this._gl.resize(this._gl.drawingBufferWidth, h)
        }
        return this._gl.drawingBufferHeight
      } else {
        return this._height = h
      }
    }
  }
})

function createCanvas(environment, options) {
  options = options || {}
  return new CanvasShim(
    environment,
    options.width || 500,
    options.height || 500,
    options.id || '')
}
