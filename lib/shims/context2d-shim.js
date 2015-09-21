'use strict'

module.exports = Context2D

function Context2D(canvas) {
  this._canvas = canvas
}

var proto = Context2D.prototype

proto.getImageData = function(x, y, width, height) {
  var gl = this._canvas._gl
  var pixels = new Uint8Array(width * height * 4)
  if(!gl) {
    return {
      width:  width,
      height: height,
      data:   new Uint8ClampedArray(pixels.buffer)
    }
  }

  var fbo = gl.getParameter(gl.FRAMEBUFFER_BINDING)
  var viewport = gl.getParameter(gl.VIEWPORT)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, this._canvas._width, this._canvas._height)

  gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3])

  return {
    width: width,
    height: height,
    data: new Uint8ClampedArray(pixels.buffer)
  }
}

function compileShader(gl, type, src) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader
}

function setupShader(gl, VERT_SRC, FRAG_SRC) {
  var fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
  var vertShader = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)

  var program = gl.createProgram()
  gl.attachShader(program, fragShader)
  gl.attachShader(program, vertShader)
  gl.linkProgram(program)

  return program
}

proto.putImageData = function(x, y, imgData) {
  var gl = this._canvas._gl
  if(!gl) {
    return
  }

  var prevFBO       = gl.getParameter(gl.FRAMEBUFFER_BINDING)
  var prevViewport  = gl.getParameter(gl.VIEWPORT)
  var prevTex       = gl.getParameter(gl.TEXTURE_BINDING_2D)
  var prevProgram   = gl.getParameter(gl.CURRENT_PROGRAM)
  var prevBuffer    = gl.getParameter(gl.ARRAY_BUFFER_BINDING)

  var prevVABuffer  = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING)
  var prevVAEnabled = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_ENABLED)
  var prevVASize    = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_SIZE)
  var prevVAStride  = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_STRIDE)
  var prevVAType    = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_TYPE)
  var prevVANormal  = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED)
  var prevVAOffset  = gl.getVertexAttribOffset(0, gl.VERTEX_ATTRIB_ARRAY_POINTER)

  var tex = gl.createTexture()
  gl.enable(gl.TEXTURE_2D)
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(
    gl.TEXTURE_2D,
    gl.RGBA,
    imgData.width,
    imgData.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    imgData.data)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(x, y, this._width-x, this._height-y)

  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BYFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -2, -2,
     2, -2,
    -2,  2,
    -2, -2,
    -2,  2,
     2, -2
  ]))

  var program = setupShader(gl,
    [ 'attribute vec2 p;',
      'void main() { gl_Position = vec4(p, 0, 1); }'
    ].join('\n'),
    [ 'precision mediump float;',
      'uniform sampler2D tex;',
      'uniform vec2 scale;',
      'void main(){gl_FragColor=texture2D(tex,gl_FragCoord.xy/scale);}'
    ].join('\n'))

  gl.useProgram(program)

  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, gl.FALSE, 0, 0)

  gl.drawArrays(gl.TRIANGLES, 0, 3)

  gl.bindBuffer(gl.ARRAY_BUFFER, prevVABuffer)
  gl.vertexAttribPointer(0, prevVASize, prevVAType, prevVANormal, prevVAStride, prevVAOffset)
  if(prevVAEnabled) {
    gl.enableVertexAttribArray(0)
  } else {
    gl.disableVertexAttribArray(0)
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, prevFBO)
  gl.viewport(
    prevViewport[0],
    prevViewport[1],
    prevViewport[2],
    prevViewport[3])
  gl.useProgram(prevProgram)
  gl.bindTexture(gl.TEXTURE_2D, prevTexture)
  gl.bindBuffer(gl.ARRAY_BUFFER, prevBuffer)

  gl.deleteTexture(tex)
  gl.deleteBuffer(buffer)
}
