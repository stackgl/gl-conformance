var path = require("path").posix
var canvas = null

var getUrlOptions = function() {
  return {}
};

var readFile = function(file) {
  var buf = new Buffer(ENVIRONMENT.RESOURCES[path.join('resources', file)], 'base64')
  var text = buf.toString()
  return text.replace(/\r/g, "");
};

var getBasePath = function() {
  return ''
};

var create3DContext = function(opt_canvas, opt_attributes, opt_version) {
  var width = 500
  var height = 500
  if (!opt_version) {
    opt_version = parseInt(getUrlOptions().webglVersion, 10) || 1;
  }
  // TODO: WebGL 2 support
  if(opt_canvas) {
    if(typeof opt_canvas === 'string') {
      var canvasList = ENVIRONMENT.canvasList
      for(var i=0; i<canvasList.length; ++i) {
        if(canvasList[i].id === opt_canvas) {
          width  = canvasList[i].width  || 500
          height = canvasList[i].height || 500
          var ctx = ENVIRONMENT.createContext(width, height, opt_attributes)
          if (!Object.hasOwn(ctx, 'canvas')) {
            ctx.canvas = canvasList[i]
          }
          ctx.canvas._gl = ctx
          canvas = ctx.canvas
          return ctx
        }
      }
    } else {
      width  = opt_canvas.width  || 512
      height = opt_canvas.height || 512
      var ctx = ENVIRONMENT.createContext(width, height, opt_attributes)
      if (!Object.hasOwn(ctx, 'canvas')) {
        ctx.canvas = opt_canvas
      }
      ctx.canvas._gl = ctx
      canvas = ctx.canvas
      return ctx
    }
  }
  var ctx        = ENVIRONMENT.createContext(width, height, opt_attributes)
  canvas     = document.createElement("canvas")
  if (!Object.hasOwn(ctx, 'canvas')) {
    ctx.canvas = canvas
  }
  ctx.canvas._gl = ctx
  return ctx
}

var setZeroTimeout = function(fn) {
  setTimeout(fn, 0)
};

var insertImage = function(element, caption, img) {
};

var addShaderSource = function(element, label, source, opt_url) {
};

var glTypeToTypedArrayType = function(gl, type) {
  switch (type) {
      case gl.BYTE:
          return Int8Array;
      case gl.UNSIGNED_BYTE:
          return Uint8Array;
      case gl.SHORT:
          return Int16Array;
      case gl.UNSIGNED_SHORT:
      case gl.UNSIGNED_SHORT_5_6_5:
      case gl.UNSIGNED_SHORT_4_4_4_4:
      case gl.UNSIGNED_SHORT_5_5_5_1:
          return Uint16Array;
      case gl.INT:
          return Int32Array;
      case gl.UNSIGNED_INT:
          return Uint32Array;
      default:
          throw 'unknown gl type ' + glEnumToString(gl, type);
  }
};

var loadTextFileAsync = function(url, callback) {
  setTimeout(function() {
    var file = ENVIRONMENT.RESOURCES[path.join(ENVIRONMENT.BASEPATH, url)]
    if(file) {
      var buf = new Buffer(file, 'base64')
      callback(true, buf.toString())
    } else {
      throw new Error('error loading file: ' + url)
    }
  }, 1)
};

var requestAnimFrame = function(callback, element) {
  if (!_requestAnimFrame) {
    _requestAnimFrame = function() {
      return function(callback, element) {
           return setTimeout(callback, 1000 / 70);
        };
    }();
  }

  return _requestAnimFrame(callback, element);
};
