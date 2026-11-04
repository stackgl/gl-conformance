module.exports = createFakeDocument

var createCanvas = require('./canvas-shim')
var createBody = require('./body-shim')

function FakeDocument (environment) {
  this.__ENV = environment
  this.body = createBody(this)
}

var proto = FakeDocument.prototype

// Elements other than canvases only show results in a browser, so they take children without doing anything.
function createElement () {
  return {
    style: {},
    appendChild: function (child) {
      return child
    }
  }
}

function scanList (list, id) {
  for (var i = 0; i < list.length; ++i) {
    if (list[i].id === id) {
      return list[i]
    }
  }
  return null
}

proto.getElementById = function (id) {
  var canvas = scanList(this.__ENV.canvasList, id)
  if (canvas) {
    return canvas
  }
  var script = this.__ENV.scriptList[id]
  if (script) {
    return script
  }
  // Every test page has an element with the id console, where a browser shows the results.
  if (id === 'console') {
    return createElement()
  }
  return null
}

proto.getElementsByTagName = function (tag) {
  if (tag === 'title') {
    return [
      {innerText: ''}
    ]
  }
  return []
}

proto.createElement = function (type) {
  switch (type) {
    case 'canvas':
      return createCanvas(this.__ENV)
  }
  return createElement()
}

proto.createTextNode = function (text) {
  return { textContent: text }
}

function createFakeDocument (environment) {
  return new FakeDocument(environment)
}
