var Color = require('color')

module.exports = Context2D

function Context2D (canvas) {
  this._canvas = canvas
  this.fillStyle = 'rgb(0,0,0)'
}

var proto = Context2D.prototype

proto.getImageData = function (x, y, width, height) {
  var gl = this._canvas._gl
  var pixels = new Uint8Array(width * height * 4)
  if (!gl) {
    return {
      width: width,
      height: height,
      data: new Uint8ClampedArray(pixels.buffer)
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

function compileShader (gl, type, src) {
  var shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  return shader
}

function setupShader (gl, VERT_SRC, FRAG_SRC) {
  var fragShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
  var vertShader = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)

  var program = gl.createProgram()
  gl.attachShader(program, fragShader)
  gl.attachShader(program, vertShader)
  // Attribute 0 is the one enterGL saves and restores.
  gl.bindAttribLocation(program, 0, 'p')
  gl.linkProgram(program)
  gl.deleteShader(fragShader)
  gl.deleteShader(vertShader)

  return program
}

function enterGL (ctx, proc) {
  var gl = ctx._canvas._gl
  if (!gl) {
    return
  }

  var prevFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING)
  var prevViewport = gl.getParameter(gl.VIEWPORT)
  var prevProgram = gl.getParameter(gl.CURRENT_PROGRAM)
  var prevBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING)
  var prevTexture = gl.getParameter(gl.TEXTURE_BINDING_2D)
  var prevScissorTest = gl.isEnabled(gl.SCISSOR_TEST)
  var prevScissorBox = gl.getParameter(gl.SCISSOR_BOX)

  var prevVABuffer = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING)
  var prevVAEnabled = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_ENABLED)
  var prevVASize = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_SIZE)
  var prevVAStride = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_STRIDE)
  var prevVAType = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_TYPE)
  var prevVANormal = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED)
  var prevVAOffset = gl.getVertexAttribOffset(0, gl.VERTEX_ATTRIB_ARRAY_POINTER)

  proc(gl)

  // WebGL rejects vertexAttribPointer with no buffer bound, and without one there's no pointer to restore.
  if (prevVABuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, prevVABuffer)
    gl.vertexAttribPointer(0, prevVASize, prevVAType, prevVANormal, prevVAStride, prevVAOffset)
  }
  if (prevVAEnabled) {
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
  if (prevScissorTest) {
    gl.enable(gl.SCISSOR_TEST)
  } else {
    gl.disable(gl.SCISSOR_TEST)
  }
  gl.scissor(
    prevScissorBox[0],
    prevScissorBox[1],
    prevScissorBox[2],
    prevScissorBox[3])
  gl.useProgram(prevProgram)
  gl.bindTexture(gl.TEXTURE_2D, prevTexture)
  gl.bindBuffer(gl.ARRAY_BUFFER, prevBuffer)
}

proto.putImageData = function (imgData, dx, dy) {
  var width = imgData.width
  var height = imgData.height
  enterGL(this, function (gl) {
    var tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      imgData.data)
    // WebGL 1 can only sample a non-power-of-two texture with these.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // Rows aren't flipped, as in getImageData: row j of imgData goes to GL row dy + j.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.disable(gl.SCISSOR_TEST)
    gl.viewport(dx, dy, width, height)

    // One triangle that covers the whole viewport.
    var buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      3, -1,
      -1, 3
    ]), gl.STATIC_DRAW)

    var program = setupShader(gl,
      [ 'attribute vec2 p;',
        'varying vec2 t;',
        'void main() { t = p * 0.5 + 0.5; gl_Position = vec4(p, 0, 1); }'
      ].join('\n'),
      [ '#ifdef GL_FRAGMENT_PRECISION_HIGH',
        'precision highp float;',
        '#else',
        'precision mediump float;',
        '#endif',
        'uniform sampler2D tex;',
        'varying vec2 t;',
        'void main() { gl_FragColor = texture2D(tex, t); }'
      ].join('\n'))

    gl.useProgram(program)
    gl.uniform1i(gl.getUniformLocation(program, 'tex'), gl.getParameter(gl.ACTIVE_TEXTURE) - gl.TEXTURE0)

    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    gl.drawArrays(gl.TRIANGLES, 0, 3)

    gl.deleteProgram(program)
    gl.deleteTexture(tex)
    gl.deleteBuffer(buffer)
  })
}

proto.fillRect = function (x, y, w, h) {
  var color = Color(this.fillStyle)
  // A negative width or height extends the rect left or up from (x, y).
  // Rows aren't flipped: getImageData reads GL row y as canvas row y.
  var x0 = Math.round(Math.min(x, x + w))
  var y0 = Math.round(Math.min(y, y + h))
  var x1 = Math.round(Math.max(x, x + w))
  var y1 = Math.round(Math.max(y, y + h))
  enterGL(this, function (gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.enable(gl.SCISSOR_TEST)
    gl.scissor(x0, y0, x1 - x0, y1 - y0)
    gl.clearColor(color.red() / 255, color.green() / 255, color.blue() / 255, color.alpha())
    gl.clear(gl.COLOR_BUFFER_BIT)
  })
}
