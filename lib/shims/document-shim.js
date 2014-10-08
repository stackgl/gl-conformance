module.exports = createFakeDocument

function FakeDocument(environment) {
  this.__ENV = environment
}

var proto = FakeDocument.prototype

function scanList(list, id) {
  for(var i=0; i<list.length; ++i) {
    if(list[i].id === id) {
      return list[i]
    }
  }
  return null
}

proto.getElementById = function(id) {
  var canvas = scanList(this.__ENV.canvasList, id)
  if(canvas) {
    canvas.toDataURL = function() {}
    canvas.addEventListener = function() {}
    return canvas
  }
  var script = this.__ENV.scriptList[id]
  if(script) {
    return script
  }
  return {}
}

proto.createElement = function(type) {
  switch(type) {
    case 'canvas':
      return {
        toDataURL: function() { return '' },
        addEventListener: function() {}
      }
  }
  return {}
}

function createFakeDocument(environment) {
  return new FakeDocument(environment)
}